// ===================================
// File: api/wallet.api.js
// ===================================
import axios from "axios";
import { backendConfig } from "../constant/config"; // Assuming this path is correct

const backendOriginUrl = backendConfig.base;

const apiClient = axios.create({
  baseURL: backendOriginUrl + "/wallet", // Base URL for wallet-related API calls
  headers: {
    "Content-Type": "application/json",
    // Add authorization header if needed, e.g., 'Authorization': `Bearer ${token}`
  },
});

/**
 * Fetches the wallet history for a specific user.
 * @param {string} userId - The ID of the user whose wallet history is to be fetched.
 * @returns {Promise<Object>} A promise that resolves to the wallet history data.
 * @throws {Error} Throws an error if the API call fails.
 */
export const getUserWalletHistoryApi = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required to fetch wallet history.");
  }

  try {
    // The route is GET /api/wallet/get-user-wallet-histtory
    // and expects userId as a query parameter.
    const response = await apiClient.get(
      `/get-user-wallet-histtory?userId=${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user wallet history:", error);
    // You might want to throw a more specific error or handle it differently
    throw error;
  }
};
/**
 * Fetches the wallet history for a specific user.
 * @param {string} userId - The ID of the user whose wallet history is to be fetched.
 * @returns {Promise<Object>} A promise that resolves to the wallet history data.
 * @throws {Error} Throws an error if the API call fails.
 */
export const getUserWalletTransactionsApi = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required to fetch wallet transaction.");
  }

  try {
    // The route is GET /api/wallet/get-user-wallet-histtory
    // and expects userId as a query parameter.
    const response = await apiClient.get(
      `/get-user-wallet-transactions?userId=${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user wallet transaction:", error);
    // You might want to throw a more specific error or handle it differently
    throw error;
  }
};
