import express from "express";
import { adminRewardDistributionReport } from "../controllers/reward.controller.js";

const router = express.Router();

// GET /api/hello - Example route with middleware
router.get("/adminRewardDistributionReport", adminRewardDistributionReport);

export default router;
