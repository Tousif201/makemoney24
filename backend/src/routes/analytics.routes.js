import express from "express";
import { getSalesRepDashHomeAnalytics } from "../controllers/analytics.controller.js";

const router = express.Router();

// GET /api/hello - Example route with middleware
router.get("/get-sales-home", getSalesRepDashHomeAnalytics);

export default router;
