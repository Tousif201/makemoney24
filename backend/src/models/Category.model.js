
// ============================
// File: models/Category.model.js
// ============================
import mongoose, { Schema, model } from "mongoose";

const categorySchema = new Schema({
  name: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['product', 'service'], required: true },
  createdAt: { type: Date, default: Date.now }
},{
  timestamps: true // <--- ADD THIS LINE
});
categorySchema.index({ type: 1 });

export const Category = model('Category', categorySchema);
