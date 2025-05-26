// ============================
// File: routes/review.routes.js
// ============================
import express from "express";

import {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
} from "../controllers/review.controller.js";

const router = express.Router();

// Review CRUD routes
router.post("/reviews", createReview); // Create a new review
router.get("/reviews", getReviews); // Get all reviews (with optional filters)
router.get("/reviews/:id", getReviewById); // Get a single review by ID
router.put("/reviews/:id", updateReview); // Update an existing review
router.delete("/reviews/:id", deleteReview); // Delete a review

export default router;
