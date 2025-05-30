// ===================================
// File: api/referral.js
// ===================================
import axios from "axios";
import { backendConfig } from "../constant/config"; // Assuming this path is correct for your backend configuration

// Define the base URL for referral-related API calls
const backendOriginUrl = backendConfig.base;

/**
 * Axios client instance configured for referral API endpoints.
 * It automatically prepends '/referral' to all requests made through this client.
 */
const apiClient = axios.create({
  baseURL: backendOriginUrl + "/referral", // Base URL for referral-related API calls (e.g., http://yourbackend.com/api/referral)
  headers: {
    "Content-Type": "application/json", // Standard header for JSON payloads
    // Add authorization header if needed, e.g., 'Authorization': `Bearer ${token}`
    // You would typically get the token from a session or authentication context.
  },
});

/**
 * Fetches the multi-level referral data for a specific user.
 * This API call expects the user ID as a query parameter.
 *
 * @param {string} userId - The ID of the user whose referral level data is to be fetched.
 * @returns {Promise<Object>} A promise that resolves to the referral level data.
 * The data structure should match the 'levelData' format
 * (e.g., { success: true, data: { level1: {...}, level2: {...} } }).
 * @throws {Error} Throws an error if the userId is missing or if the API call fails.
 */
export const getreferralLevelDataApi = async (userId) => {
  // Validate that a userId is provided before making the API call.
  if (!userId) {
    throw new Error("User ID is required to fetch referral level data.");
  }

  try {
    // Construct the GET request URL.
    // The path '/getreferralLevelData' is appended to the apiClient's baseURL
    // (which is backendOriginUrl + "/referral").
    // The userId is sent as a query parameter.
    const response = await apiClient.get(
      `/getreferralLevelData?userId=${userId}` // Corrected endpoint to match controller name
    );

    // Return the data part of the Axios response.
    // Axios wraps the actual server response in a 'data' property.
    return response.data;
  } catch (error) {
    // Log the error for debugging purposes.
    console.error("Error fetching referral level data:", error);

    // Re-throw the error to allow the calling component/function to handle it.
    // This ensures that the UI can display an appropriate error message to the user.
    throw error;
  }
};