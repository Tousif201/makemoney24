// ===================================
// File: api/razorpay.js (Example - adjust if you already have it)
// ===================================
import axios from "axios";
import { backendConfig } from "../constant/config"; // Adjust path as per your project structure

const backendOriginUrl = backendConfig.base;

const apiClient = axios.create({
  baseURL: backendOriginUrl + "/razorpay", // Assuming your backend routes are prefixed with /api/razorpay
  headers: {
    "Content-Type": "application/json",
    // Add Authorization header here if your API is protected
    // 'Authorization': `Bearer ${localStorage.getItem('token')}` // Example for token
  },
});

/**
 * @desc Calls backend to create a new Razorpay order.
 * @param {Object} orderData - { amount, currency, receipt, payment_capture }
 * @returns {Promise<Object>} - The created Razorpay order object from backend.
 */
export const createRazorpayOrderApi = async (orderData) => {
  try {
    const response = await apiClient.post("/create-order", orderData);
    return response.data; // Expects { success: true, order: {...} }
  } catch (error) {
    console.error("API Error: createRazorpayOrderApi:", error);
    throw error;
  }
};

/**
 * @desc Calls backend to verify Razorpay payment signature.
 * @param {Object} verificationData - { order_id, payment_id, razorpay_signature }
 * @returns {Promise<Object>} - Verification result from backend.
 */
export const verifyPaymentApi = async (verificationData) => {
  try {
    const response = await apiClient.post("/verify-payment", verificationData);
    return response.data; // Expects { success: true/false, message: "..." }
  } catch (error) {
    console.error("API Error: verifyPaymentApi:", error);
    throw error;
  }
};