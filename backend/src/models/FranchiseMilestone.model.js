// ============================
// File: models/FranchiseMilestone.js
// ============================
const franchiseMilestoneSchema = new Schema({
  milestone: Number, // e.g., register 10 vendors
  rewardAmount: Number,
  timeLimitDays: Number
});
export const FranchiseMilestone = model('FranchiseMilestone', franchiseMilestoneSchema);
