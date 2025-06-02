// ============================
// File: api/checkout.js
// ============================

import axios from "axios";
// Assuming backendConfig is available at this path
import { backendConfig } from "../constant/config";

// Get the base URL from the backend configuration
const backendOriginUrl = backendConfig.base;

/**
 * @constant apiClient
 * @description An Axios instance configured for the checkout API endpoint.
 * It sets the base URL and default headers for JSON content.
 */
const apiClient = axios.create({
  baseURL: backendOriginUrl + "/checkout", // Base URL for checkout-related API calls
  headers: {
    "Content-Type": "application/json", // Ensures all requests send JSON data
  },
});

/**
 * @function handleCheckout
 * @description Sends a POST request to the backend's /handle-checkout endpoint
 * to initiate the checkout process.
 * @param {Object} checkoutData - The data required for checkout, typically including:
 * @param {string} checkoutData.userId - The ID of the user placing the order.
 * @param {string} checkoutData.vendorId - The ID of the vendor for the order.
 * @param {Array<Object>} checkoutData.items - An array of product/service items.
 * @param {string} checkoutData.items[].productServiceId - The ID of the product/service.
 * @param {number} checkoutData.items[].quantity - The quantity of the product/service.
 * @param {number} checkoutData.items[].price - The price of the product/service at order time.
 * @param {number} checkoutData.totalAmount - The total amount of the order.
 * @param {Object} checkoutData.address - The delivery/billing address details.
 * @returns {Promise<Object>} A promise that resolves with the API response data
 * or rejects with an error.
 */
export const handleCheckout = async (checkoutData) => {
  try {
    const response = await apiClient.post("/handle-checkout", checkoutData);
    return response.data;
  } catch (error) {
    // Log the error for debugging purposes
    console.error(
      "Error during checkout:",
      error.response ? error.response.data : error.message
    );
    // Re-throw the error so it can be handled by the calling component/function
    throw error;
  }
};
