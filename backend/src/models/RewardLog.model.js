import mongoose, { Schema, model } from "mongoose";

const rewardLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "ReferralRewardMilestone",
        "FranchiseMilestone",
        "CashbackMilestone",
        "ReferralLevelReward",
        "ProfileScoreAchievementReward",
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields
  }
);

// Optional: indexes for efficient querying
rewardLogSchema.index({ userId: 1 });
rewardLogSchema.index({ type: 1 });

export const RewardLog = model("RewardLog", rewardLogSchema);
