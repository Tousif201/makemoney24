// ============================
// File: models/User.model.js
// ============================
import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  pincode: String,
  isMember: { type: Boolean, default: false },

  // Self-referencing parent for referral or hierarchy
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  joinedAt: {
    type: Date,
    default: Date.now,
  },

  profileScore: { type: Number, default: 0 },

  // Wallets for purchases and withdrawals
  purchaseWallet: { type: Number, default: 0 },
  withdrawableWallet: { type: Number, default: 0 },

  // Referral system
  referralCode: { type: String, unique: true },
  referredByCode: { type: String },

  // Roles to determine access levels and responsibilities
  roles: [
    {
      type: String,
      enum: ["user", "vendor", "admin", "franchise-admin", "sales-rep"],
      default: "user",
    },
  ],
  // OTP Verification Fields
  otp: {
    code: { type: String }, // Stores the OTP (hash recommended)
    expiresAt: { type: Date }, // Expiry time for OTP
    verified: { type: Boolean, default: false }, // Whether OTP is verified
    lastSentAt: { type: Date }, // When OTP was last sent
  },
});
userSchema.index({ parent: 1 });
export const User = model("User", userSchema);
