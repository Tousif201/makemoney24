// ===================================
// File: controllers/auth.controller.js
// ===================================

import { User } from "../models/User.model.js";
import jwt from "jsonwebtoken"; // Import jwt for token verification in protected routes if needed directly
import bcrypt from "bcryptjs"; // Import bcrypt directly if needed for hashing outside of getHashPassword
import { generateUniqueReferralCode } from "../utils/referralGenerator.js";
import { getComparePassword, getHashPassword } from "../utils/getPassword.js";
import { generateAuthToken } from "../utils/generateAuthToken.js";

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const registerUser = async (req, res) => {
  const {
    name,
    email,
    phone,
    password,
    pincode,
    referredByCode,
    isMember,
    roles, // Allow admin to specify roles during registration
  } = req.body;

  try {
    // 1. Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hash password
    const hashedPassword = await getHashPassword(password);

    // 3. Generate unique referral code for the new user
    const referralCode = await generateUniqueReferralCode();

    // 4. Create new user
    user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      pincode,
      isMember: isMember || false, // Default to false if not provided
      referralCode,
      referredByCode: referredByCode || null,
      roles: roles || ["user"], // Default role to 'user' if not provided
    });

    // 5. If referred, link to parent and update parent's profileScore
    if (referredByCode) {
      const parentUser = await User.findOne({ referralCode: referredByCode });
      if (parentUser) {
        user.parent = parentUser._id;
        // Example: Increment parent's profile score for successful referral
        parentUser.profileScore += 10;
        await parentUser.save();
      } else {
        console.warn(`Referral code ${referredByCode} not found.`);
        // You might want to send a response indicating the referral code is invalid,
        // or just proceed without linking. For now, we'll proceed.
      }
    }

    await user.save();

    // 6. Generate JWT token and set as cookie
    generateAuthToken(res, user._id, user.email, user.roles[0]); // Pass the primary role for the token

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isMember: user.isMember,
        referralCode: user.referralCode,
        roles: user.roles,
        joinedAt: user.joinedAt,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

/**
 * @desc Authenticate user & get token
 * @route POST /api/auth/login
 * @access Public
 */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 2. Compare passwords
    const isMatch = await getComparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. Generate JWT token and set as cookie
    const authToken = await generateAuthToken(
      res,
      user._id,
      user.email,
      user.roles[0]
    ); // Pass the primary role for the token

    res.status(200).json({
      message: "Logged in successfully",
      authToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

/**
 * @desc Log out user / clear cookie
 * @route POST /api/auth/logout
 * @access Private
 */
export const logoutUser = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0), // Set to a past date to expire the cookie
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

/**
 * @desc Request OTP for password reset
 * @route POST /api/auth/forgot-password-request-otp
 * @access Public
 */
export const requestPasswordResetOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a new OTP (e.g., 6-digit number)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the OTP before saving (recommended for security)
    const hashedOtpCode = await bcrypt.hash(otpCode, 10); // Hash with a salt

    // Set OTP expiry (e.g., 5 minutes from now)
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Update user's OTP fields
    user.otp = {
      code: hashedOtpCode,
      expiresAt: otpExpiresAt,
      verified: false,
      lastSentAt: new Date(),
    };

    await user.save();

    // Send the OTP via email (send the unhashed OTP)
    await sendEmail(email, otpCode);

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Error requesting password reset OTP:", error);
    res.status(500).json({ message: "Server error during OTP request" });
  }
};

/**
 * @desc Verify OTP for password reset
 * @route POST /api/auth/verify-otp
 * @access Public
 */
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP exists and is not expired
    if (
      !user.otp ||
      !user.otp.code ||
      user.otp.expiresAt < new Date() ||
      user.otp.verified
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Compare the provided OTP with the stored hashed OTP
    const isMatch = await bcrypt.compare(otp, user.otp.code);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Mark OTP as verified
    user.otp.verified = true;
    await user.save();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Server error during OTP verification" });
  }
};

/**
 * @desc Reset password after OTP verification
 * @route POST /api/auth/reset-password
 * @access Public
 */
export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP was verified for this user
    if (!user.otp || !user.otp.verified || user.otp.expiresAt < new Date()) {
      return res
        .status(403)
        .json({ message: "OTP not verified or verification expired" });
    }

    // Hash the new password
    const hashedPassword = await getHashPassword(newPassword);

    // Update the user's password and reset OTP fields
    user.password = hashedPassword;
    user.otp = {
      code: null,
      expiresAt: null,
      verified: false,
      lastSentAt: null,
    }; // Clear OTP data after successful reset

    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Server error during password reset" });
  }
};

/**
 * @desc Get user profile (example of a protected route)
 * @route GET /api/auth/profile
 * @access Private
 */
export const getUserProfile = async (req, res) => {
  // req.user will be available due to the protect middleware
  const user = await User.findById(req.user.id).select("-password"); // Exclude password from the response

  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      pincode: user.pincode,
      isMember: user.isMember,
      parent: user.parent,
      joinedAt: user.joinedAt,
      profileScore: user.profileScore,
      purchaseWallet: user.purchaseWallet,
      withdrawableWallet: user.withdrawableWallet,
      referralCode: user.referralCode,
      referredByCode: user.referredByCode,
      roles: user.roles,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};
