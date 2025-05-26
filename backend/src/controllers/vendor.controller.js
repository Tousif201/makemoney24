// ===================================
// File: controllers/vendor.controller.js
// ===================================

import { Vendor } from "../models/Vendor.model.js";
import { User } from "../models/User.model.js"; // Import User model to update roles
import { getHashPassword } from "../utils/getPassword.js";
import { generateUniqueReferralCode } from "../utils/referralGenerator.js";

/**
 * @desc Create a new user (with 'vendor' role) and a corresponding vendor profile
 * @route POST /api/vendors
 * @access Private/Admin, Franchise-Admin
 */
export const createVendor = async (req, res) => {
  const {
    name,
    email,
    phone,
    password,
    pincode,
    commissionRate,
    referredByCode, // For the new vendor user's referral
    salesRepId, // NEW: ID of the existing sales representative user
  } = req.body;

  try {
    // --- Step 1: Create the User Document for the new Vendor ---

    // 1.1 Basic validation for new user creation
    if (!name || !email || !password || !pincode) {
      return res
        .status(400)
        .json({
          message:
            "Name, email, password, and pincode are required for the new vendor user.",
        });
    }

    // 1.2 Check if a user with this email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({
          message:
            "A user with this email already exists. Cannot create a new vendor profile.",
        });
    }

    // 1.3 Hash the password for the new user
    const hashedPassword = await getHashPassword(password);

    // 1.4 Generate unique referral code for the new user
    const referralCode = await generateUniqueReferralCode();

    // 1.5 Create the new User instance with 'vendor' role
    user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      pincode,
      isMember: false, // Vendors are typically members
      referralCode,
      referredByCode: referredByCode || null,
      roles: ["vendor"], // Explicitly set the role to 'vendor'
    });

    // 1.6 If referred, link to parent and update parent's profileScore
    if (referredByCode) {
      const parentUser = await User.findOne({ referralCode: referredByCode });
      if (parentUser) {
        user.parent = parentUser._id;
        parentUser.profileScore += 10; // Example: Increment parent's profile score for referral
        await parentUser.save();
      } else {
        console.warn(
          `Referral code ${referredByCode} not found for new vendor user.`
        );
      }
    }

    await user.save(); // Save the new user document

    // --- Step 2: Handle Sales Representative Link (NEW) ---

    let salesRepUser = null;
    if (salesRepId) {
      salesRepUser = await User.findById(salesRepId);
      // Optional: Add a check to ensure salesRepUser actually has the 'sales-rep' role
      if (!salesRepUser || !salesRepUser.roles.includes("sales-rep")) {
        return res
          .status(400)
          .json({
            message:
              "Invalid sales representative ID or user is not a sales rep.",
          });
      }
    }

    // --- Step 3: Create the Vendor Document linked to the new User and Sales Rep ---

    // 3.1 Check if a vendor profile already exists for this new user (shouldn't happen)
    const existingVendor = await Vendor.findOne({ userId: user._id });
    if (existingVendor) {
      // This case should ideally not be hit.
      // In a production app, consider rolling back the user creation if this occurs.
      return res
        .status(400)
        .json({
          message: "Vendor profile unexpectedly already exists for this user.",
        });
    }

    // 3.2 Create the new vendor document
    const vendor = new Vendor({
      name: name, // Use user's name for vendor name
      userId: user._id, // Link to the newly created user
      pincode: pincode, // Use user's pincode for vendor pincode
      commissionRate: commissionRate || 10, // Use default if not provided
      salesRep: salesRepUser ? salesRepUser._id : null, // Assign sales rep if found
    });

    await vendor.save(); // Save the new vendor document

    res.status(201).json({
      message: "Vendor and associated user created successfully",
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        userId: vendor.userId,
        pincode: vendor.pincode,
        commissionRate: vendor.commissionRate,
        salesRep: vendor.salesRep, // Include salesRep in the response
      },
      user: {
        _id: user._id,
        email: user.email,
        roles: user.roles,
        referralCode: user.referralCode,
      },
    });
  } catch (error) {
    console.error("Error creating vendor and user:", error);
    res
      .status(500)
      .json({ message: "Server error during vendor and user creation" });
  }
};
/**
 * @desc Get all vendors
 * @route GET /api/vendors
 * @access Private/Admin, Franchise-Admin
 */
export const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({}).populate(
      "userId",
      "name email phone"
    ); // Populate user details
    res.status(200).json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Server error fetching vendors" });
  }
};

/**
 * @desc Get single vendor by ID
 * @route GET /api/vendors/:id
 * @access Private/Admin, Franchise-Admin, Vendor (self)
 */
export const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate(
      "userId",
      "name email phone"
    );

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Authorization check: Only admin/franchise-admin or the vendor themselves can view
    if (
      req.user.roles.includes("admin") ||
      req.user.roles.includes("franchise-admin") ||
      vendor.userId.toString() === req.user.id
    ) {
      res.status(200).json(vendor);
    } else {
      res
        .status(403)
        .json({ message: "Not authorized to view this vendor profile" });
    }
  } catch (error) {
    console.error("Error fetching vendor by ID:", error);
    // Handle CastError for invalid IDs
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid vendor ID" });
    }
    res.status(500).json({ message: "Server error fetching vendor" });
  }
};

/**
 * @desc Update vendor details
 * @route PUT /api/vendors/:id
 * @access Private/Admin, Franchise-Admin, Vendor (self)
 */
export const updateVendor = async (req, res) => {
  const { name, pincode, commissionRate } = req.body; // userId should not be updated via this route

  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Authorization check: Only admin/franchise-admin or the vendor themselves can update
    if (
      req.user.roles.includes("admin") ||
      req.user.roles.includes("franchise-admin") ||
      vendor.userId.toString() === req.user.id
    ) {
      vendor.name = name || vendor.name;
      vendor.pincode = pincode || vendor.pincode;
      vendor.commissionRate = commissionRate || vendor.commissionRate;

      const updatedVendor = await vendor.save();

      res.status(200).json({
        message: "Vendor updated successfully",
        vendor: {
          _id: updatedVendor._id,
          name: updatedVendor.name,
          userId: updatedVendor.userId,
          pincode: updatedVendor.pincode,
          commissionRate: updatedVendor.commissionRate,
        },
      });
    } else {
      res
        .status(403)
        .json({ message: "Not authorized to update this vendor profile" });
    }
  } catch (error) {
    console.error("Error updating vendor:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid vendor ID" });
    }
    res.status(500).json({ message: "Server error updating vendor" });
  }
};

/**
 * @desc Delete a vendor
 * @route DELETE /api/vendors/:id
 * @access Private/Admin, Franchise-Admin
 */
export const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Find the associated user and remove 'vendor' role
    const user = await User.findById(vendor.userId);
    if (user) {
      user.roles = user.roles.filter((role) => role !== "vendor");
      await user.save();
    }

    await vendor.deleteOne(); // Use deleteOne() for Mongoose 6+

    res.status(200).json({ message: "Vendor removed successfully" });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid vendor ID" });
    }
    res.status(500).json({ message: "Server error deleting vendor" });
  }
};

/**
 * @desc Get vendors assigned to a specific Sales Rep (ID provided in body)
 * @route POST /api/vendors/assigned-to-salesrep
 * @access Private/Admin, Franchise-Admin, Sales Rep (self-query only)
 */
export const getVendorsForSalesRep = async (req, res) => {
  const { salesRepId } = req.body; // Take salesRepId from request body

  try {
    // 1. Validate salesRepId
    if (!salesRepId) {
      return res
        .status(400)
        .json({ message: "salesRepId is required in the request body." });
    }
    if (!mongoose.Types.ObjectId.isValid(salesRepId)) {
      return res.status(400).json({ message: "Invalid salesRepId format." });
    }

    // 2. Fetch Vendors
    const vendors = await Vendor.find({ salesRep: salesRepId })
      .populate("userId", "name email phone")
      .populate("salesRep", "name email"); // Populate salesRep details for clarity

    if (vendors.length === 0) {
      return res
        .status(404)
        .json({
          message: `No vendors found assigned to sales representative with ID: ${salesRepId}.`,
        });
    }

    res.status(200).json(vendors);
  } catch (error) {
    console.error("Error fetching vendors for sales rep:", error);
    res
      .status(500)
      .json({ message: "Server error fetching assigned vendors." });
  }
};
