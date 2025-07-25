// ======================================
// File: controllers/membershipMilestoneController.js
// ======================================

import { membershipMilestone } from "../models/membershipMilestone.model.js";
import { RewardLog } from "../models/RewardLog.model.js"; // Assuming you have this model for stats

// @desc    Create a new Membership Milestone
// @route   POST /api/membership-milestones
// @access  Private (e.g., Admin)
export const createMembershipMilestone = async (req, res) => {
  try {
    const { name, status, milestone, rewardAmount, timeLimitDays } = req.body;

    // Basic validation
    if (!name || !milestone || !rewardAmount) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, milestone target, and reward amount.",
      });
    }

    const newMilestone = await membershipMilestone.create({
      name,
      status,
      milestone,
      rewardAmount,
      timeLimitDays,
      // milestoneId will be generated by the pre-save hook
    });

    res.status(201).json({
      success: true,
      message: "Membership milestone created successfully.",
      data: newMilestone,
    });
  } catch (error) {
    // Handle duplicate name or validation errors
    if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
      return res.status(400).json({
        success: false,
        message: `Milestone with name '${req.body.name}' already exists.`,
      });
    }
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ success: false, errors });
    }
    console.error("Error creating membership milestone:", error);
    res.status(500).json({
      success: false,
      message: "Server error during milestone creation.",
      error: error.message,
    });
  }
};

// @desc    Get all Membership Milestones
// @route   GET /api/membership-milestones
// @access  Private (e.g., Admin, or any authorized user)
export const getAllMembershipMilestones = async (req, res) => {
  try {
    const milestones = await membershipMilestone.find({}).sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      success: true,
      count: milestones.length,
      data: milestones,
    });
  } catch (error) {
    console.error("Error fetching membership milestones:", error);
    res.status(500).json({
      success: false,
      message: "Server error during fetching milestones.",
      error: error.message,
    });
  }
};

// @desc    Get a single Membership Milestone by ID (MongoDB _id)
// @route   GET /api/membership-milestones/:id
// @access  Private
export const getMembershipMilestoneById = async (req, res) => {
  try {
    const milestone = await membershipMilestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Membership milestone not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: milestone,
    });
  } catch (error) {
    console.error(`Error fetching membership milestone with ID ${req.params.id}:`, error);
    if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: "Invalid milestone ID format." });
    }
    res.status(500).json({
      success: false,
      message: "Server error during fetching milestone.",
      error: error.message,
    });
  }
};

// @desc    Update a Membership Milestone by ID (MongoDB _id)
// @route   PUT /api/membership-milestones/:id
// @access  Private (e.g., Admin)
export const updateMembershipMilestone = async (req, res) => {
  try {
    const { name, status, milestone, rewardAmount, timeLimitDays } = req.body;

    const updatedMilestone = await membershipMilestone.findByIdAndUpdate(
      req.params.id,
      { name, status, milestone, rewardAmount, timeLimitDays },
      {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators on update
      }
    );

    if (!updatedMilestone) {
      return res.status(404).json({
        success: false,
        message: "Membership milestone not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Membership milestone updated successfully.",
      data: updatedMilestone,
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
      return res.status(400).json({
        success: false,
        message: `Milestone with name '${req.body.name}' already exists.`,
      });
    }
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ success: false, errors });
    }
    console.error(`Error updating membership milestone with ID ${req.params.id}:`, error);
    if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: "Invalid milestone ID format." });
    }
    res.status(500).json({
      success: false,
      message: "Server error during milestone update.",
      error: error.message,
    });
  }
};

// @desc    Delete a Membership Milestone by ID (MongoDB _id or custom milestoneId)
// @route   DELETE /api/membership-milestones/:id
// @access  Private (e.g., Admin)
export const deleteMembershipMilestone = async (req, res) => {
  try {
    // You can choose to delete by _id or by the custom milestoneId.
    // For consistency with update, let's stick to _id for now.
    // If you want to delete by the 4-char milestoneId, change findByIdAndDelete to findOneAndDelete({ milestoneId: req.params.id })
    const deletedMilestone = await membershipMilestone.findByIdAndDelete(req.params.id);

    if (!deletedMilestone) {
      return res.status(404).json({
        success: false,
        message: "Membership milestone not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Membership milestone deleted successfully.",
      data: {}, // Or return the deleted milestone if helpful
    });
  } catch (error) {
    console.error(`Error deleting membership milestone with ID ${req.params.id}:`, error);
    if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: "Invalid milestone ID format." });
    }
    res.status(500).json({
      success: false,
      message: "Server error during milestone deletion.",
      error: error.message,
    });
  }
};

// @desc    Get Membership Milestone Statistics
// @route   GET /api/membership-milestones/stats
// @access  Private (e.g., Admin, or any authorized user)
export const getMembershipMilestoneStats = async (req, res) => {
  try {
    // This aggregation assumes that 'RewardLog' tracks rewards for membership milestones.
    // You'll need to adapt the $match criteria (`type: "MembershipMilestone"`)
    // and potentially the fields being summed if your RewardLog structure differs.
    const stats = await RewardLog.aggregate([
      {
        $match: {
          type: "MembershipMilestone", // Filter for membership milestone rewards
        },
      },
      {
        $group: {
          _id: "$userId", // Group by unique user who received a reward
          totalRewardAmountForUser: { $sum: "$amount" }, // Sum rewards for each user
        },
      },
      {
        $group: {
          _id: null, // Group all results into a single document
          totalRewardsDistributed: { $sum: "$totalRewardAmountForUser" },
          totalUsersAchieved: { $sum: 1 }, // Count the number of unique users (from previous stage)
        },
      },
      {
        $project: {
          _id: 0,
          totalRewardsDistributed: 1,
          totalUsersAchieved: 1,
          averageRewardPerUser: {
            $cond: {
              if: { $gt: ["$totalUsersAchieved", 0] },
              then: { $divide: ["$totalRewardsDistributed", "$totalUsersAchieved"] },
              else: 0,
            },
          },
        },
      },
    ]);

    const result = stats[0] || {
      totalRewardsDistributed: 0,
      totalUsersAchieved: 0,
      averageRewardPerUser: 0,
    };

    // You can also get counts of active/inactive milestones from the membershipMilestone model itself
    const activeMilestonesCount = await membershipMilestone.countDocuments({ status: 'active' });
    const totalMilestonesCount = await membershipMilestone.countDocuments();

    res.status(200).json({
      success: true,
      message: "Membership milestone statistics retrieved successfully.",
      data: {
        ...result,
        totalActiveMilestones: activeMilestonesCount,
        totalMilestones: totalMilestonesCount,
      },
    });
  } catch (error) {
    console.error("Error fetching membership milestone statistics:", error);
    res.status(500).json({
      success: false,
      message: "Server error during fetching statistics.",
      error: error.message,
    });
  }
};