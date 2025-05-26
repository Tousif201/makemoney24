// ===================================
// File: controllers/booking.controller.js
// ===================================
import { Booking } from '../models/Booking.model.js';
import { ProductService } from '../models/ProductService.model.js'; // To validate serviceId
import mongoose from 'mongoose';

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * @desc Create a new booking
 * @route POST /api/bookings
 * @access Public (or Private, e.g., User role)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createBooking = async (req, res) => {
  try {
    const { userId, vendorId, serviceId, bookingDate, timeSlot, status } = req.body;

    // Basic validation for required fields
    if (!userId || !vendorId || !serviceId || !bookingDate || !timeSlot) {
      return res.status(400).json({ message: 'User ID, Vendor ID, Service ID, booking date, and time slot are required.' });
    }
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid User ID format.' });
    }
    if (!isValidObjectId(vendorId)) {
      return res.status(400).json({ message: 'Invalid Vendor ID format.' });
    }
    if (!isValidObjectId(serviceId)) {
      return res.status(400).json({ message: 'Invalid Service ID format.' });
    }

    // Validate that serviceId refers to an actual 'service' type ProductService
    const service = await ProductService.findById(serviceId);
    if (!service || service.type !== 'service' || !service.isBookable) {
      return res.status(400).json({ message: 'Service not found or is not a bookable service.' });
    }

    // Validate bookingDate format (can be more robust with a date library)
    if (isNaN(new Date(bookingDate).getTime())) {
      return res.status(400).json({ message: 'Invalid booking date format.' });
    }

    // Validate status if provided, otherwise default will apply
    if (status && !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const newBooking = new Booking({
      userId,
      vendorId,
      serviceId,
      bookingDate: new Date(bookingDate), // Ensure it's a Date object
      timeSlot,
      status: status || 'pending',
    });

    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Get all bookings or filter by various criteria
 * @route GET /api/bookings
 * @access Public (or Private, e.g., User/Vendor role)
 * @param {Object} req - Express request object (query parameters: userId, vendorId, serviceId, status, startDate, endDate)
 * @param {Object} res - Express response object
 */
export const getBookings = async (req, res) => {
  try {
    const { userId, vendorId, serviceId, status, startDate, endDate } = req.query;
    const filter = {};

    if (userId) {
      if (!isValidObjectId(userId)) return res.status(400).json({ message: 'Invalid User ID format.' });
      filter.userId = userId;
    }
    if (vendorId) {
      if (!isValidObjectId(vendorId)) return res.status(400).json({ message: 'Invalid Vendor ID format.' });
      filter.vendorId = vendorId;
    }
    if (serviceId) {
      if (!isValidObjectId(serviceId)) return res.status(400).json({ message: 'Invalid Service ID format.' });
      filter.serviceId = serviceId;
    }
    if (status) {
      if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value.' });
      }
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.bookingDate = {};
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) return res.status(400).json({ message: 'Invalid startDate format.' });
        filter.bookingDate.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) return res.status(400).json({ message: 'Invalid endDate format.' });
        // Set end of day to include all bookings on endDate
        end.setHours(23, 59, 59, 999);
        filter.bookingDate.$lte = end;
      }
    }

    const bookings = await Booking.find(filter).sort({ bookingDate: -1, timeSlot: 1 }); // Sort by newest booking date, then time slot
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Get a single booking by ID
 * @route GET /api/bookings/:id
 * @access Public (or Private, e.g., User/Vendor role)
 * @param {Object} req - Express request object (params: id)
 * @param {Object} res - Express response object
 */
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid Booking ID format.' });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    res.status(200).json(booking);
  } catch (error) {
    console.error('Error fetching booking by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Update an existing booking
 * @route PUT /api/bookings/:id
 * @access Public (or Private, e.g., User/Vendor role, only owner/related vendor can update)
 * @param {Object} req - Express request object (params: id, body: fields to update)
 * @param {Object} res - Express response object
 */
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { bookingDate, timeSlot, status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid Booking ID format.' });
    }

    const updateFields = {};
    if (bookingDate !== undefined) {
      if (isNaN(new Date(bookingDate).getTime())) {
        return res.status(400).json({ message: 'Invalid booking date format.' });
      }
      updateFields.bookingDate = new Date(bookingDate);
    }
    if (timeSlot !== undefined) {
      updateFields.timeSlot = timeSlot;
    }
    if (status !== undefined) {
      if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value.' });
      }
      // Optional: Add logic for status transitions (e.g., cannot go from 'completed' to 'pending')
      // const existingBooking = await Booking.findById(id);
      // if (existingBooking && existingBooking.status === 'completed' && status === 'pending') {
      //   return res.status(400).json({ message: 'Cannot change status from completed to pending.' });
      // }
      updateFields.status = status;
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true } // `new: true` returns the updated document, `runValidators` ensures schema validators run
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Delete a booking
 * @route DELETE /api/bookings/:id
 * @access Public (or Private, e.g., User/Vendor/Admin role)
 * @param {Object} req - Express request object (params: id)
 * @param {Object} res - Express response object
 */
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid Booking ID format.' });
    }

    const deletedBooking = await Booking.findByIdAndDelete(id);
    if (!deletedBooking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    res.status(200).json({ message: 'Booking deleted successfully.' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
