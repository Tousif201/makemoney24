// ===================================
// File: controllers/review.controller.js
// ===================================
import { Review } from '../models/Review.model.js';
import mongoose from 'mongoose';

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * @desc Create a new review
 * @route POST /api/reviews
 * @access Public (or Private, depending on auth middleware)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createReview = async (req, res) => {
  try {
    const { userId, itemId, itemType, rating, comment, media } = req.body;

    // Basic validation
    if (!itemId || !itemType || !rating) {
      return res.status(400).json({ message: 'Item ID, item type, and rating are required.' });
    }
    if (!isValidObjectId(itemId)) {
      return res.status(400).json({ message: 'Invalid Item ID format.' });
    }
    if (userId && !isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid User ID format.' });
    }
    if (!['product', 'service'].includes(itemType)) {
      return res.status(400).json({ message: 'Item type must be "product" or "service".' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    // Prepare media array, ensuring each item has type and url
    const reviewMedia = Array.isArray(media)
      ? media.map(m => ({
          type: m.type,
          url: m.url
        }))
      : [];

    const newReview = new Review({
      userId: userId || null, // Allow userId to be optional if not authenticated
      itemId,
      itemType,
      rating,
      comment,
      media: reviewMedia,
    });

    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Get all reviews or filter by itemId/itemType/userId
 * @route GET /api/reviews
 * @access Public
 * @param {Object} req - Express request object (query parameters: itemId, itemType, userId)
 * @param {Object} res - Express response object
 */
export const getReviews = async (req, res) => {
  try {
    const { itemId, itemType, userId } = req.query;
    const filter = {};

    if (itemId) {
      if (!isValidObjectId(itemId)) {
        return res.status(400).json({ message: 'Invalid Item ID format.' });
      }
      filter.itemId = itemId;
    }
    if (itemType) {
      if (!['product', 'service'].includes(itemType)) {
        return res.status(400).json({ message: 'Item type must be "product" or "service".' });
      }
      filter.itemType = itemType;
    }
    if (userId) {
      if (!isValidObjectId(userId)) {
        return res.status(400).json({ message: 'Invalid User ID format.' });
      }
      filter.userId = userId;
    }

    const reviews = await Review.find(filter).sort({ createdAt: -1 }); // Sort by newest first
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Get a single review by ID
 * @route GET /api/reviews/:id
 * @access Public
 * @param {Object} req - Express request object (params: id)
 * @param {Object} res - Express response object
 */
export const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid Review ID format.' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }
    res.status(200).json(review);
  } catch (error) {
    console.error('Error fetching review by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Update an existing review
 * @route PUT /api/reviews/:id
 * @access Public (or Private, depending on auth middleware, e.g., only owner can update)
 * @param {Object} req - Express request object (params: id, body: fields to update)
 * @param {Object} res - Express response object
 */
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, media } = req.body; // userId, itemId, itemType are typically not updated

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid Review ID format.' });
    }

    const updateFields = {};
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
      }
      updateFields.rating = rating;
    }
    if (comment !== undefined) {
      updateFields.comment = comment;
    }
    if (media !== undefined) {
      // Ensure media is an array of objects with type and url
      if (!Array.isArray(media)) {
        return res.status(400).json({ message: 'Media must be an array.' });
      }
      updateFields.media = media.map(m => ({
        type: m.type,
        url: m.url
      }));
    }

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true } // `new: true` returns the updated document, `runValidators` ensures schema validators run
    );

    if (!updatedReview) {
      return res.status(404).json({ message: 'Review not found.' });
    }
    res.status(200).json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Delete a review
 * @route DELETE /api/reviews/:id
 * @access Public (or Private, e.g., only owner or admin can delete)
 * @param {Object} req - Express request object (params: id)
 * @param {Object} res - Express response object
 */
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid Review ID format.' });
    }

    const deletedReview = await Review.findByIdAndDelete(id);
    if (!deletedReview) {
      return res.status(404).json({ message: 'Review not found.' });
    }
    res.status(200).json({ message: 'Review deleted successfully.' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
