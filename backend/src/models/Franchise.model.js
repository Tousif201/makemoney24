// ============================
// File: models/Franchise.js
// ============================
import mongoose, { Schema, model } from "mongoose";

const franchiseSchema = new Schema(
  {
    franchiseName: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User" }, // Franchise admin
    vendors: [{ type: Schema.Types.ObjectId, ref: "Vendor" }],
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    salesRep: { type: Schema.Types.ObjectId, ref: "User", default: null }, // NEW: Reference to the sales representative who created/is associated with this franchise
  },
  {
    timestamps: true, // <--- ADD THIS LINE
  }
);
export const Franchise = model("Franchise", franchiseSchema);
