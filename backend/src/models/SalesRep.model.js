// ============================
// File: models/SalesRep.js
// ============================
const salesRepSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  assignedVendors: [{ type: Schema.Types.ObjectId, ref: 'Vendor' }],
  createdFranchises: [{ type: Schema.Types.ObjectId, ref: 'Franchise' }]
});
export const SalesRep = model('SalesRep', salesRepSchema);

