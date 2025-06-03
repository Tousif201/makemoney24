// ============================
// File: services/transactionService.js
// ============================
import axios from "axios";
import { backendConfig } from "../constant/config"; // Make sure this path is correct

const backendOriginUrl = backendConfig.base;

const apiClient = axios.create({
  baseURL: `${backendOriginUrl}/transactions`, // Adjusted baseURL to match your Express route
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Fetches all transactions from the backend.
 * Supports pagination, filtering, and sorting via query parameters.
 *
 * @param {object} params - Optional parameters for filtering, sorting, and pagination.
 * @param {number} [params.page=1] - The page number to fetch.
 * @param {number} [params.limit=10] - The number of items per page.
 * @param {string} [params.userId] - Filter by user ID.
 * @param {string} [params.transactionType] - Filter by transaction type (e.g., 'deposit', 'withdrawal').
 * @param {string} [params.status] - Filter by transaction status (e.g., 'success', 'pending', 'failed').
 * @param {string} [params.sortBy='createdAt'] - Field to sort by (e.g., 'createdAt', 'amount').
 * @param {string} [params.sortOrder='desc'] - Sort order ('asc' or 'desc').
 * @param {string} [params.startDate] - Start date for createdAt filter (ISO 8601 format).
 * @param {string} [params.endDate] - End date for createdAt filter (ISO 8601 format).
 * @param {number} [params.minAmount] - Minimum amount for filtering.
 * @param {number} [params.maxAmount] - Maximum amount for filtering.
 * @returns {Promise<object>} A promise that resolves to the API response data.
 */
export const getAllTransactions = async (params = {}) => {
  try {
    const response = await apiClient.get("/", { params });
    console.log("console log api transaction response",response);
    console.log("console log api transaction response.data",response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error; // Re-throw to allow component to handle
  }
};

/**
 * Creates a new transaction record in the backend.
 *
 * @param {object} transactionData - The data for the new transaction.
 * @param {string} transactionData.userId - The ID of the user associated with the transaction.
 * @param {string} transactionData.transactionType - The type of transaction (e.g., 'purchase', 'deposit').
 * @param {number} transactionData.amount - The amount of the transaction.
 * @param {string} [transactionData.orderId] - Optional: The ID of the associated order.
 * @param {string} [transactionData.bookingId] - Optional: The ID of the associated booking.
 * @param {string} [transactionData.description] - Optional: A description of the transaction.
 * @param {string} [transactionData.status='success'] - Optional: The status of the transaction.
 * @param {string} [transactionData.txnId] - Optional: An external transaction ID.
 * @param {string} [transactionData.razorpayPaymentId] - Optional: Razorpay Payment ID.
 * @param {string} [transactionData.razorpayOrderId] - Optional: Razorpay Order ID.
 * @param {string} [transactionData.razorpaySignature] - Optional: Razorpay Signature.
 * @returns {Promise<object>} A promise that resolves to the API response data of the created transaction.
 */
export const createTransaction = async (transactionData) => {
  try {
    const response = await apiClient.post("/", transactionData);
    return response.data;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error; // Re-throw to allow component to handle (e.g., show toast)
  }
};