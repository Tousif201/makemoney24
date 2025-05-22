// ============================
// File: models/Franchise.js
// ============================
import mongoose, { Schema, model } from "mongoose";

const franchiseSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User' }, // Franchise admin
  vendors: [{ type: Schema.Types.ObjectId, ref: 'Vendor' }],
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});
export const Franchise = model('Franchise', franchiseSchema);
