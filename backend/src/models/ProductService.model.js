// ============================
// File: models/ProductService.model.js
// ============================
import mongoose, { Schema, model } from "mongoose";

const productServiceSchema = new Schema({
  vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true }, // Assuming a Vendor model exists
  categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true }, // Assuming a Category model exists
  type: { type: String, enum: ["product", "service"], required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  details: { type: String },
  price: { type: Number, required: true, min: 0 },
  isAdminApproved: { type: String, enum: ["approved", "pending", "rejected"], default: "approved" },
  // Portfolio with media type
  portfolio: [
    {
      type: { type: String, enum: ["image", "video"], required: true },
      url: { type: String, required: true },
    },
  ],
  // Variants only for products
  variants: [
    {
      color: { type: String, trim: true },
      size: { type: String, trim: true },
      sku: { type: String, trim: true }, // Optional: unique identifier per variant
      quantity: { type: Number, default: 0, min: 0 },
      images: [{ type: String }], // optional: if you want variant-level images
    },
  ],
  pincode: { type: String, trim: true }, // Optional, useful for location-based services/products
  isBookable: { type: Boolean, default: false }, // only true for services

  // ✅ Allows vendors to toggle product/service availability
  isInStock: { type: Boolean, default: true },
  courierCharges: { type: Number, default: 0 }, // Optional, for products that can be shipped
  createdAt: { type: Date, default: Date.now },
  // New fields for EMI eligibility and discount rate
  isEmiEligible: { type: Boolean, default: false }, // User's EMI model is being incorporated.
  discountRate: { type: Number, default: 0, min: 0, max: 100 } // Assuming discount rate is a percentage
}, {
  timestamps: true // <--- ADD THIS LINE
});

// Add indexes for efficient querying
productServiceSchema.index({ vendorId: 1, type: 1 });
productServiceSchema.index({ categoryId: 1, type: 1 });
productServiceSchema.index({ pincode: 1 });
// Add an index for isEmiEligible if it will be frequently queried
productServiceSchema.index({ isEmiEligible: 1 });


export const ProductService = model("ProductService", productServiceSchema);
