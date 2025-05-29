// ============================
// File: models/FranchiseMilestone.js
// ============================
import mongoose, { Schema, model } from "mongoose";

const franchiseMilestoneSchema = new Schema({
  milestone: Number, // e.g., register 10 vendors
  rewardAmount: Number,
  timeLimitDays: Number
},{
  timestamps: true // <--- ADD THIS LINE
});
export const FranchiseMilestone = model('FranchiseMilestone', franchiseMilestoneSchema);
