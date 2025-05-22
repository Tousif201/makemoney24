// ============================
// File: models/CashbackMilestone.js
// ============================
const cashbackMilestoneSchema = new Schema({
  purchaseValue: Number, // e.g., spend ₹5000
  rewardAmount: Number // cashback or wallet reward
});
export const CashbackMilestone = model('CashbackMilestone', cashbackMilestoneSchema);
