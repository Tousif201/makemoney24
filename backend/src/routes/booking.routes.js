// ============================
// File: routes/booking.routes.js
// ============================
import express from "express";
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
} from "../controllers/booking.controller.js";

const router = express.Router();

// Booking CRUD routes
router.post("/", createBooking); // Create a new booking
router.get("/", getBookings); // Get all bookings (with optional filters)
router.get("/:id", getBookingById); // Get a single booking by ID
router.put("/:id", updateBooking); // Update an existing booking
router.delete("/:id", deleteBooking); // Delete a booking

export default router;
