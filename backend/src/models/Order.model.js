// ============================
// File: models/Order.js
// ============================
const orderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },

  // Array of items in the order
  items: [{
    productServiceId: { type: Schema.Types.ObjectId, ref: 'ProductService' },
    quantity: { type: Number, default: 1 },
    price: { type: Number } // Snapshot of price at order time
  }],

  totalAmount: { type: Number, required: true },

  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending' 
  },

  orderStatus: {
    type: String,
    enum: ['placed', 'confirmed', 'in-progress', 'delivered', 'cancelled'],
    default: 'placed'
  },

  placedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
orderSchema.index({ userId: 1, vendorId: 1 });
export const Order = model('Order', orderSchema);
