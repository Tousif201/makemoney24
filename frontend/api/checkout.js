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

// Optional: Attach Authorization token from localStorage (authToken)
// if your checkout routes are protected by authentication middleware.
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
 * @function handleOnlinePaymentCheckout
 * @description Sends a request to the backend to process an online payment checkout.
 * This typically involves creating an order and a transaction after successful payment gateway interaction.
 * @param {Object} payload - The data for the online checkout, including userId, vendorId, items, totalAmount, address, and cashfreeOrderId.
 * @returns {Promise<Object>} - A promise that resolves with the backend's response data on success, or rejects with an error.
 */
export const handleOnlinePaymentCheckout = async (payload) => {
  try {
    const response = await apiClient.post("/handle-online-checkout", payload);
    return response.data;
  } catch (error) {
    console.error("Error during online payment checkout:", error);
    // Throw a more structured error that can be caught by the calling component
    throw (
      error.response?.data || { message: "Failed to complete online checkout." }
    );
  }
};

/**
 * @function handleEmiCheckout
 * @description Sends a request to the backend to process an EMI (Equated Monthly Installment) checkout.
 * This creates an order, an initial transaction (down payment + processing fee), and an EMI plan.
 * @param {Object} payload - The data for the EMI checkout, including common order details and EMI-specific fields.
 * @returns {Promise<Object>} - A promise that resolves with the backend's response data on success, or rejects with an error.
 */
export const handleEmiCheckout = async (payload) => {
  try {
    const response = await apiClient.post("/handle-emi-checkout", payload);
    return response.data;
  } catch (error) {
    console.error("Error during EMI checkout:", error);
    // Throw a more structured error that can be caught by the calling component
    throw (
      error.response?.data || { message: "Failed to complete EMI checkout." }
    );
  }
};
