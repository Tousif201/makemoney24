import express from "express";
import { getAdminHomeAnalytics, getSalesRepDashHomeAnalytics, getVendorDashHomeAnalytics } from "../controllers/analytics.controller.js";

const router = express.Router();

// GET /api/hello - Example route with middleware
router.get("/get-sales-home", getSalesRepDashHomeAnalytics);
router.get("/vendor-home", getVendorDashHomeAnalytics); // New route for vendor dashboard
router.get("/admin-home",getAdminHomeAnalytics)

export default router;
