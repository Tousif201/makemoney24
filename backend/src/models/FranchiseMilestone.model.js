// ============================
// File: models/FranchiseMilestone.js
// ============================
import mongoose, { Schema, model } from "mongoose";

// Function to generate a unique 4-character alphanumeric ID
// This is a simple generator; for high-concurrency systems,
// consider more robust ID generation strategies or UUIDs.
async function generateUniqueMilestoneId() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  // Check if the generated ID already exists in the database
  const existingMilestone = await FranchiseMilestone.findOne({
    milestoneId: result,
  });
  if (existingMilestone) {
    // If it exists, recursively call to generate another one
    return generateUniqueMilestoneId();
  }
  return result;
}

const franchiseMilestoneSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Milestone name is required."],
      unique: true, // Ensures each milestone has a unique name
      trim: true, // Removes whitespace from beginning and end
      minlength: [3, "Milestone name must be at least 3 characters long."],
      maxlength: [100, "Milestone name cannot exceed 100 characters."],
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive"], // Only allows these two values
        message:
          '{VALUE} is not a supported status. Must be "active" or "inactive".',
      },
      default: "active", // Default status for new milestones
      required: true,
    },
    milestoneId: {
      type: String,
      unique: true, // Ensures each milestone has a unique 4-char ID
      required: true,
      // Add a regex to validate the format if necessary (e.g., exactly 4 alphanumeric chars)
      match: [
        /^[A-Z0-9]{4}$/,
        "Milestone ID must be 4 uppercase alphanumeric characters.",
      ],
    },
    milestone: {
      type: Number,
      required: [true, "Milestone target value is required."],
      min: [0, "Milestone target value cannot be negative."], // e.g., register 10 vendors, or achieve X amount in sales
      validate: {
        validator: Number.isInteger,
        message:
          "{VALUE} is not an integer. Milestone target must be a whole number.",
      },
    },
    rewardAmount: {
      type: Number,
      required: [true, "Reward amount is required."],
      min: [0, "Reward amount cannot be negative."], // Reward must be non-negative
      // Potentially add max value if there's an upper limit
    },
    timeLimitDays: {
      type: Number,
      default: 0, // 0 can signify no time limit, or you could use null
      min: [0, "Time limit cannot be negative."],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Pre-save hook to generate a unique 4-character milestoneId
franchiseMilestoneSchema.pre("save", async function (next) {
  // Only generate if it's a new document and milestoneId is not already set
  if (this.isNew && !this.milestoneId) {
    this.milestoneId = await generateUniqueMilestoneId();
  }
  next();
});

// Optional: Add indexes for frequently queried fields to improve performance
franchiseMilestoneSchema.index({ status: 1 });
franchiseMilestoneSchema.index({ milestone: 1 });
franchiseMilestoneSchema.index({ rewardAmount: 1 });

export const FranchiseMilestone = model(
  "FranchiseMilestone",
  franchiseMilestoneSchema
);
