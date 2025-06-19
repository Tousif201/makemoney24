import express from "express";
import {
  getAdminDashboardData,
  updateAccountStatus,
  upgradeUser,
  uploadProfileImage,
  topUpProfileScore, // Import the new controller
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/admin", getAdminDashboardData);
router.post("/upgrade/:userId", upgradeUser);
router.post("/upload-profile-image", uploadProfileImage);
router.put("/update-status/:userId", updateAccountStatus);
router.post("/topup-profile-score/:userId", topUpProfileScore); // Add the new route for topping up profile score

export default router;
