// ============================
// File: models/SalesRep.js
// ============================

import mongoose, { Schema, model } from "mongoose";

const salesRepSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  assignedVendors: [{ type: Schema.Types.ObjectId, ref: 'Vendor' }],
  createdFranchises: [{ type: Schema.Types.ObjectId, ref: 'Franchise' }]
},{
  timestamps: true // <--- ADD THIS LINE
});
export const SalesRep = model('SalesRep', salesRepSchema);

