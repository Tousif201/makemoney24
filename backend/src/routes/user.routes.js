import express from "express";
import {
  getAdminDashboardData,
  updateAccountStatus,
  upgradeUser,
  uploadProfileImage,
} from "../controllers/user.controller.js"; // Import upgradeUser

const router = express.Router();

router.get("/admin", getAdminDashboardData);
router.post("/upgrade/:userId", upgradeUser); // Add this line to expose the upgradeUser controller
router.post("/upload-profile-image", uploadProfileImage); // Add this line to expose the upgradeUser controller
router.put("/update-status/:userId", updateAccountStatus);
export default router;
