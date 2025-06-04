// ============================
// File: models/Category.model.js
// ============================
import mongoose, { Schema, model } from "mongoose";

const categorySchema = new Schema({
  name: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['product', 'service'], required: true },
  // Add parentId to link to a parent category
  parentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Category', 
    default: null // null for top-level categories
  },
  createdAt: { type: Date, default: Date.now }
},{
  timestamps: true 
});

// Index parentId for efficient querying of subcategories
categorySchema.index({ type: 1, parentId: 1 }); 
categorySchema.index({ parentId: 1 }); // Another index for general subcategory lookup

export const Category = model('Category', categorySchema);