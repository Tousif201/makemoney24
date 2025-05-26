// ============================
// File: models/Membership.js
// ============================
import mongoose, { Schema, model } from "mongoose";

const membershipSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  amountPaid: Number,
  purchasedAt: { type: Date, default: Date.now }
});
export const Membership = model('Membership', membershipSchema);
