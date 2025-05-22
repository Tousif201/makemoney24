// ===================================
// File: controllers/vendor.controller.js
// ===================================

import { Vendor } from "../models/Vendor.model.js";
import { User } from "../models/User.model.js"; // Import User model to update roles

/**
 * @desc Create a new vendor
 * @route POST /api/vendors
 * @access Private/Admin, Franchise-Admin
 */
export const createVendor = async (req, res) => {
  const { name, userId, pincode, commissionRate } = req.body;

  try {
    // 1. Check if the associated user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Associated user not found" });
    }

    // 2. Check if a vendor profile already exists for this user
    const existingVendor = await Vendor.findOne({ userId });
    if (existingVendor) {
      return res.status(400).json({ message: "Vendor profile already exists for this user" });
    }

    // 3. Create the new vendor
    const vendor = new Vendor({
      name,
      userId,
      pincode,
      commissionRate: commissionRate || 10, // Use default if not provided
    });

    await vendor.save();

    // 4. Update the user's role to include 'vendor' if not already present
    if (!user.roles.includes("vendor")) {
      user.roles.push("vendor");
      await user.save();
    }

    res.status(201).json({
      message: "Vendor created successfully",
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        userId: vendor.userId,
        pincode: vendor.pincode,
        commissionRate: vendor.commissionRate,
      },
    });
  } catch (error) {
    console.error("Error creating vendor:", error);
    res.status(500).json({ message: "Server error during vendor creation" });
  }
};

/**
 * @desc Get all vendors
 * @route GET /api/vendors
 * @access Private/Admin, Franchise-Admin
 */
export const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({}).populate("userId", "name email phone"); // Populate user details
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
      res.status(403).json({ message: "Not authorized to view this vendor profile" });
    }
  } catch (error) {
    console.error("Error fetching vendor by ID:", error);
    // Handle CastError for invalid IDs
    if (error.name === 'CastError') {
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
      res.status(403).json({ message: "Not authorized to update this vendor profile" });
    }
  } catch (error) {
    console.error("Error updating vendor:", error);
    if (error.name === 'CastError') {
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
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid vendor ID" });
    }
    res.status(500).json({ message: "Server error deleting vendor" });
  }
};