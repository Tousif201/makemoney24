// ============================
// File: models/Banner.js
// ============================
import mongoose, { Schema, model } from "mongoose";

const bannerSchema = new Schema({
  image: String,
  redirectTo: String, // Can link to a product/service/category/etc
  createdAt: { type: Date, default: Date.now }
});
export const Banner = model('Banner', bannerSchema);

