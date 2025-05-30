// ===================================
// File: api/reward.js (Create this new file)
// ===================================
import axios from "axios";
import { backendConfig } from "../constant/config"; // Adjust path as per your project structure

const backendOriginUrl = backendConfig.base;

// Create a new axios instance for reward-related API calls
// The base URL should point to your backend's reward routes.
const apiClient = axios.create({
  baseURL: backendOriginUrl + "/reward", // Assuming your reward routes start with /reward
  headers: {
    "Content-Type": "application/json",
    // Add Authorization header here if your API is protected
    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
});

/**
 * @desc Fetches the admin reward distribution report.
 * @returns {Promise<Object>} A promise that resolves to the reward report data.
 * @throws {Error} Throws an error if the API call fails.
 */
export const adminRewardDistributionReport = async () => {
  try {
    const response = await apiClient.get("/adminRewardDistributionReport");
    return response.data;
  } catch (error) {
    console.error("Error fetching admin reward distribution report:", error);
    // Re-throw the error for the calling component to handle
    throw error;
  }
};

/**
 * @desc Fetches a specific user's reward report.
 * @param {string} userId - The ID of the user whose reward report is to be fetched.
 * @returns {Promise<Object>} A promise that resolves to the user's reward report data.
 * @throws {Error} Throws an error if the userId is missing or if the API call fails.
 */
export const userRewardReport = async (userId) => {
  // Validate that a userId is provided before making the API call.
  if (!userId) {
    throw new Error("User ID is required to fetch the user reward report.");
  }

  try {
    // The controller expects userId as a URL parameter (e.g., /userRewardReport/123).
    // Construct the GET request URL with the userId embedded in the path.
    const response = await apiClient.get(`/userRewardReport/${userId}`);
    return response.data;
  } catch (error) {
    // Log the error for debugging purposes.
    console.error(
      `Error fetching user reward report for user ${userId}:`,
      error
    );
    // Re-throw the error to allow the calling component/function to handle it.
    throw error;
  }
};
