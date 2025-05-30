import express from "express";
import {
  getAdminHomeAnalytics,
  getSalesRepDashHomeAnalytics,
  getUserHomeAnalytics, // Assuming this is the correct import for the user home analytics controller
  getVendorDashHomeAnalytics,
} from "../controllers/analytics.controller.js"; // Adjust path if necessary

const router = express.Router();

// GET /api/analytics/get-sales-home
// Route to fetch dashboard analytics data for a sales representative.
// It expects salesRepId as a query parameter (e.g., /get-sales-home?salesRepId=...).
router.get("/get-sales-home", getSalesRepDashHomeAnalytics);

// GET /api/analytics/vendor-home
// Route to fetch dashboard analytics data for a vendor.
// It expects vendorId as a query parameter (e.g., /vendor-home?vendorId=...).
router.get("/vendor-home", getVendorDashHomeAnalytics);

// GET /api/analytics/admin-home
// Route to fetch dashboard analytics data for the admin home page.
// This typically doesn't require a specific ID in the URL.
router.get("/admin-home", getAdminHomeAnalytics);

// GET /api/analytics/user-home/:userId
// Route to fetch home analytics data for a specific user.
// The ':userId' indicates that userId is a URL parameter,
// which aligns with how the getUserHomeAnalytics controller expects it.
router.get("/user-home/:userId", getUserHomeAnalytics);

export default router;