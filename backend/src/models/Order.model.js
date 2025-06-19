// ============================
// File: models/Order.model.js
// ============================
import mongoose, { Schema, model } from "mongoose";

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },

    // Array of items in the order
    items: [
      {
        productServiceId: {
          type: Schema.Types.ObjectId,
          ref: "ProductService",
          required: true,
        },
        quantity: { type: Number, default: 1, min: 1 },
        price: { type: Number, required: true, min: 0 }, // Snapshot of price at order time
      },
    ],

    totalAmount: { type: Number, required: true, min: 0 },

    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
    },
    orderStatus: {
      type: String,
      enum: ["placed", "confirmed", "in-progress", "delivered", "cancelled","replaced","blocked"],
      default: "placed",
    },
    isAdminApproved:{ type:String,enum:["approved","rejected",],default:"approved"},
    address: { type: Schema.Types.Mixed },
    placedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // <--- ADD THIS LINE
  }
);

// Add indexes for efficient querying
orderSchema.index({ userId: 1, vendorId: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderStatus: 1 });

// Middleware to update `updatedAt` on save
orderSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export const Order = model("Order", orderSchema);
