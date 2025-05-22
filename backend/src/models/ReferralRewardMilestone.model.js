// ============================
// File: models/ReferralRewardMilestone.js
// ============================
const referralRewardMilestoneSchema = new Schema({
  milestone: Number, // e.g., 5 users referred
  rewardAmount: Number, // cashback or bonus
  timeLimitDays: Number // optional time-based milestone
});
export const ReferralRewardMilestone = model('ReferralRewardMilestone', referralRewardMilestoneSchema);
