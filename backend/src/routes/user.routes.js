import express from "express";
import { getAdminDashboardData, upgradeUser } from "../controllers/user.controller.js"; // Import upgradeUser

const router = express.Router();

router.get("/admin", getAdminDashboardData);
router.post("/upgrade/:userId", upgradeUser); // Add this line to expose the upgradeUser controller

export default router;
