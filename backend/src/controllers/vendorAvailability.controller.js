// ===========================================
// File: controllers/vendorAvailability.controller.js
// ===========================================

import { VendorAvailability } from "../models/VendorAvailability.model.js";
import { Vendor } from "../models/Vendor.model.js"; // Import Vendor model to check existence and user linkage
import mongoose from "mongoose"; // For ObjectId validation

/**
 * @desc Create Vendor Availability for a specific vendor
 * @route POST /api/vendor-availability
 * @access Private/Vendor (self), Admin, Franchise-Admin
 */
export const createVendorAvailability = async (req, res) => {
  const { vendorId, weeklyAvailability, slotDuration, bufferBetweenSlots } = req.body;

  try {
    // 1. Basic validation
    if (!vendorId) {
      return res.status(400).json({ message: "Vendor ID is required." });
    }
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({ message: "Invalid Vendor ID format." });
    }

    // 2. Check if Vendor exists
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found for the provided ID." });
    }

    // 3. Authorization Check:
    // Only the vendor themselves, or an admin/franchise-admin can create/modify their availability.
    const authenticatedUserId = req.user.id; // From 'protect' middleware
    const userRoles = req.user.roles;

    const isAdminOrFranchiseAdmin = userRoles.includes("admin") || userRoles.includes("franchise-admin");
    const isAssociatedVendor = vendor.userId.toString() === authenticatedUserId;

    if (!isAdminOrFranchiseAdmin && !isAssociatedVendor) {
      return res.status(403).json({ message: "Not authorized to create availability for this vendor." });
    }

    // 4. Check if availability profile already exists for this vendor
    const existingAvailability = await VendorAvailability.findOne({ vendorId });
    if (existingAvailability) {
      return res.status(400).json({ message: "Vendor availability profile already exists. Use PUT to update." });
    }

    // 5. Create the new VendorAvailability document
    const vendorAvailability = new VendorAvailability({
      vendorId,
      weeklyAvailability: weeklyAvailability || [], // Default to empty array if not provided
      slotDuration: slotDuration || 30,
      bufferBetweenSlots: bufferBetweenSlots || 0,
    });

    await vendorAvailability.save();

    res.status(201).json({
      message: "Vendor availability created successfully",
      data: vendorAvailability,
    });
  } catch (error) {
    console.error("Error creating vendor availability:", error);
    res.status(500).json({ message: "Server error during creation of vendor availability." });
  }
};

/**
 * @desc Get Vendor Availability by Vendor ID
 * @route GET /api/vendor-availability/:vendorId
 * @access Public (any authenticated user can view)
 */
export const getVendorAvailability = async (req, res) => {
  const { vendorId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({ message: "Invalid Vendor ID format." });
    }

    const vendorAvailability = await VendorAvailability.findOne({ vendorId }).populate('vendorId', 'name');

    if (!vendorAvailability) {
      return res.status(404).json({ message: "Vendor availability not found for this vendor." });
    }

    res.status(200).json({
      message: "Vendor availability retrieved successfully",
      data: vendorAvailability,
    });
  } catch (error) {
    console.error("Error fetching vendor availability:", error);
    res.status(500).json({ message: "Server error fetching vendor availability." });
  }
};

/**
 * @desc Update Vendor Availability
 * @route PUT /api/vendor-availability/:vendorId
 * @access Private/Vendor (self), Admin, Franchise-Admin
 */
export const updateVendorAvailability = async (req, res) => {
  const { vendorId } = req.params;
  const { weeklyAvailability, slotDuration, bufferBetweenSlots } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({ message: "Invalid Vendor ID format." });
    }

    // 1. Find the availability profile
    const vendorAvailability = await VendorAvailability.findOne({ vendorId });
    if (!vendorAvailability) {
      return res.status(404).json({ message: "Vendor availability not found for this vendor." });
    }

    // 2. Authorization Check (same as create)
    const vendor = await Vendor.findById(vendorId); // Need to get vendor to check linked user
    if (!vendor) {
        return res.status(404).json({ message: "Associated vendor not found for this availability profile." });
    }

    const authenticatedUserId = req.user.id;
    const userRoles = req.user.roles;

    const isAdminOrFranchiseAdmin = userRoles.includes("admin") || userRoles.includes("franchise-admin");
    const isAssociatedVendor = vendor.userId.toString() === authenticatedUserId;

    if (!isAdminOrFranchiseAdmin && !isAssociatedVendor) {
      return res.status(403).json({ message: "Not authorized to update availability for this vendor." });
    }

    // 3. Update fields
    if (weeklyAvailability !== undefined) {
      vendorAvailability.weeklyAvailability = weeklyAvailability;
    }
    if (slotDuration !== undefined) {
      vendorAvailability.slotDuration = slotDuration;
    }
    if (bufferBetweenSlots !== undefined) {
      vendorAvailability.bufferBetweenSlots = bufferBetweenSlots;
    }

    const updatedAvailability = await vendorAvailability.save();

    res.status(200).json({
      message: "Vendor availability updated successfully",
      data: updatedAvailability,
    });
  } catch (error) {
    console.error("Error updating vendor availability:", error);
    res.status(500).json({ message: "Server error updating vendor availability." });
  }
};

/**
 * @desc Delete Vendor Availability
 * @route DELETE /api/vendor-availability/:vendorId
 * @access Private/Vendor (self), Admin, Franchise-Admin
 */
export const deleteVendorAvailability = async (req, res) => {
  const { vendorId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({ message: "Invalid Vendor ID format." });
    }

    // 1. Find the availability profile
    const vendorAvailability = await VendorAvailability.findOne({ vendorId });
    if (!vendorAvailability) {
      return res.status(404).json({ message: "Vendor availability not found for this vendor." });
    }

    // 2. Authorization Check (same as create/update)
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
        return res.status(404).json({ message: "Associated vendor not found for this availability profile." });
    }

    const authenticatedUserId = req.user.id;
    const userRoles = req.user.roles;

    const isAdminOrFranchiseAdmin = userRoles.includes("admin") || userRoles.includes("franchise-admin");
    const isAssociatedVendor = vendor.userId.toString() === authenticatedUserId;

    if (!isAdminOrFranchiseAdmin && !isAssociatedVendor) {
      return res.status(403).json({ message: "Not authorized to delete availability for this vendor." });
    }

    // 3. Delete the document
    await vendorAvailability.deleteOne();

    res.status(200).json({ message: "Vendor availability deleted successfully." });
  } catch (error) {
    console.error("Error deleting vendor availability:", error);
    res.status(500).json({ message: "Server error deleting vendor availability." });
  }
};
