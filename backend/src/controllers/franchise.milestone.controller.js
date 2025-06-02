// ==========================================
// File: controllers/franchiseMilestoneController.js
// ==========================================
import { FranchiseMilestone } from "../models/FranchiseMilestone.model.js";
import { RewardLog } from "../models/RewardLog.model.js"
import mongoose from "mongoose";

/**
 * @desc Create a new franchise milestone
 * @route POST /api/milestones
 * @access Private (e.g., Admin or authorized user)
 */
export const createFranchiseMilestone = async (req, res) => {
  try {
    const {
      name,
      status,
      milestone, // The target value for the milestone (e.g., 10 vendors)
      rewardAmount,
      timeLimitDays,
    } = req.body;

    // Basic validation (more comprehensive validation can be done with libraries like Joi or Express-validator)
    if (!name || !milestone || !rewardAmount) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, milestone target, and reward amount.",
      });
    }

    // You might want to check if a milestone with the same 'name' already exists
    // The model schema already has 'unique: true' for name, so Mongoose will handle the error
    // but you can provide a more user-friendly message here.
const newMilestone = new FranchiseMilestone({
      name,
      status, // If status is not provided, it will default to 'active' as per your schema
      milestone,
      rewardAmount,
      timeLimitDays, // If not provided, it will default to 0 as per your schema
    });
    await newMilestone.save();
    res.status(201).json({
      success: true,
      message: "Franchise milestone created successfully.",
      data: newMilestone,
    });
  } catch (error) {
    // Handle Mongoose validation errors or duplicate key errors
    if (error instanceof mongoose.Error.ValidationError) {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }

    // Handle duplicate name or milestoneId error (due to `unique: true`)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      let message = `Duplicate field value: '${value}' for '${field}'. Please use another value.`;

      if (field === 'name') {
        message = `A milestone with the name '${value}' already exists. Please choose a different name.`;
      } else if (field === 'milestoneId') {
        // This case is less likely to be user-driven as milestoneId is generated automatically
        message = `A milestone with the ID '${value}' already exists. Please try again.`;
      }
      return res.status(409).json({ success: false, message });
    }

    // Generic error handling
    console.error("Error creating franchise milestone:", error);
    res.status(500).json({
      success: false,
      message: "Server error: Could not create franchise milestone.",
      error: error.message,
    });
  }
};



export const getAllFranchiseMilestones = async (req, res) => {
  try {
    const milestones = await FranchiseMilestone.find({});
    res.status(200).json({
      success: true,
      count: milestones.length,
      data: milestones,
    });
  } catch (error) {
    console.error("Error fetching franchise milestones:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to retrieve franchise milestones.",
      error: error.message,
    });
  }
};

// controllers/franchiseMilestoneController.js


// controllers/franchiseMilestoneController.js


export const deleteFranchiseMilestone = async (req, res) => {
  try {
    const { milestoneId } = req.params;

    // Look up the document by the 4-character milestoneId
    const milestone = await FranchiseMilestone.findOne({ milestoneId });
    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Franchise milestone not found.",
      });
    }

    // Delete by that same field
    await FranchiseMilestone.deleteOne({ milestoneId });

    return res.status(200).json({
      success: true,
      message: "Franchise milestone deleted successfully.",
      data: {},
    });
  } catch (error) {
    console.error(
      `Error deleting franchise milestone "${req.params.milestoneId}":`,
      error
    );
    return res.status(500).json({
      success: false,
      message: "Server Error: Unable to delete franchise milestone.",
      error: error.message,
    });
  }
};


export const updateFranchiseMilestone = async (req, res) => {
  try {
    const { name, status, milestone, rewardAmount, timeLimitDays } = req.body;

    // Find the milestone by ID
    let milestoneToUpdate = await FranchiseMilestone.findOne({milestoneId :req.params.milestoneId});

    if (!milestoneToUpdate) {
      return res.status(404).json({
        success: false,
        message: "Franchise milestone not found.",
      });
    }

    // Update fields if they are provided in the request body
    if (name !== undefined) milestoneToUpdate.name = name;
    if (status !== undefined) milestoneToUpdate.status = status;
    if (milestone !== undefined) milestoneToUpdate.milestone = milestone;
    if (rewardAmount !== undefined) milestoneToUpdate.rewardAmount = rewardAmount;
    if (timeLimitDays !== undefined) milestoneToUpdate.timeLimitDays = timeLimitDays;

    // Save the updated milestone. Mongoose will run validators on update.
    const updatedMilestone = await milestoneToUpdate.save();

    res.status(200).json({
      success: true,
      message: "Franchise milestone updated successfully.",
      data: updatedMilestone,
    });
  } catch (error) {
    console.error(`Error updating franchise milestone with ID ${req.params.id}:`, error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: messages,
      });
    }

    if (error.code === 11000) { // Duplicate key error (e.g., trying to update name to an existing one)
      return res.status(400).json({
        success: false,
        message: "Duplicate field value entered. Milestone name must be unique.",
        error: error.message,
      });
    }

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: "Invalid Milestone ID format.",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error: Unable to update franchise milestone.",
      error: error.message,
    });
  }
};


export const getFranchiseMilestoneStats = async (req, res) => {
  try {
    const stats = await RewardLog.aggregate([
      {
        // 1. Filter documents to only include 'FranchiseMilestone' type rewards
        $match: {
          type: "FranchiseMilestone",
        },
      },
      {
        // 2. Group the filtered documents to calculate statistics
        $group: {
          _id: null, // Group all matching documents into a single group
          totalRewardPaid: { $sum: "$amount" }, // Sum of all 'amount' fields
          totalUsersAchievedMilestone: { $addToSet: "$userId" }, // Get unique user IDs
          averageRewardPerMilestoneAchievement: { $avg: "$amount" }, // Average amount of each reward entry
        },
      },
      {
        // 3. Project the final output format
        $project: {
          _id: 0, // Exclude the _id field from the output
          totalRewardPaid: 1,
          averageRewardPaidPerEntry: "$averageRewardPerMilestoneAchievement", // Rename for clarity
          totalNumberOfUsersAchievedMilestone: { $size: "$totalUsersAchievedMilestone" }, // Count the unique users
        },
      },
    ]);

    // Check if any stats were found (i.e., if there are any FranchiseMilestone rewards)
    if (stats.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No Franchise Milestone reward data available yet.",
        data: {
          totalRewardPaid: 0,
          averageRewardPaidPerEntry: 0,
          totalNumberOfUsersAchievedMilestone: 0,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: stats[0], // The aggregation result is an array, we expect one object
    });
  } catch (error) {
    console.error("Error fetching franchise milestone stats:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to retrieve franchise milestone statistics.",
      error: error.message,
    });
  }
};