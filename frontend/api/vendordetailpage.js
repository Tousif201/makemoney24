import axios from "axios";
import { backendConfig } from "../constant/config";

const backendOriginUrl = backendConfig.base;

const apiClient = axios.create({
  baseURL: backendOriginUrl + "/admin-vendor",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization token from localStorage (authToken)
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/**
 * Fetches the main analytics data for a specific vendor.
 * @param {string} vendorId - The ID of the vendor.
 * @param {string} filter - The general date filter ('today', 'weekly', 'monthly').
 * @param {string} productStatusFilter - The filter for the products table ('all', 'pending', 'approved', 'rejected').
 * @returns {Promise<object>} - The API response data.
 */
export const getVendorAnalytics = async (vendorId, filter, productStatusFilter) => {
  try {
    const params = new URLSearchParams();
    if (filter && filter !== 'total') {
      params.append('filter', filter);
    }
    if (productStatusFilter && productStatusFilter !== 'all') {
      params.append('productStatusFilter', productStatusFilter);
    }

    const response = await apiClient.get(`/vendor-analytics/${vendorId}`, { params });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching vendor analytics:", error.response?.data || error.message);
    throw error.response?.data || new Error("An unknown error occurred");
  }
};

/**
 * Processes a settlement for a vendor.
 * NOTE: You need to create this endpoint on your backend.
 * @param {string} vendorId - The ID of the vendor.
 * @param {number} amount - The amount to settle.
 * @returns {Promise<object>} - The API response data.
 */
export const processSettlement = async (vendorId, amount) => {
  try {
    // This is a hypothetical endpoint. You must create it in your backend.
    const response = await API.post(`/settlements/vendor/${vendorId}`, {
      amountSettle: amount,
    });
    return response.data;
  } catch (error) {
    console.error("Error processing settlement:", error.response?.data || error.message);
    throw error.response?.data || new Error("An unknown error occurred");
  }
};


/**
 * Updates the approval status of a product.
 * NOTE: You need to create this endpoint on your backend.
 * @param {string} productId - The ID of the product.
 * @param {string} status - The new status ('approved' or 'rejected').
 * @returns {Promise<object>} - The API response data.
 */
export const updateProductStatus = async (productId, status) => {
    try {
        // This is a hypothetical endpoint. You must create it in your backend.
        const response = await API.patch(`/products/${productId}/status`, {
            isAdminApproved: status
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating product status to ${status}:`, error.response?.data || error.message);
        throw error.response?.data || new Error("An unknown error occurred");
    }
};