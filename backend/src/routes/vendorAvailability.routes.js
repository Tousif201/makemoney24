// =======================================
// File: routes/vendorAvailability.routes.js
// =======================================

import express from "express";
import {
  createVendorAvailability,
  getVendorAvailability,
  updateVendorAvailability,
  deleteVendorAvailability,
} from "../controllers/vendorAvailability.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All vendor availability routes require authentication
router.use(protect);

// Create Vendor Availability (only by self-vendor, admin, or franchise-admin)
router.post("/", createVendorAvailability); // Authorization handled in controller

// Get Vendor Availability by Vendor ID (accessible to any authenticated user)
router.get("/:vendorId", getVendorAvailability);

// Update Vendor Availability (only by self-vendor, admin, or franchise-admin)
router.put("/:vendorId", updateVendorAvailability); // Authorization handled in controller

// Delete Vendor Availability (only by self-vendor, admin, or franchise-admin)
router.delete("/:vendorId", deleteVendorAvailability); // Authorization handled in controller

export default router;