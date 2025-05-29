// ============================
// File: models/Review.model.js
// ============================
import mongoose, { Schema, model } from "mongoose";

const reviewSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  itemId: { type: Schema.Types.ObjectId },
  itemType: { type: String, enum: ['product', 'service'] },
  rating: Number,
  comment: String,
  
  media: [{ 
    type: { type: String, enum: ['image', 'video'] }, 
    url: String 
  }],

  createdAt: { type: Date, default: Date.now }
},{
  timestamps: true // <--- ADD THIS LINE
});
reviewSchema.index({ itemId: 1, itemType: 1 });

export const Review = model('Review', reviewSchema);
