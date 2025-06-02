// ============================
// File: controllers/cashbackMilestoneController.js
// ============================

import { CashbackMilestone } from "../models/CashbackMilestone.model.js"; // Adjust the path as needed
import { RewardLog } from "../models/RewardLog.model.js"; // Adjust the path as needed

// @desc    Create a new Cashback Milestone
// @route   POST /api/cashback-milestones
// @access  Private (e.g., Admin only)
export const createCashbackMilestone = async (req, res) => {
  try {
    const newMilestone = await CashbackMilestone.create(req.body);

    res.status(201).json({
      success: true,
      message: "Cashback milestone created successfully.",
      data: newMilestone,
    });
  } catch (error) {
    console.error("Error creating cashback milestone:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: messages,
      });
    }
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(400).json({
        success: false,
        message: "Duplicate field value entered. Milestone name or ID must be unique.",
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to create cashback milestone.",
      error: error.message,
    });
  }
};

// @desc    Get all Cashback Milestones
// @route   GET /api/cashback-milestones
// @access  Private (or Public, depending on your authentication setup)
export const getAllCashbackMilestones = async (req, res) => {
  try {
    const milestones = await CashbackMilestone.find({});
    res.status(200).json({
      success: true,
      count: milestones.length,
      data: milestones,
    });
  } catch (error) {
    console.error("Error fetching cashback milestones:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to retrieve cashback milestones.",
      error: error.message,
    });
  }
};

// @desc    Get single Cashback Milestone by ID
// @route   GET /api/cashback-milestones/:id
// @access  Private (or Public)
export const getCashbackMilestoneById = async (req, res) => {
  try {
    const milestone = await CashbackMilestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Cashback milestone not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: milestone,
    });
  } catch (error) {
    console.error(`Error fetching cashback milestone with ID ${req.params.id}:`, error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "Invalid Milestone ID format.",
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to retrieve cashback milestone.",
      error: error.message,
    });
  }
};

// @desc    Update a Cashback Milestone by ID
// @route   PUT /api/cashback-milestones/:id
// @access  Private (e.g., Admin only)
export const updateCashbackMilestone = async (req, res) => {
  try {
    const { name, status, milestone, rewardAmount, timeLimitDays, purchaseValue } = req.body;

    // Find the milestone by ID and update it.
    // `new: true` returns the updated document.
    // `runValidators: true` runs schema validators on update.
    const updatedMilestone = await CashbackMilestone.findByIdAndUpdate(
      req.params.id,
      { name, status, milestone, rewardAmount, timeLimitDays, purchaseValue },
      { new: true, runValidators: true }
    );

    if (!updatedMilestone) {
      return res.status(404).json({
        success: false,
        message: "Cashback milestone not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cashback milestone updated successfully.",
      data: updatedMilestone,
    });
  } catch (error) {
    console.error(`Error updating cashback milestone with ID ${req.params.id}:`, error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: messages,
      });
    }

    if (error.code === 11000) {
      // Duplicate key error (e.g., trying to update name to an existing one)
      return res.status(400).json({
        success: false,
        message: "Duplicate field value entered. Milestone name must be unique.",
        error: error.message,
      });
    }

    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "Invalid Milestone ID format.",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error: Unable to update cashback milestone.",
      error: error.message,
    });
  }
};

// @desc    Delete a Cashback Milestone by ID
// @route   DELETE /api/cashback-milestones/:id
// @access  Private (e.g., Admin only)
export const deleteCashbackMilestone = async (req, res) => {
  try {
    const milestone = await CashbackMilestone.findOne({milestoneId:req.params.milestoneId});

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Cashback milestone not found.",
      });
    }

    await CashbackMilestone.deleteOne({ _id: milestone._id });

    res.status(200).json({
      success: true,
      message: "Cashback milestone deleted successfully.",
      data: {},
    });
  } catch (error) {
    console.error(`Error deleting cashback milestone with ID ${req.params.milestoneId}:`, error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "Invalid Milestone ID format.",
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to delete cashback milestone.",
      error: error.message,
    });
  }
};



export const getCashbackMilestoneStats = async (req, res) => {
  try {
    const stats = await RewardLog.aggregate([
      {
        // Stage 1: Filter documents to only include "CashbackMilestone" type
        $match: {
          type: "CashbackMilestone",
        },
      },
      {
        // Stage 2: Group by userId to get a sum of rewards per unique user.
        // This ensures that if a user receives multiple cashback rewards,
        // they are still counted as one user for 'totalUsersAchieved',
        // and their total received amount is summed.
        $group: {
          _id: "$userId", // Group by unique user
          userRewardAmount: { $sum: "$amount" }, // Sum of rewards for this user
        },
      },
      {
        // Stage 3: Group all results into a single document to calculate overall totals.
        $group: {
          _id: null, // Group all previous documents into one
          totalRewardAmountDistributed: { $sum: "$userRewardAmount" }, // Sum all user reward amounts
          totalUsersAchieved: { $sum: 1 }, // Count the number of unique users (from the previous stage)
        },
      },
      {
        // Stage 4: Project the final results and calculate the average.
        $project: {
          _id: 0, // Exclude the default _id field
          totalRewardAmountDistributed: 1,
          totalUsersAchieved: 1,
          // Calculate average, handling division by zero if no users achieved it
          averageReward: {
            $cond: {
              if: { $gt: ["$totalUsersAchieved", 0] },
              then: { $divide: ["$totalRewardAmountDistributed", "$totalUsersAchieved"] },
              else: 0,
            },
          },
        },
      },
    ]);

    // The aggregation pipeline returns an array. If no matching documents are found,
    // the array will be empty. We want to return a default object in that case.
    const result = stats[0] || {
      totalRewardAmountDistributed: 0,
      totalUsersAchieved: 0,
      averageReward: 0,
    };

    res.status(200).json({
      success: true,
      message: "Cashback milestone statistics retrieved successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching cashback milestone statistics:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to retrieve cashback milestone statistics.",
      error: error.message,
    });
  }
};
