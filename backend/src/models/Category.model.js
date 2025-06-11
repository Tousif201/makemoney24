// ============================
// File: models/Category.model.js
// ============================
import mongoose, { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true },
    description: String,
    type: { type: String, enum: ["product", "service"], required: true },
    // Add parentId to link to a parent category
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null, // null for top-level categories
    },
    // Image field with url and key
    image: {
      url: { type: String, default: "" }, // Public URL of the image
      key: { type: String, default: "" }, // Storage key (e.g. S3 key or Cloudinary public_id)
    },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Index parentId for efficient querying of subcategories
categorySchema.index({ type: 1, parentId: 1 });
categorySchema.index({ parentId: 1 }); // Another index for general subcategory lookup

export const Category = model("Category", categorySchema);
