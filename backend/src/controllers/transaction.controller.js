// ============================
// File: controllers/transaction.controller.js
// ============================
import { Transaction } from "../models/Transaction.model.js";

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
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
