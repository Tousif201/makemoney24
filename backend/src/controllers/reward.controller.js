// ===================================
// File: controllers/reward.controller.js
// ===================================
import mongoose from "mongoose";
// Assuming Membership model is not directly used here, but keeping imports consistent if needed elsewhere
// import { Membership } from "../models/Membership.model.js";
import { RewardLog } from "../models/RewardLog.model.js"; // Correct path to RewardLog model
import { User } from "../models/User.model.js"; // Correct path to User model

// Helper function to validate ObjectId (already provided, keeping it)
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * @desc Get Admin Reward Distribution Report
 * @route GET /api/reward/adminRewardDistributionReport
 * @access Private (e.g., Admin role)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const adminRewardDistributionReport = async (req, res) => {
  try {
    // 1. Calculate overall analytical data
    const [overallStats] = await RewardLog.aggregate([
      {
        $group: {
          _id: null,
          noOfTotalRewards: { $sum: 1 }, // Total count of reward logs
          totalAmtDistributed: { $sum: "$amount" }, // Sum of all amounts
          totalReferralLevelRewardsAmt: {
            // Sum of amounts for ReferralLevelReward type
            $sum: {
              $cond: [{ $eq: ["$type", "ReferralLevelReward"] }, "$amount", 0],
            },
          },
          totalOtherMilestoneRewardsAmt: {
            // Sum of amounts for other milestone types
            $sum: {
              $cond: [{ $ne: ["$type", "ReferralLevelReward"] }, "$amount", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          noOfTotalRewards: 1,
          totalAmtDistributed: 1,
          totalReferralLevelRewardsAmt: 1,
          totalOtherMilestoneRewardsAmt: 1,
        },
      },
    ]);

    // Handle case where no rewards exist
    const defaultStats = {
      noOfTotalRewards: 0,
      totalAmtDistributed: 0,
      totalReferralLevelRewardsAmt: 0,
      totalOtherMilestoneRewardsAmt: 0,
    };

    const finalStats = overallStats || defaultStats;

    // 2. Fetch rewards history
    const rewardsHistory = await RewardLog.aggregate([
      {
        $lookup: {
          from: "users", // Name of the User collection in MongoDB (usually lowercase plural of model name)
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true, // Keep reward logs even if user not found (though userId is required)
        },
      },
      {
        $project: {
          _id: 0,
          userType: {
            $cond: [
              { $in: ["franchise-admin", "$userDetails.roles"] }, // Check if roles array contains 'franchise-admin'
              "franchise",
              "user", // Default to 'user' if not 'franchise-admin'
            ],
          },
          Name: { $ifNull: ["$userDetails.name", "Unknown User"] },
          referralCode: { $ifNull: ["$userDetails.referralCode", "N/A"] },
          category: "$type", // Use the 'type' from RewardLog schema
          amt: "$amount",
          distributionDate: "$createdAt", // Use createdAt for distribution date
        },
      },
      {
        $sort: { distributionDate: -1 }, // Sort by most recent rewards first
      },
    ]);

    res.status(200).json({
      noOfTotalRewards: finalStats.noOfTotalRewards,
      totalAmtDistributed: finalStats.totalAmtDistributed,
      totalReferralLevelRewardsAmt: finalStats.totalReferralLevelRewardsAmt, // Additional analytical data
      totalOtherMilestoneRewardsAmt: finalStats.totalOtherMilestoneRewardsAmt, // Additional analytical data
      rewardsHistory: rewardsHistory,
    });
  } catch (error) {
    console.error("Error fetching admin reward distribution report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
/**
 * @desc Get User's Personal Reward Report
 * @route GET /api/reward/userRewardReport/:userId
 * @access Private (e.g., Authenticated user, or Admin for specific user)
 * @param {Object} req - Express request object (expects userId in params)
 * @param {Object} res - Express response object
 */
export const userRewardReport = async (req, res) => {
  const { userId } = req.params; // Get userId from URL parameters

  // 1. Input Validation
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required as a URL parameter.",
    });
  }

  if (!isValidObjectId(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid User ID format.",
    });
  }

  try {
    const objectUserId = new mongoose.Types.ObjectId(userId);

    // 2. Calculate Total Rewards Earned & Count of Completed Milestones
    const [userStats] = await RewardLog.aggregate([
      {
        $match: {
          userId: objectUserId,
        },
      },
      {
        $group: {
          _id: null, // Group all matching documents for the user
          totalRewardsEarned: { $sum: "$amount" }, // Sum of all reward amounts
          completedMilestones: { $sum: 1 }, // Count each reward log as a completed milestone
          // If you want to count UNIQUE milestone types, use:
          // completedMilestones: { $addToSet: "$type" } and then get its size in JS
        },
      },
      {
        $project: {
          _id: 0,
          totalRewardsEarned: 1,
          completedMilestones: 1,
        },
      },
    ]);

    // Default values if no rewards found for the user
    const finalUserStats = userStats || {
      totalRewardsEarned: 0,
      completedMilestones: 0,
    };

    // 3. Fetch Detailed Milestone Rewards History for the user
    const milestoneRewardsHistory = await RewardLog.find({
      userId: objectUserId,
    })
      .sort({ createdAt: -1 }) // Sort by most recent first
      .lean(); // Return plain JavaScript objects for efficiency

    res.status(200).json({
      success: true,
      totalRewardsEarned: finalUserStats.totalRewardsEarned,
      completedMilestones: finalUserStats.completedMilestones,
      MilestoneRewards: milestoneRewardsHistory,
    });
  } catch (error) {
    console.error(`Error fetching user reward report for user ${userId}:`, error);
    res.status(500).json({ success: false, message: "Internal server error.", error: error.message });
  }
};