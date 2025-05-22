const bookingSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  serviceId: { type: Schema.Types.ObjectId, ref: 'ProductService' },
  bookingDate: { type: Date, required: true },
  timeSlot: { type: String }, // e.g., "10:00-10:30"
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

export const Booking = model('Booking', bookingSchema);
