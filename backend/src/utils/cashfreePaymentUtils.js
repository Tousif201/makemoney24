// src/utils/cashfreePaymentUtils.js // You might create a new file for this
import { Cashfree } from "cashfree-pg";

// Re-use your helper function to get a Cashfree instance
const getCashfreeInstance = () => {
  const environment =
    process.env.NODE_ENV === "production"
      ? Cashfree.PRODUCTION
      : Cashfree.SANDBOX;

  return new Cashfree(
    environment,
    process.env.CASHFREE_CLIENT_ID,
    process.env.CASHFREE_CLIENT_SECRET
  );
};

/**
 * Utility function to verify the payment status of a Cashfree order.
 * This function queries Cashfree's API directly.
 *
 * @param {string} orderId - The Cashfree Order ID to verify.
 * @returns {Promise<Object>} A promise that resolves to an object containing success status,
 * order details, and specific payment status, or rejects with an error.
 * Example success: { success: true, orderDetails: {...}, paymentStatus: 'PAID' }
 * Example failure: { success: false, message: '...' }
 */
export const verifyCashfreePayment = async (orderId) => {
  if (!orderId) {
    console.error(
      "Validation Error: Order ID is required for Cashfree payment verification."
    );
    return {
      success: false,
      message: "Order ID is required for verification.",
    };
  }

  const cashfree = getCashfreeInstance();

  try {
    console.log(`[CashfreeUtil] Attempting to verify payment for Order ID: ${orderId}`);
    const response = await cashfree.PGOrderFetchPayments(orderId);

    if (response && response.data) {
      console.log(
        `[CashfreeUtil] Payment verification successful for Order ID ${orderId}. Status: ${response.data.order_status}, Payment Status: ${response.data.payment_status}`
      );
      return {
        success: true,
        orderDetails: response.data, // Contains full order details from Cashfree
        orderStatus: response.data.order_status, // Overall order status
        paymentStatus: response.data.payment_status, // Specific payment status (e.g., 'PAID', 'FAILED')
      };
    } else {
      console.warn(
        `[CashfreeUtil] Payment verification failed for Order ID ${orderId}. No data received.`
      );
      return {
        success: false,
        message: "Order not found or payment details unavailable from Cashfree.",
        details: response.data || "No data received",
      };
    }
  } catch (error) {
    console.error(
      "[CashfreeUtil] Error during Cashfree payment verification:",
      error.response ? error.response.data : error.message
    );
    return {
      success: false,
      message: "An internal server error occurred during payment verification.",
      details: error.response ? error.response.data : error.message,
    };
  }
};