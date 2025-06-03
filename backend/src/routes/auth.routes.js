// =================================
// File: routes/auth.routes.js
// =================================

import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  requestPasswordResetOTP,
  verifyOTP,
  resetPassword,
  getUserDetails,
  getUserTodayReferralPerformance,
} from "../controllers/auth.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password-request-otp", requestPasswordResetOTP);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

// Protected routes
router.post("/logout", protect, logoutUser); // Only logged-in users can logout
router.post("/profile", getUserProfile); // Get user profile

// Example of role-based authorization
router.get("/admin-dashboard", protect, authorize("admin", "franchise-admin"), (req, res) => {
  res.status(200).json({ message: "Welcome to the Admin Dashboard!" });
});
router.get("/admin-dashboard/user/:userId", protect, authorize("admin"),getUserDetails);
router.get("/admin-dashboard/user/referral-performance/:userId",  authorize("admin"),getUserTodayReferralPerformance);


export default router;
