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
router.post("/", createReview); // Create a new review
router.get("/", getReviews); // Get all reviews (with optional filters)
router.get("/:id", getReviewById); // Get a single review by ID
router.put("/:id", updateReview); // Update an existing review
router.delete("/:id", deleteReview); // Delete a review

export default router;
