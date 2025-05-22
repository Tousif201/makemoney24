// ============================
// File: models/ReferralRewardMilestone.js
// ============================
import mongoose, { Schema, model } from "mongoose";

const referralRewardMilestoneSchema = new Schema({
  milestone: Number, // e.g., 5 users referred
  rewardAmount: Number, // cashback or bonus
  timeLimitDays: Number // optional time-based milestone
});
export const ReferralRewardMilestone = model('ReferralRewardMilestone', referralRewardMilestoneSchema);
