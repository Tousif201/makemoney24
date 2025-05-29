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

export default apiClient;
