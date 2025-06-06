// ============================
// File: models/Membership.js
// ============================
import mongoose, { Schema, model } from "mongoose";

const membershipSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  amountPaid: Number,
  transactionId: { type: Schema.Types.ObjectId, ref: "Transaction" },
membershipPackageId: { type: Schema.Types.ObjectId, ref: "MembershipPackage" },
  purchasedAt: { type: Date, default: Date.now },
  expiredAt: { type: Date }, // Expiry date of the membership
},{
  timestamps: true // <--- ADD THIS LINE
});

membershipSchema.index({ amountPaid: 1 });
membershipSchema.index({ membershipPackageId: 1 });
membershipSchema.index({ userId: 1 });
membershipSchema.index({ purchasedAt: 1 });

export const Membership = model("Membership", membershipSchema);
