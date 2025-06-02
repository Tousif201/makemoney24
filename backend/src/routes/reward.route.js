import express from "express";
import {
  adminRewardDistributionReport,
  userRewardReport,
} from "../controllers/reward.controller.js";

const router = express.Router();

// GET /api/reward/adminRewardDistributionReport
// This route is for administrators to get a complete report on reward distribution.
router.get("/adminRewardDistributionReport", adminRewardDistributionReport);

// GET /api/reward/userRewardReport/:userId
// This route is for fetching a specific user's reward report.
// The ':userId' part indicates that userId is a URL parameter.
router.get("/userRewardReport/:userId", userRewardReport);

export default router;
