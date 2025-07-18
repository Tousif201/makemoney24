// ===================================
// File: controllers/auth.controller.js
// ===================================

import { User } from "../models/User.model.js";
import bcrypt from "bcryptjs"; // Import bcrypt directly if needed for hashing outside of getHashPassword
import { generateUniqueReferralCode } from "../utils/referralGenerator.js";
import { getComparePassword, getHashPassword } from "../utils/getPassword.js";
import { Membership } from "../models/Membership.model.js";
import { generateAuthToken } from "../utils/generateAuthToken.js";
import { sendEmail } from "../utils/nodeMailerOtp.js";

// import { Membership } from "../models/Membership.model.js"


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
   kycDocumentImage,
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

    // 4. Generate OTP for email verification
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtpCode = await bcrypt.hash(otpCode, 10);
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // 5. Create new user
    user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      pincode,
      isMember: isMember || false, // Default to false if not provided
      referralCode,
      key:password,
      referredByCode: referredByCode || null,
      roles: roles || ["user"], // Default role to 'user' if not provided
      otp: {
        // Store OTP details for verification
        code: hashedOtpCode,
        expiresAt: otpExpiresAt,
        verified: false,
        lastSentAt: new Date(),
      },
      kycDocumentImage:kycDocumentImage||[]
    });

    // 6. If referred, link to parent and update parent's profileScore
    if (referredByCode) {
      const parentUser = await User.findOne({ referralCode: referredByCode });
      if (parentUser) {
        user.parent = parentUser._id;
        // Example: Increment parent's profile score for successful referral
        // parentUser.profileScore += 20;
        await parentUser.save();
      } else {
        console.warn(`Referral code ${referredByCode} not found.`);
        // You might want to send a response indicating the referral code is invalid,
        // or just proceed without linking. For now, we'll proceed.
      }
    }

    await user.save();

    // 7. Send the OTP via email (send the unhashed OTP)
    await sendEmail(email, otpCode);

    // 8. Do NOT generate JWT token here. User must verify OTP first.
    res.status(201).json({
      message:
        "User registered successfully. Please check your email for OTP verification.",
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

    // 2. Check user account status
    // If the accountStatus is 'suspended', reject the login attempt.
    if (user.accountStatus === "suspended") {
      return res
        .status(401)
        .json({
          message: "Your account has been suspended. Please contact support.",
        });
    }

    // 3. Compare passwords
    const isMatch = await getComparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 4. Check if OTP is verified. If not, resend OTP and send a message.
    if (user.otp && user.otp.verified === false) {
      // Generate a new OTP
      const newOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedNewOtpCode = await bcrypt.hash(newOtpCode, 10);
      const newOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

      // Update user's OTP fields
      user.otp = {
        code: hashedNewOtpCode,
        expiresAt: newOtpExpiresAt,
        verified: false,
        lastSentAt: new Date(),
      };
      await user.save();

      // Send the new OTP via email
      await sendEmail(email, newOtpCode);

      return res.status(201).json({
        message:
          `Your email is not verified. A new OTP has been sent to ${email}. Please verify your email.`,
        email: user.email, // Optionally send back the email for client-side convenience
      });
    }

    // 5. Generate JWT token and set as cookie
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
        accountStatus: user.accountStatus, // Include accountStatus in the response
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
    await sendEmail(email, otpCode); // Assuming sendEmail function exists

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

    // Generate JWT token and send in response
    const authToken = await generateAuthToken(
      res,
      user._id,
      user.email,
      user.roles[0]
    ); // Pass the primary role for the token

    res.status(200).json({
      message: "OTP verified successfully",
      authToken, // Send the token in the response body
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
    });
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
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findById(userId).select("-password");

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
        profileImage: user.profileImage.url,
        roles: user.roles,
        accountStatus: user.accountStatus,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserReferralPerformance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { filter } = req.body;

    // console.log(filter, userId);

    let startOfDay, endOfDay;
    const now = new Date();
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    switch (filter) {
      case "today":
        startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        break;
      case "thisWeek":
        startOfDay = new Date(now);
        startOfDay.setDate(now.getDate() - now.getDay()); // Start of the week (Sunday)
        startOfDay.setHours(0, 0, 0, 0);
        endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        break;
      case "thisMonth":
        startOfDay = new Date(now.getFullYear(), now.getMonth(), 1); // Start of the month
        startOfDay.setHours(0, 0, 0, 0);
        endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        break;
      case "allTime":
      default:
        // Set startOfDay to the user's creation or activation date
        startOfDay = new Date(user.joinedAt || user.createdAt); // Use user's joinedAt or createdAt date
        endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        break;
    }

    // Find users who have the current user ID in their parent field
    const referredUsers = await User.find({ parent: userId });

    // console.log(referredUsers);

    const referrals = [];
    for (const referredUser of referredUsers) {
      const joinedOnDate = referredUser.joinedAt >= startOfDay && referredUser.joinedAt <= endOfDay;
      if (joinedOnDate) {
        const membershipQuery = {
          userId: referredUser._id,
          purchasedAt: { $gte: startOfDay, $lte: endOfDay },
        };
        const membershipOnDate = await Membership.findOne(membershipQuery).populate("transactionId");
        referrals.push({
          referredUser: {
            _id: referredUser._id,
            name: referredUser.name,
            email: referredUser.email,
            phone: referredUser.phone,
            joinedAt: referredUser.joinedAt,
          },
          membership: membershipOnDate ? {
            amountPaid: membershipOnDate.amountPaid,
            purchasedAt: membershipOnDate.purchasedAt,
            transactionId: membershipOnDate.transactionId?._id || null,
          } : null,
        });
      }
    }

    res.status(200).json({
      success: true,
      filter: filter,
      referralsCount: referrals.length,
      referrals: referrals,
    });
  } catch (error) {
    console.error("Error fetching user's referral performance:", error);
    res.status(500).json({
      message: "Failed to fetch user's referral performance",
      error: error.message
    });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
// console.log(userId);
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const membership = await Membership.findOne({ userId}).select("amountPaid purchasedAt expiredAt ");
    // console.log(membership)
     const membershipDate = membership ? membership.purchasedAt : user.createdAt;
      const membershipExpiryDate = membership ? membership.expiredAt : new Date(user.createdAt.getFullYear() + 1, user.createdAt.getMonth(), user.createdAt.getDate());
      // console.log(membershipDate,membershipExpiryDate)
    const totalEarnings =
      (user.withdrawableWallet || 0) + (user.purchaseWallet || 0);

    // Get the total number of referrals
    const totalReferralsCount = await User.countDocuments({
      referredByCode: user.referralCode,
    });

    // Get the number of active referrals (those who are members)
    const activeReferralsCount = await User.countDocuments({
      referredByCode: user.referralCode,
      isMember: true,
    });

    const userDetails = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      referralCode: user.referralCode,
      password:user.key,
      referredByCode: user.referredByCode|| "no sponsor",
      joiningDate: user.createdAt,
      membershipDate,
      membershipExpiryDate,
      amountPaid: membership ? membership.amountPaid : 0,
      profileScore: user.profileScore,
      totalReferrals: totalReferralsCount,
      activeReferrals: activeReferralsCount,
      totalEarnings: totalEarnings,
    };

    res.status(200).json({ success: true, data: userDetails });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch user details", error: error.message });
  }
};
