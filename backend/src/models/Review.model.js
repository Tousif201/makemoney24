// ============================
// File: models/Review.js
// ============================
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
});
export const Review = model('Review', reviewSchema);
