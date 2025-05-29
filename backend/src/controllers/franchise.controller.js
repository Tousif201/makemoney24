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
    location,
    ownerName, // Name for the new franchise-admin user
    ownerEmail, // Email for the new franchise-admin user
    ownerPhone,
    ownerPassword,
    ownerPincode, // Pincode for the new franchise-admin user
    referredByCode, // For the new franchise-admin user's referral
    salesRepId, // NEW: ID of the sales representative associating with this franchise
  } = req.body;

  try {
    // --- Step 1: Create the User Document for the new Franchise Admin ---

    // 1.1 Basic validation for new user creation
    if (
      !franchiseName ||
      !location ||
      !ownerName ||
      !ownerEmail ||
      !ownerPassword ||
      !ownerPincode
    ) {
      return res.status(400).json({
        message:
          "Franchise name, location, owner name, email, password, and pincode are required for the new franchise.",
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
      pincode: ownerPincode,
      otp: { verified: true },
      isMember: false, // Franchise admins are typically not regular members
      referralCode,
      referredByCode: referredByCode || null,
      roles: ["franchise-admin"], // Explicitly set the role to 'franchise-admin'
    });

    // 1.6 If referred, link to parent and update parent's profileScore
    if (referredByCode) {
      const parentUser = await User.findOne({ referralCode: referredByCode });
      if (parentUser) {
        ownerUser.parent = parentUser._id;
        parentUser.profileScore += 10; // Example: Increment parent's profile score for referral
        await parentUser.save();
      } else {
        console.warn(
          `Referral code ${referredByCode} not found for new franchise owner user.`
        );
      }
    }

    await ownerUser.save(); // Save the new user document

    // --- Step 2: Handle Sales Representative Link (NEW) ---

    let salesRepUser = null;
    if (salesRepId) {
      salesRepUser = await User.findById(salesRepId);
      // Optional: Add a check to ensure salesRepUser actually has the 'sales-rep' role
      if (!salesRepUser || !salesRepUser.roles.includes("sales-rep")) {
        // Rollback user creation if salesRepId is invalid/not a sales rep
        await User.findByIdAndDelete(ownerUser._id);
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
      // If franchise name exists, consider rolling back the user creation or handling differently.
      // For now, we'll return an error.
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
      ownerId: ownerUser._id, // Link to the newly created user (franchise admin)
      vendors: [], // Initially empty
      users: [], // Initially empty
      salesRep: salesRepUser ? salesRepUser._id : null, // Assign sales rep if found
    });

    await franchise.save(); // Save the new franchise document

    res.status(201).json({
      message: "Franchise and associated owner user created successfully",
      franchise: {
        _id: franchise._id,
        franchiseName: franchise.franchiseName,
        location: franchise.location,
        ownerId: franchise.ownerId,
        salesRep: franchise.salesRep, // Include salesRep in the response
      },
      ownerUser: {
        _id: ownerUser._id,
        email: ownerUser.email,
        roles: ownerUser.roles,
        referralCode: ownerUser.referralCode,
      },
    });
  } catch (error) {
    console.error("Error creating franchise and owner user:", error);
    // If an error occurs after user creation but before franchise creation,
    // you might want to consider rolling back the user creation to prevent orphaned users.
    // However, for more robust handling, consider transactions.
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
