// ============================
// File: models/emi.model.js
// Description: EMI model with dynamic billing cycle support
// ============================

import mongoose from "mongoose";

const EmiSchema = new mongoose.Schema(
  {
    // User who opted for EMI
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The related order for which EMI is enabled
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    // Total amount to be paid via EMI (principal + interest)
    totalAmount: {
      type: Number,
      required: true,
    },

    // Amount paid upfront before EMI begins
    downPayment: {
      type: Number,
      required: true,
      default: 0,
    },

    // One-time fee charged for EMI processing
    processingFee: {
      type: Number,
      required: true,
      default: 0,
    },

    // Interval between each installment in days (e.g., 15 = biweekly, 30 = monthly)
    billingCycleInDays: {
      type: Number,
      required: true,
      default: 15, // Default to 15-day billing cycle
    },

    // Total number of installments based on billing cycle
    totalInstallments: {
      type: Number,
      required: true,
    },

    // Amount to be paid in each installment
    installmentAmount: {
      type: Number,
      required: true,
    },

    // Number of installments already paid
    paidInstallments: {
      type: Number,
      default: 0,
    },

    // Due date for the next installment (calculated based on billingCycleInDays)
    nextDueDate: {
      type: Date,
      required: true,
    },

    // Status of the EMI: ongoing, completed, or defaulted
    status: {
      type: String,
      enum: ["ongoing", "completed", "defaulted"],
      default: "ongoing",
    },

    // Penalty amount accumulated due to missed/late payments
    penalty: {
      type: Number,
      default: 0,
    },

    // History of all EMI payments made or attempted
    paymentHistory: [
      {
        // Date when the payment was attempted or made
        date: {
          type: Date,
          default: Date.now,
        },

        // Amount paid in that installment
        amount: {
          type: Number,
        },

        // Status of that particular payment
        status: {
          type: String,
          enum: ["paid", "failed", "pending"],
          default: "pending",
        },

        // Optional remarks for each payment entry (e.g., reason for failure)
        remarks: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

// Export the model
export default mongoose.models.Emi || mongoose.model("Emi", EmiSchema);
