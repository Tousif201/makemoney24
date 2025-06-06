// src/api/cashfree.js
import axios from "axios";
import { backendConfig } from "../constant/config";

const backendOriginUrl = backendConfig.base;

// Create a dedicated axios instance for Cashfree API calls
const cashfreeClient = axios.create({
  baseURL: backendOriginUrl + "/cashfree", // Assuming your Cashfree backend routes start with /cashfree
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

/**
 * Calls the backend to get the Cashfree Payout account balance.
 * @returns {Promise<Object>} - Promise resolving to { success: boolean, balance: number, currency: string }
 */
export const getCashfreePayoutBalance = async () => {
  try {
    const response = await cashfreeClient.get("/payouts/balance");
    return response.data;
  } catch (error) {
    console.error("Error fetching Cashfree Payout balance:", error);
    throw (
      error.response?.data || { message: "Failed to fetch payout balance" }
    );
  }
};

/**
 * Calls the backend to verify bank account details for Cashfree Payouts.
 * @param {Object} payload - Object containing bank account details.
 * Expected: { bankAccount: string, ifsc: string }
 * @returns {Promise<Object>} - Promise resolving to { success: boolean, account_status: string, message: string, payeeName?: string }
 */
export const verifyCashfreeBankAccount = async (payload) => {
  try {
    const response = await cashfreeClient.post(
      "/payouts/verify-bank-account",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error verifying bank account:", error);
    throw error.response?.data || { message: "Failed to verify bank account" };
  }
};

/**
 * Calls the backend to initiate a Cashfree Payout (bank transfer).
 * @param {Object} payload - Object containing payout details.
 * Expected: { amount: number, bankAccount: string, ifsc: string, name: string, transferId: string, remarks?: string }
 * @returns {Promise<Object>} - Promise resolving to { success: boolean, transfer_status: string, utr?: string, referenceId: string, message?: string }
 */
export const sendCashfreePayout = async (payload) => {
  try {
    const response = await cashfreeClient.post("/payouts/transfer", payload);
    return response.data;
  } catch (error) {
    console.error("Error sending Cashfree Payout:", error);
    throw error.response?.data || { message: "Failed to send payout" };
  }
};
