import mongoose, { Schema, model } from "mongoose";

const vendorAvailabilitySchema = new Schema({
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },

  // Days of the week availability
  weeklyAvailability: [{
    day: { type: String, enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
    isAvailable: { type: Boolean, default: false },
    startTime: String, // e.g., "09:00"
    endTime: String    // e.g., "17:00"
  }],

  // Slot duration in minutes (e.g., 30 mins)
  slotDuration: { type: Number, default: 30 },

  // Optional buffer between bookings (in minutes)
  bufferBetweenSlots: { type: Number, default: 0 }
},{
  timestamps: true // <--- ADD THIS LINE
});

export const VendorAvailability = model('VendorAvailability', vendorAvailabilitySchema);
