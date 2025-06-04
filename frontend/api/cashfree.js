// src/api/cashfree.js
import axios from "axios";
import { backendConfig } from "../constant/config";

const backendOriginUrl = backendConfig.base;

// Create a dedicated axios instance for Cashfree API calls
const cashfreeClient = axios.create({
  baseURL: backendOriginUrl + "/cashfree", // Assuming your Cashfree backend routes start with /api/cashfree
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization token from localStorage (authToken) if your Cashfree routes are protected
cashfreeClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/**
 * Calls the backend to create a Cashfree order.
 * @param {Object} payload - Object containing order_amount, customer_details, etc.
 * Expected: { order_amount: number, customer_details: { customer_id: string, customer_phone: string, customer_email: string }, order_id?: string, order_note?: string }
 * @returns {Promise<Object>} - Promise resolving to { success: boolean, order_id: string, payment_session_id: string, order_status: string }
 */
export const createCashfreeOrder = async (payload) => {
  try {
    const response = await cashfreeClient.post("/create-order", payload);
    return response.data; // This should contain payment_session_id, order_id etc.
  } catch (error) {
    console.error("Error creating Cashfree order:", error);
    throw (
      error.response?.data || { message: "Failed to create Cashfree order" }
    );
  }
};

/**
 * Calls the backend to verify the status of a Cashfree payment.
 * @param {string} orderId - The unique order ID to verify.
 * @returns {Promise<Object>} - Promise resolving to { success: boolean, order_details: Object, order_status: string, payment_status: string }
 */
export const verifyCashfreePayment = async (orderId) => {
  try {
    const response = await cashfreeClient.get(`/verify-payment/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error verifying Cashfree payment for order ID ${orderId}:`,
      error
    );
    throw (
      error.response?.data || { message: "Failed to verify Cashfree payment" }
    );
  }
};

// Note: The handleWebhook function is a server-side controller and does not have
// a corresponding frontend API call. It's meant to receive notifications from Cashfree.
