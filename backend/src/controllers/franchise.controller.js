import { Vendor } from "../models/Vendor.model.js";
import { Franchise } from "../models/Franchise.model.js";
import { User } from "../models/User.model.js";
import { getHashPassword } from "../utils/getPassword.js";
import { generateUniqueReferralCode } from "../utils/referralGenerator.js";

/**
 * @desc Create a new user (with 'franchise-admin' role) and a corresponding franchise profile
 * @route POST /api/franchises
 * @access Private/Admin, Franchise-Admin (only if a Franchise-Admin can create sub-franchises)
 */
export const createFranchise = async (req, res) => {
  const {
    franchiseName,
    location,      // This is the location string for the franchise
    address,       // NEW: Specific address for the franchise
    franchisePincode, // NEW: Pincode specific to the franchise
    ownerName,
    ownerEmail,
    ownerPhone,
    ownerPassword,
    ownerPincode,  // Pincode for the franchise-admin user
    referredByCode,
    salesRepId,
    kycDocumentImage, // NEW: kycDocumentImage for the ownerUser
  } = req.body;

  try {
    // --- Step 1: Create the User Document for the new Franchise Admin ---

    // 1.1 Basic validation for new user creation
    if (
      !franchiseName ||
      !location ||
      !address || // Added address validation
      !franchisePincode || // Added franchisePincode validation
      !ownerName ||
      !ownerEmail ||
      !ownerPassword ||
      !ownerPincode
    ) {
      return res.status(400).json({
        message:
          "Franchise name, location, address, franchise pincode, owner name, email, password, and owner pincode are required for the new franchise.",
      });
    }

    // 1.2 Check if a user with this email already exists
    let ownerUser = await User.findOne({ email: ownerEmail });
    if (ownerUser) {
      return res.status(400).json({
        message:
          "A user with this email already exists. Cannot create a new franchise with this owner email.",
      });
    }

    // 1.3 Hash the password for the new user
    const hashedPassword = await getHashPassword(ownerPassword);

    // 1.4 Generate unique referral code for the new user
    const referralCode = await generateUniqueReferralCode();

    // 1.5 Create the new User instance with 'franchise-admin' role
    ownerUser = new User({
      name: ownerName,
      email: ownerEmail,
      phone: ownerPhone,
      password: hashedPassword,
      pincode: ownerPincode, // This is the owner's personal pincode
      otp: { verified: true }, // Assuming OTP is verified for franchise admins
      isMember: false,
      referralCode,
      referredByCode: referredByCode || null,
      roles: ["franchise-admin"],
      kycDocumentImage: kycDocumentImage || [], // NEW: Assign kycDocumentImage here
    });

    // 1.6 If referred, link to parent and update parent's profileScore
    if (referredByCode) {
      const parentUser = await User.findOne({ referralCode: referredByCode });
      if (parentUser) {
        ownerUser.parent = parentUser._id;
        parentUser.profileScore += 10;
        await parentUser.save();
      } else {
        console.warn(
          `Referral code ${referredByCode} not found for new franchise owner user.`
        );
      }
    }

    await ownerUser.save(); // Save the new user document

    // --- Step 2: Handle Sales Representative Link ---

    let salesRepUser = null;
    if (salesRepId) {
      if (!mongoose.Types.ObjectId.isValid(salesRepId)) {
        await User.findByIdAndDelete(ownerUser._id); // Rollback user creation
        return res.status(400).json({ message: "Invalid sales representative ID format." });
      }
      salesRepUser = await User.findById(salesRepId);
      if (!salesRepUser || !salesRepUser.roles.includes("sales-rep")) {
        await User.findByIdAndDelete(ownerUser._id); // Rollback user creation
        return res.status(400).json({
          message:
            "Invalid sales representative ID or user is not a sales rep. User creation rolled back.",
        });
      }
    }

    // --- Step 3: Create the Franchise Document linked to the new User and Sales Rep ---

    // 3.1 Check if a franchise with this name already exists
    const existingFranchise = await Franchise.findOne({ franchiseName });
    if (existingFranchise) {
      await User.findByIdAndDelete(ownerUser._id); // Rollback user creation
      return res.status(400).json({
        message:
          "A franchise with this name already exists. User creation rolled back.",
      });
    }

    // 3.2 Create the new franchise document
    const franchise = new Franchise({
      franchiseName: franchiseName,
      location: location,
      address: address, // NEW: Assign address to the franchise
      pincode: franchisePincode, // NEW: Assign franchisePincode to the franchise
      ownerId: ownerUser._id, // Link to the newly created user (franchise admin)
      vendors: [], // Initially empty
      users: [], // Initially empty
      salesRep: salesRepUser ? salesRepUser._id : null,
    });

    await franchise.save(); // Save the new franchise document

    res.status(201).json({
      message: "Franchise and associated owner user created successfully",
      franchise: {
        _id: franchise._id,
        franchiseName: franchise.franchiseName,
        location: franchise.location,
        address: franchise.address,     // Include address in response
        pincode: franchise.pincode,     // Include franchise pincode in response
        ownerId: franchise.ownerId,
        salesRep: franchise.salesRep,
      },
      ownerUser: {
        _id: ownerUser._id,
        email: ownerUser.email,
        roles: ownerUser.roles,
        referralCode: ownerUser.referralCode,
        kycDocumentImage: ownerUser.kycDocumentImage, // Include kycDocumentImage in ownerUser response
      },
    });
  } catch (error) {
    console.error("Error creating franchise and owner user:", error);
    res
      .status(500)
      .json({ message: "Server error during franchise and user creation" });
  }
};


/**
 * @desc Get all franchises based on sales representative ID
 * @route GET /api/franchises/by-sales-rep
 * @access Private/Admin, Sales-Rep
 */
export const getFranchisesBySalesRep = async (req, res) => {
  const { salesRepId } = req.query; // Assuming salesRepId is passed as a query parameter

  if (!salesRepId) {
    return res
      .status(400)
      .json({ message: "Sales representative ID is required." });
  }

  try {
    // Optional: Validate if the salesRepId actually belongs to a sales rep user
    const salesRepUser = await User.findById(salesRepId);
    if (!salesRepUser || !salesRepUser.roles.includes("sales-rep")) {
      return res
        .status(400)
        .json({ message: "Provided ID is not a valid sales representative." });
    }

    // Directly find franchises associated with the salesRepId
    const franchises = await Franchise.find({ salesRep: salesRepId })
      .populate({
        path: "ownerId",
        select: "-password", // Exclude password
      })
      .populate({
        path: "vendors",
        populate: {
          path: "userId",
          select: "-password", // Exclude password from populated user
        },
      })
      .populate({
        path: "users",
        select: "-password", // Exclude password
      });

    if (!franchises || franchises.length === 0) {
      return res.status(404).json({
        message: "No franchises found for the given sales representative.",
      });
    }

    res.status(200).json(franchises);
  } catch (error) {
    console.error("Error fetching franchises by sales representative:", error);
    res
      .status(500)
      .json({ message: "Server error during fetching franchises." });
  }
};

/**
 * @desc Get all franchises
 * @route GET /api/franchises/getAll
 * @access Private/Admin
 */
export const getAllFranchises = async (req, res) => {
  try {
    const franchises = await Franchise.find({})
      .populate({
        path: "ownerId",
        select: "name email phone roles referralCode", // Select specific fields, exclude sensitive data
      })
      .populate({
        path: "salesRep",
        select: "name email phone", // Select specific fields for sales rep
      })
      .select("-vendors -users"); // Exclude large arrays like vendors and users unless explicitly needed

    if (!franchises || franchises.length === 0) {
      return res.status(404).json({ message: "No franchises found." });
    }

    res.status(200).json(franchises);
  } catch (error) {
    console.error("Error fetching all franchises:", error);
    res
      .status(500)
      .json({ message: "Server error during fetching franchises." });
  }
};
