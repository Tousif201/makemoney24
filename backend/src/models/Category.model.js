
// ============================
// File: models/Category.js
// ============================
import mongoose, { Schema, model } from "mongoose";

const categorySchema = new Schema({
  name: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['product', 'service'], required: true },
  createdAt: { type: Date, default: Date.now }
});
export const Category = model('Category', categorySchema);
