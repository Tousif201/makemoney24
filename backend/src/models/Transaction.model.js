// ============================
// File: models/Transaction.model.js
// ============================
import mongoose, { Schema, model } from "mongoose";
import crypto from "crypto"; // For secure ID generation

const transactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: false },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: false },
    transactionType: {
      type: String,
      enum: [
        "withdrawal",
        "deposit",
        "payout",
        "cashback",
        "purchase",
        "return",
        "emi",
      ],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["success", "pending", "failed"],
      default: "success",
    },
    txnId: {
      type: String,
      unique: true,
    },

    // Razorpay fields
    razorpayPaymentId: { type: String, trim: true, required: false },
    razorpayOrderId: { type: String, trim: true, required: false },
    razorpaySignature: { type: String, trim: true, required: false },
  },
  {
    timestamps: true,
  }
);

// Indexes
transactionSchema.index({ userId: 1 });
transactionSchema.index({ transactionType: 1 });
transactionSchema.index({ orderId: 1 });
transactionSchema.index({ bookingId: 1 });
transactionSchema.index(
  { razorpayPaymentId: 1 },
  { unique: true, sparse: true }
);
transactionSchema.index({ razorpayOrderId: 1 }, { sparse: true });

/**
 * Pre-save hook to auto-generate txnId if not provided.
 * Format: TXN-yyyyMMddHHmmss-<random 4 hex chars>
 */
transactionSchema.pre("save", async function (next) {
  if (!this.txnId) {
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:.TZ]/g, "")
      .slice(0, 14);
    const random = crypto.randomBytes(2).toString("hex"); // 4-character hex string
    this.txnId = `TXN-${timestamp}-${random}`;
  }
  next();
});

export const Transaction = model("Transaction", transactionSchema);
