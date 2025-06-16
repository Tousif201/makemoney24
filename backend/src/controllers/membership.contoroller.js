// ===================================
// File: controllers/membership.controller.js
// ===================================
import mongoose from "mongoose";
import { Membership } from "../models/Membership.model.js"; // Adjust path as per your project structure
import { RewardLog } from "../models/RewardLog.model.js"; // Assuming RewardLog is in the same file or adjust path
import { User } from "../models/User.model.js"; // Adjust path as per your project structure

// Helper function to validate ObjectId (already provided, keeping it)
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * @desc Get Admin Membership Report
 * @route GET /api/membership/adminMembershipReport
 * @access Private (e.g., Admin role)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const adminMembershipReport = async (req, res) => {
  try {
    const now = new Date();

    // Calculate current month's start date
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Calculate previous month's start and end dates
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = currentMonthStart; // The day before current month starts

    // Helper function to calculate percentage change
    const calculateRate = (current, previous) => {
      if (previous === 0) {
        return current > 0 ? "100.00%" : "0.00%";
      }
      const change = ((current - previous) / previous) * 100;
      return `${change.toFixed(2)}%`;
    };

    // --- Overall Stats for Current Month ---
    const [
      totalMembershipsCurrentMonth,
      membershipRevenueCurrentMonthResult,
      totalReferralsCurrentMonth,
      referralEarningsCurrentMonthResult,
    ] = await Promise.all([
      Membership.countDocuments({ purchasedAt: { $gte: currentMonthStart } }),
      Membership.aggregate([
        { $match: { purchasedAt: { $gte: currentMonthStart } } },
        { $group: { _id: null, total: { $sum: "$amountPaid" } } },
      ]),
      User.countDocuments({
        parent: { $ne: null },
        joinedAt: { $gte: currentMonthStart },
      }), // Count users with a parent for current month
      RewardLog.aggregate([
        {
          $match: {
            type: "ReferralLevelReward",
            createdAt: { $gte: currentMonthStart },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const membershipRevenueCurrentMonth =
      membershipRevenueCurrentMonthResult.length > 0
        ? membershipRevenueCurrentMonthResult[0].total
        : 0;
    const referralEarningsCurrentMonth =
      referralEarningsCurrentMonthResult.length > 0
        ? referralEarningsCurrentMonthResult[0].total
        : 0;

    // --- Overall Stats for Previous Month ---
    const [
      totalMembershipsPrevMonth,
      membershipRevenuePrevMonthResult,
      totalReferralsPrevMonth,
      referralEarningsPrevMonthResult,
    ] = await Promise.all([
      Membership.countDocuments({
        purchasedAt: { $gte: prevMonthStart, $lt: prevMonthEnd },
      }),
      Membership.aggregate([
        { $match: { purchasedAt: { $gte: prevMonthStart, $lt: prevMonthEnd } } },
        { $group: { _id: null, total: { $sum: "$amountPaid" } } },
      ]),
      User.countDocuments({
        parent: { $ne: null },
        joinedAt: { $gte: prevMonthStart, $lt: prevMonthEnd },
      }), // Count users with a parent for previous month
      RewardLog.aggregate([
        {
          $match: {
            type: "ReferralLevelReward",
            createdAt: { $gte: prevMonthStart, $lt: prevMonthEnd },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const membershipRevenuePrevMonth =
      membershipRevenuePrevMonthResult.length > 0
        ? membershipRevenuePrevMonthResult[0].total
        : 0;
    const referralEarningsPrevMonth =
      referralEarningsPrevMonthResult.length > 0
        ? referralEarningsPrevMonthResult[0].total
        : 0;

    // --- Calculate Rates ---
    const totalMembershipRate = calculateRate(
      totalMembershipsCurrentMonth,
      totalMembershipsPrevMonth
    );
    const totalReferralRate = calculateRate(
      totalReferralsCurrentMonth,
      totalReferralsPrevMonth
    );
    const membershipRevenueRate = calculateRate(
      membershipRevenueCurrentMonth,
      membershipRevenuePrevMonth
    );
    const referralEarningRate = calculateRate(
      referralEarningsCurrentMonth,
      referralEarningsPrevMonth
    );

    // --- All Memberships Data ---
    const allMembershipData = await Membership.aggregate([
      {
        $lookup: {
          from: "users", // Collection name for the User model
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true, // Keep memberships even if user not found
        },
      },
      {
        $lookup: {
          from: "membershippackages", // Collection name for the MembershipPackages model
          localField: "membershipPackageId",
          foreignField: "_id",
          as: "packageDetails",
        },
      },
      {
        $unwind: {
          path: "$packageDetails",
          preserveNullAndEmptyArrays: true, // Keep memberships even if package not found
        },
      },
      {
        $lookup: {
          from: "users", // Collection name for the User model (for referred users)
          localField: "userDetails._id",
          foreignField: "parent",
          as: "referredUsers",
        },
      },
      {
        $lookup: {
          from: "rewardlogs", // Collection name for the RewardLog model
          localField: "userDetails._id",
          foreignField: "userId",
          as: "referralRewards",
        },
      },
      {
        $project: {
          _id: 0,
          name: { $ifNull: ["$userDetails.name", "N/A"] },
          membershipPackageName: { $ifNull: ["$packageDetails.name", "N/A"] }, // Add membership package name
          amountPaid: "$amountPaid",
          purchasedAt: "$purchasedAt",
          noOfReferrals: { $size: "$referredUsers" },
          referralEarnings: {
            $reduce: {
              input: "$referralRewards",
              initialValue: 0,
              in: {
                $sum: [
                  "$$value",
                  {
                    $cond: [
                      { $eq: ["$$this.type", "ReferralLevelReward"] },
                      "$$this.amount",
                      0,
                    ],
                  },
                ],
              },
            },
          },
          profileScore: { $ifNull: ["$userDetails.profileScore", 0] },
        },
      },
    ]);

    res.status(200).json({
      totalMembership: {
        amount: totalMembershipsCurrentMonth,
        rate: totalMembershipRate,
      },
      totalReferral: {
        amount: totalReferralsCurrentMonth,
        rate: totalReferralRate,
      },
      membershipRevenue: {
        amount: parseFloat(membershipRevenueCurrentMonth.toFixed(2)),
        rate: membershipRevenueRate,
      },
      referralEarning: {
        amount: parseFloat(referralEarningsCurrentMonth.toFixed(2)),
        rate: referralEarningRate,
      },
      allMembership: allMembershipData,
    });
  } catch (error) {
    console.error("Error fetching admin membership report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};