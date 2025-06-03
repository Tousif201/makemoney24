// ============================
// File: controllers/user.controller.js
// ============================
import { User } from "../models/User.model.js";
import { RewardLog } from "../models/RewardLog.model.js";
import { Order } from "../models/Order.model.js";
import { Membership } from "../models/Membership.model.js"; // Import Membership model
import { Transaction } from "../models/Transaction.model.js"; // Import Transaction model

import mongoose from "mongoose"; // Import mongoose for ObjectId conversion

/**
 * @desc Get comprehensive admin dashboard data with user details, pagination, and search,
 * filtered to only include users with the "user" role.import mongoose from "mongoose"; // Import mongoose for ObjectId conversion

 * @route GET /api/users/admin
 * @access Private (assuming authentication middleware is applied for admin role)
 */
export const getAdminDashboardData = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // --- Global Dashboard Metrics ---

    // Total Users (only counting those with the 'user' role)
    const totalUsers = await User.countDocuments({ roles: "user" });

    // Total Referrals (users who have a referredByCode AND have the 'user' role)
    const totalReferrals = await User.countDocuments({
      referredByCode: { $exists: true, $ne: null },
      roles: "user", // Apply role filter here too
    });

    // Total Referral Earnings (from RewardLog model - this remains global for all users who earned them)
    // If you need earnings *only* for users with the 'user' role, it would require
    // a more complex aggregation involving a $lookup from RewardLog to User.
    // For now, this calculates total referral earnings for *all* users who received them.
    const totalReferralEarningsResult = await RewardLog.aggregate([
      { $match: { type: "ReferralLevelReward" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalReferralEarnings =
      totalReferralEarningsResult.length > 0
        ? totalReferralEarningsResult[0].total
        : 0;

    // --- User List with Details, Pagination, and Search ---

    const userQuery = {
      roles: "user", // <--- ADDED: Filter to include only users with the 'user' role
    };

    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: "i" } }, // Case-insensitive search
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { referralCode: { $regex: search, $options: "i" } },
      ];
      // When combining with $or, if roles needs to be ANDed, structure like this:
      // userQuery.$and = [
      //   { roles: "user" },
      //   {
      //     $or: [
      //       { name: { $regex: search, $options: "i" } },
      //       { email: { $regex: search, $options: "i" } },
      //       { phone: { $regex: search, $options: "i" } },
      //       { referralCode: { $regex: search, $options: "i" } },
      //     ],
      //   },
      // ];
      // However, for single role, Mongoose handles direct property addition well.
      // The current simple `userQuery.roles = "user"` will work correctly with `$or`.
    }

    // Get total count of users matching the search query for pagination
    const totalFilteredUsers = await User.countDocuments(userQuery);

    // Fetch users based on search, with pagination
    const users = await User.find(userQuery)
      .select(
        "name email phone isMember referralCode joinedAt _id accountStatus"
      )
      .sort({ joinedAt: -1 }) // Sort by join date, newest first
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // Use .lean() for performance

    // Process each user to add aggregated data
    const usersWithAggregatedDetails = await Promise.all(
      users.map(async (user) => {
        // Calculate total direct referrals made by this user (these referred users
        // might not necessarily have the 'user' role themselves, unless you apply
        // that filter here too)
        const userTotalReferrals = await User.countDocuments({
          referredByCode: user.referralCode,
          // If you only want to count referrals who are also 'user' role:
          // roles: "user"
        });

        // Calculate total referral earnings for the current user
        const userReferralEarningsResult = await RewardLog.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(user._id),
              type: "ReferralLevelReward",
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        const userReferralEarnings =
          userReferralEarningsResult.length > 0
            ? userReferralEarningsResult[0].total
            : 0;

        // Calculate total amount spent by the current user from completed orders
        const totalSpentResult = await Order.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(user._id),
              paymentStatus: "completed",
            },
          },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]);
        const totalSpent =
          totalSpentResult.length > 0 ? totalSpentResult[0].total : 0;

        return {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          referralCode: user.referralCode,
          membershipStatus: user.isMember ? "Member" : "Non-Member",
          totalReferrals: userTotalReferrals,
          totalReferralEarnings: userReferralEarnings,
          joiningDate: user.joinedAt,
          totalSpent: totalSpent,
          accountStatus: user?.accountStatus,
        };
      })
    );

    res.status(200).json({
      success: true,
      globalMetrics: {
        totalUsers,
        totalReferrals,
        totalReferralEarnings,
      },
      pagination: {
        currentPage: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalFilteredUsers / parseInt(limit)),
        totalResults: totalFilteredUsers,
      },
      users: usersWithAggregatedDetails,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching dashboard data.",
      error: error.message,
    });
  }
};

/**
 * @desc Upgrade a user's status to member and record the membership and transaction.
 * @route POST /api/users/upgrade/:userId
 * @access Private (e.g., Admin or system process after payment confirmation)
 */
export const upgradeUser = async (req, res) => {
  const { userId } = req.params;
  // Destructure Razorpay fields directly from req.body
  const {
    membershipAmount,
    razorpayPaymentId,
    razorpayOrderId,
    razorpaySignature,
  } = req.body;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid user ID provided." });
  }

  if (typeof membershipAmount !== "number" || membershipAmount <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid membership amount." });
  }

  // Validate Razorpay fields - they should be present if this is a payment-driven upgrade
  if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
    return res.status(400).json({
      success: false,
      message:
        "Missing Razorpay payment details. Payment ID, Order ID, and Signature are required.",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Find the user
    const user = await User.findById(userId).session(session);

    if (!user) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (user.isMember) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: "User is already a member." });
    }

    // 2. Update user's isMember status
    user.isMember = true;
    await user.save({ session });

    // 3. Create a new transaction record for the membership purchase
    const newTransaction = new Transaction({
      userId: user._id,
      transactionType: "purchase",
      amount: membershipAmount,
      description: `Membership purchase for ${user.email}`,
      status: "success", // Assuming payment is already verified before this step
      razorpayPaymentId, // Use the provided Razorpay fields
      razorpayOrderId, // Use the provided Razorpay fields
      razorpaySignature, // Use the provided Razorpay fields
    });
    await newTransaction.save({ session });

    // 4. Create a new membership record
    const newMembership = new Membership({
      userId: user._id,
      amountPaid: membershipAmount,
      transactionId: newTransaction._id,
      purchasedAt: Date.now(),
    });
    await newMembership.save({ session });

    // Commit the transaction if all operations succeed
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message:
        "User successfully upgraded to member, membership and transaction recorded.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isMember: user.isMember,
      },
      transactionId: newTransaction._id,
      membershipId: newMembership._id,
    });
  } catch (error) {
    // Abort the transaction if any error occurs
    await session.abortTransaction();
    session.endSession();
    console.error("Error upgrading user to member:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during user membership upgrade.",
      error: error.message,
    });
  }
};

/**
 * @desc Updates a user's account status to a specified value ("active" or "suspended").
 * @route PUT /api/users/update-status/:userId
 * @access Private (Admin only)
 * @param {string} req.params.userId - The ID of the user to update.
 * @param {object} req.body - The request body.
 * @param {string} req.body.status - The desired account status ("active" or "suspended").
 */
export const updateAccountStatus = async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body; // Extract status from request body

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid user ID provided." });
  }

  // Validate the provided status
  if (!status || !["active", "suspended"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status provided. Must be 'active' or 'suspended'.",
    });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Update the account status directly
    user.accountStatus = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account status updated to ${user.accountStatus}.`,
      user: {
        id: user._id,
        email: user.email,
        accountStatus: user.accountStatus,
      },
    });
  } catch (error) {
    console.error("Error updating user account status:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating account status.",
      error: error.message,
    });
  }
};
