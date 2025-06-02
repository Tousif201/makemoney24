// ============================
// File: controllers/transaction.controller.js
// ============================
import mongoose from "mongoose";
import { Transaction } from "../models/Transaction.model.js";
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * @desc Get all transactions with pagination, filtering, and sorting
 * @route GET /api/transactions
 * @access Private (assuming authentication middleware is applied)
 */
export const getAllTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      userId,
      transactionType,
      status,
      sortBy = "createdAt",
      sortOrder = "desc", // 'asc' or 'desc'
      startDate,
      endDate,
      minAmount,
      maxAmount,
    } = req.query;

    const query = {};

    // Filtering
    if (userId) {
      query.userId = userId;
    }
    if (transactionType) {
      query.transactionType = transactionType;
    }
    if (status) {
      query.status = status;
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) {
        query.amount.$gte = parseFloat(minAmount);
      }
      if (maxAmount) {
        query.amount.$lte = parseFloat(maxAmount);
      }
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await Transaction.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "name email") // Populate user details, adjust fields as needed
      .populate("orderId") // Populate order details
      .populate("bookingId"); // Populate booking details

    const totalTransactions = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total: totalTransactions,
      page: parseInt(page),
      pages: Math.ceil(totalTransactions / parseInt(limit)),
      data: transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * @desc Create a new transaction
 * @route POST /api/transactions
 * @access Private (e.g., used internally by payment gateways, order processing, or admin)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createTransaction = async (req, res) => {
  try {
    const {
      userId,
      orderId,
      bookingId,
      transactionType,
      amount,
      description,
      status,
      txnId, // Allow manual txnId if provided (e.g., from external system)
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = req.body;

    // --- Basic Validation ---
    if (!userId || !transactionType || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "User ID, transaction type, and amount are required.",
      });
    }

    if (!isValidObjectId(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID format." });
    }
    if (orderId && !isValidObjectId(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Order ID format." });
    }
    if (bookingId && !isValidObjectId(bookingId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Booking ID format." });
    }

    if (
      ![
        "withdrawal",
        "deposit",
        "payout",
        "cashback",
        "purchase",
        "return",
      ].includes(transactionType)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid transaction type. Must be one of: withdrawal, deposit, payout, cashback, purchase, return.",
      });
    }

    if (amount < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Amount cannot be negative." });
    }

    // Validate status if provided
    if (status && !["success", "pending", "failed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: success, pending, failed.",
      });
    }

    // --- Create Transaction Instance ---
    const newTransaction = new Transaction({
      userId,
      orderId: orderId || null, // Ensure null if not provided, for consistent schema
      bookingId: bookingId || null,
      transactionType,
      amount,
      description: description || "",
      status: status || "success", // Default to 'success' if not provided
      txnId, // This will be auto-generated if not provided
      razorpayPaymentId: razorpayPaymentId || null,
      razorpayOrderId: razorpayOrderId || null,
      razorpaySignature: razorpaySignature || null,
    });

    const savedTransaction = await newTransaction.save();

    res.status(201).json({
      success: true,
      message: "Transaction created successfully.",
      data: savedTransaction,
    });
  } catch (error) {
    console.error("Error creating transaction:", error);

    // Handle Mongoose duplicate key error (for txnId or razorpayPaymentId uniqueness)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `Duplicate value for ${field}. This ${field} already exists.`,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error: Could not create transaction.",
      error: error.message,
    });
  }
};
