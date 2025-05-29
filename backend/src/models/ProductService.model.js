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
  price: { type: Number, required: true, min: 0 },

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
  createdAt: { type: Date, default: Date.now }
},{
  timestamps: true // <--- ADD THIS LINE
});

// Add indexes for efficient querying
productServiceSchema.index({ vendorId: 1, type: 1 });
productServiceSchema.index({ categoryId: 1, type: 1 });
productServiceSchema.index({ pincode: 1 });

export const ProductService = model("ProductService", productServiceSchema);
