// ============================
// File: models/CashbackMilestone.js
// ============================
import mongoose, { Schema, model } from "mongoose";

const cashbackMilestoneSchema = new Schema({
  purchaseValue: Number, // e.g., spend ₹5000
  rewardAmount: Number // cashback or wallet reward
},{
  timestamps: true // <--- ADD THIS LINE
});
export const CashbackMilestone = model('CashbackMilestone', cashbackMilestoneSchema);
