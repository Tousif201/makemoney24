// ============================
// File: models/Transaction.model.js
// ============================
import mongoose, { Schema, model } from "mongoose";

const transactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: false }, // Reference to Order, not required
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: false }, // Reference to Booking, not required
  transactionType: {
    type: String,
    enum: ["withdrawal", "deposit", "payout", "cashback", "purchase", "return"],
    required: true
  },
  amount: { type: Number, required: true, min: 0 }, // Amount of the transaction
  description: { type: String, trim: true }, // Optional description for the transaction
  status: { // Optional: transaction status (e.g., success, pending, failed)
    type: String,
    enum: ['success', 'pending', 'failed'],
    default: 'success'
  },
  // New fields for Razorpay transaction details
  razorpayPaymentId: { type: String, trim: true, required: false }, // Razorpay's unique payment ID
  razorpayOrderId: { type: String, trim: true, required: false },   // Razorpay's unique order ID (if created via Razorpay Orders API)
  razorpaySignature: { type: String, trim: true, required: false }  // Signature for payment verification
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Add indexes for efficient querying
transactionSchema.index({ userId: 1 });
transactionSchema.index({ transactionType: 1 });
transactionSchema.index({ orderId: 1 });
transactionSchema.index({ bookingId: 1 });
transactionSchema.index({ razorpayPaymentId: 1 }, { unique: true, sparse: true }); // Index for quick lookup, sparse allows nulls
transactionSchema.index({ razorpayOrderId: 1 }, { sparse: true });

export const Transaction = model('Transaction', transactionSchema);
