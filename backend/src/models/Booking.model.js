// ============================
// File: models/Booking.model.js
// ============================
import mongoose, { Schema, model } from "mongoose";

const bookingSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Assuming a User model exists
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true }, // Assuming a Vendor model exists
  serviceId: { type: Schema.Types.ObjectId, ref: 'ProductService', required: true }, // Refers to a ProductService entry
  bookingDate: { type: Date, required: true },
  timeSlot: { type: String, required: true }, // e.g., "10:00-10:30"
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
},{
  timestamps: true // <--- ADD THIS LINE
});

// Add indexes for efficient querying
bookingSchema.index({ userId: 1 });
bookingSchema.index({ vendorId: 1 });
bookingSchema.index({ serviceId: 1, bookingDate: 1 });
bookingSchema.index({ status: 1 });

export const Booking = model('Booking', bookingSchema);
