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
    return response.data;
  } catch (error) {
    // It's good practice to centralize error handling or re-throw for upstream handling
    console.error("Error fetching transactions:", error);
    throw error;
  }
};
