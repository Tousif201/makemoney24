// ============================
// File: models/Vendor.js
// ============================
const vendorSchema = new Schema({
  name: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  pincode: String,
  commissionRate: { type: Number, default: 10 } // % commission charged from vendor
});
export const Vendor = model('Vendor', vendorSchema);


