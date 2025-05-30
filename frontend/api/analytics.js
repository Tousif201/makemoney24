import axios from "axios";
import { backendConfig } from "../constant/config";

const backendOriginUrl = backendConfig.base;

const apiClient = axios.create({
  baseURL: backendOriginUrl, // /api is already in the url by convention, adjust if not
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * @desc Fetches dashboard analytics data for a sales representative.
 * @param {string} salesRepId - The ID of the sales representative.
 * @returns {Promise<object>} A promise that resolves to the analytics data.
 */
export const getSalesRepDashboardAnalytics = async (salesRepId) => {
  try {
    const response = await apiClient.get(
      `/analytics/get-sales-home?salesRepId=${salesRepId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching sales rep dashboard analytics:", error);
    throw error; // Re-throw the error for handling in the calling component
  }
};

/**
 * @desc Fetches dashboard analytics data for a vendor.
 * @param {string} vendorId - The ID of the vendor.
 * @returns {Promise<object>} A promise that resolves to the analytics data.
 */
export const getVendorDashboardAnalytics = async (vendorId) => {
  try {
    const response = await apiClient.get(
      `/analytics/vendor-home?vendorId=${vendorId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching vendor dashboard analytics:", error);
    throw error; // Re-throw the error for handling in the calling component
  }
};

/**
 * @desc Fetches dashboard analytics data for the admin home page.
 * @returns {Promise<object>} A promise that resolves to the analytics data.
 */
export const getAdminDashboardAnalytics = async () => {
  try {
    // No specific ID is needed for admin analytics as it's global
    const response = await apiClient.get(`/analytics/admin-home`);
    return response.data;
  } catch (error) {
    console.error("Error fetching admin dashboard analytics:", error);
    throw error; // Re-throw the error for handling in the calling component
  }
};

/**
 * @desc Fetches home analytics data for a regular user.
 * @param {string} userId - The MongoDB _id of the user.
 * @returns {Promise<object>} A promise that resolves to the user's home analytics data.
 * @throws {Error} Throws an error if userId is missing or if the API call fails.
 */
export const getUserHomeAnalytics = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required to fetch user home analytics.");
  }
  try {
    // The controller expects userId as a URL parameter (e.g., /user/home-analytics/123).
    // Assuming your user home analytics route is /user/home-analytics/:userId
    const response = await apiClient.get(`/analytics/user-home/${userId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching user home analytics for user ${userId}:`,
      error
    );
    throw error; // Re-throw the error for handling in the calling component
  }
};

export default apiClient;
