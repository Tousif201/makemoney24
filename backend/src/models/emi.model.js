// ============================
// File: models/Emi.model.js
// Description: EMI model with dynamic billing cycle support
// ============================

import mongoose, { Schema, model } from "mongoose";

const emiSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    downPayment: {
      type: Number,
      required: true,
      default: 0,
    },

    processingFee: {
      type: Number,
      required: true,
      default: 0,
    },

    billingCycleInDays: {
      type: Number,
      required: true,
      default: 15,
    },

    totalInstallments: {
      type: Number,
      required: true,
    },

    installmentAmount: {
      type: Number,
      required: true,
    },

    paidInstallments: {
      type: Number,
      default: 0,
    },

    nextDueDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["ongoing", "completed", "defaulted"],
      default: "ongoing",
    },

    penalty: {
      type: Number,
      default: 0,
    },

    paymentHistory: [
      {
        transactionId: {
          type: Schema.Types.ObjectId,
          ref: "Transaction",
        },
        date: {
          type: Date,
          default: Date.now,
        },
        amount: {
          type: Number,
        },
        status: {
          type: String,
          enum: ["paid", "failed", "pending"],
          default: "pending",
        },
        remarks: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Export the model
export const Emi =  model("Emi", emiSchema);
