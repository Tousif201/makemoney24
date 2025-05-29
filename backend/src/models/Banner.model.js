// ============================
// File: models/Banner.model.js
// ============================
import mongoose, { Schema, model } from "mongoose";

const bannerSchema = new Schema({
  image: {
    url: { type: String, required: true }, // URL of the banner image
    key: { type: String, required: true }  // Key from Uploadthing for deletion
  },
  redirectTo: { type: String }, // Can link to a product/service/category/etc
  createdAt: { type: Date, default: Date.now }
},{
  timestamps: true // <--- ADD THIS LINE
});
export const Banner = model('Banner', bannerSchema);
