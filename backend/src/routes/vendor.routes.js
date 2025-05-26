// ===============================
// File: routes/vendor.routes.js
// ===============================

import express from "express";
import {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
  getVendorsForSalesRep,
} from "../controllers/vendor.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Protect all vendor routes
router.use(protect);

// Routes for creating and getting all vendors (Admin/Franchise-Admin only)
router
  .route("/")
  .post(authorize("admin", "franchise-admin"), createVendor)
  .get(authorize("admin", "franchise-admin"), getVendors);

// Routes for single vendor operations
router
  .route("/:id")
  .get(getVendorById) // Authorization handled within controller for flexibility
  .put(updateVendor) // Authorization handled within controller for flexibility
  .delete(authorize("admin", "franchise-admin"), deleteVendor); // Only Admin/Franchise-Admin can delete
// Changed to POST because salesRepId is in req.body
router.post("/assigned-to-salesrep", getVendorsForSalesRep);

export default router;
