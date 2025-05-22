// ============================
// File: models/Vendor.js

import mongoose, { Schema, model } from "mongoose";

// ============================
const vendorSchema = new Schema({
  name: String,
  salesRep: { type: Schema.Types.ObjectId, ref: "User" },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  pincode: String,
  commissionRate: { type: Number, default: 10 }, // % commission charged from vendor
});
export const Vendor = model("Vendor", vendorSchema);
