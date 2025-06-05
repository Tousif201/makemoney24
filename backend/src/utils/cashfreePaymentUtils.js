// src/utils/cashfreePaymentUtils.js
import { Cashfree } from "cashfree-pg";
import axios from "axios";

// -----------------------------------------------------------------------------
// PAYMENT GATEWAY (PG) SDK INSTANCE HELPER
// -----------------------------------------------------------------------------

/**
 * @function getCashfreeInstance
 * @description Helper function to get a Cashfree Payment Gateway (PG) SDK instance.
 * This centralizes the instantiation logic, ensuring consistency and
 * proper environment configuration based on NODE_ENV.
 * Note: This function is similar to one that might exist in controllers.
 * Ensure it's sourced from a single location in your project if possible to maintain DRY principle.
 * @returns {Cashfree} A new instance of the Cashfree PG SDK.
 * @throws {Error} If essential Cashfree PG environment variables are not set.
 */
const getCashfreeInstance = () => {
  // Determine the environment for the Cashfree SDK.
  const environment =
    process.env.NODE_ENV === "production"
      ? Cashfree.PRODUCTION // SDK's constant for production
      : Cashfree.SANDBOX;    // SDK's constant for sandbox

  // Crucial: Ensure required PG environment variables are set.
  if (!process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET) {
    const errorMsg =
      "FATAL ERROR in getCashfreeInstance: CASHFREE_CLIENT_ID or CASHFREE_CLIENT_SECRET for Payment Gateway is not defined in environment variables.";
    console.error(errorMsg);
    // Throwing an error here is critical as the SDK cannot be initialized.
    throw new Error(errorMsg);
  }

  // Create and return a new Cashfree SDK instance.
  return new Cashfree(
    environment,
    process.env.CASHFREE_CLIENT_ID,
    process.env.CASHFREE_CLIENT_SECRET
  );
};

// -----------------------------------------------------------------------------
// PAYMENT GATEWAY (PG) UTILITY FUNCTIONS
// -----------------------------------------------------------------------------

/**
 * @async
 * @function verifyCashfreePayment
 * @description Utility function to verify the payment status of a Cashfree PG order.
 * This queries Cashfree's API directly using the PG SDK.
 *
 * @param {string} orderId - The Cashfree Order ID (e.g., from `createOrderCF` response or webhook).
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 * - `success` (boolean): True if verification was successful and data is present.
 * - `orderDetails` (Object | undefined): Full order details from Cashfree if successful.
 * - `orderStatus` (string | undefined): Overall order status (e.g., 'PAID', 'ACTIVE').
 * - `paymentStatus` (string | undefined): Specific payment transaction status (e.g., 'SUCCESS', 'FAILED').
 * - `message` (string | undefined): Error message if not successful.
 * - `details` (any | undefined): Additional error details from Cashfree or exception.
 */
export const verifyCashfreePayment = async (orderId) => {
  // Validate input: orderId is essential.
  if (!orderId) {
    console.error(
      "[CashfreeUtil-PG] Validation Error: Order ID is required for Cashfree payment verification."
    );
    return {
      success: false,
      message: "Order ID is required for verification.",
    };
  }

  try {
    // Get a Cashfree PG SDK instance. This will throw if config is missing.
    const cashfree = getCashfreeInstance();

    console.log(
      `[CashfreeUtil-PG] Attempting to verify payment for Order ID: ${orderId}`
    );

    // Use the SDK to fetch payment details for the order.
    // Ensure PGOrderFetchPayments is the correct method for your SDK version.
    const response = await cashfree.PGOrderFetchPayments(orderId);

    if (response && response.data) {
      // Successfully fetched payment details.
      console.log(
        `[CashfreeUtil-PG] Payment verification API call successful for Order ID ${orderId}. Order Status: ${response.data.order_status}, Tx Status: ${response.data.tx_status || response.data.transaction_status}`
      );
      return {
        success: true,
        orderDetails: response.data,
        orderStatus: response.data.order_status,
        // The field for payment status might be tx_status, transaction_status, or payment_status.
        // Check Cashfree's API documentation for PGOrderFetchPayments response structure.
        paymentStatus: response.data.tx_status || response.data.transaction_status || response.data.payment_status || "N/A",
      };
    } else {
      // Cashfree API call was made, but no data was returned (e.g., order not found).
      console.warn(
        `[CashfreeUtil-PG] Payment verification for Order ID ${orderId} returned no data from Cashfree. Response:`, response
      );
      return {
        success: false,
        message: "Order not found or payment details unavailable from Cashfree.",
        details: response ? response.data : "No data in response from Cashfree",
      };
    }
  } catch (error) {
    // An error occurred during the API call or SDK usage.
    console.error(
      `[CashfreeUtil-PG] Error during Cashfree payment verification for Order ID ${orderId}:`,
      error.response ? error.response.data : error.message, // Log Cashfree's error response if available
      error.stack // Log stack trace for debugging
    );
    return {
      success: false,
      message: "An internal server error occurred during payment verification.",
      details: error.response ? error.response.data : error.message,
    };
  }
};

// -----------------------------------------------------------------------------
// PAYOUTS API UTILITY FUNCTIONS
// -----------------------------------------------------------------------------

// Define Payouts API Base URLs
// It's crucial to use the correct URLs as per Cashfree's official documentation.
// As of recent documentation, payout-gamma.cashfree.com is used for sandbox.
const PAYOUTS_PRODUCTION_URL = "https://payout-api.cashfree.com/payout";
const PAYOUTS_SANDBOX_URL = "https://payout-gamma.cashfree.com/payout"; // Updated Sandbox URL

/**
 * @async
 * @function getPayoutAuthToken
 * @description Fetches an authentication token from Cashfree Payouts API.
 * This token is required to authorize subsequent Payouts API calls.
 *
 * @returns {Promise<string>} A promise that resolves to the authentication token string.
 * @throws {Error} If fetching the token fails or if required environment variables are missing.
 */
export const getPayoutAuthToken = async () => {
  // Determine the correct base URL based on the Payouts environment.
  const PayoutsBaseUrl =
    process.env.CASHFREE_PAYOUT_ENVIRONMENT === "production"
      ? PAYOUTS_PRODUCTION_URL
      : PAYOUTS_SANDBOX_URL;

  const authUrl = `${PayoutsBaseUrl}/v1/authorize`; // Standard auth endpoint path

  // Ensure required Payouts environment variables are set.
  if (
    !process.env.CASHFREE_PAYOUT_CLIENT_ID ||
    !process.env.CASHFREE_PAYOUT_CLIENT_SECRET
  ) {
    const errorMsg =
      "FATAL ERROR in getPayoutAuthToken: CASHFREE_PAYOUT_CLIENT_ID or CASHFREE_PAYOUT_CLIENT_SECRET is not defined in environment variables.";
    console.error(errorMsg);
    throw new Error(errorMsg); // Critical error, cannot proceed.
  }

  try {
    console.log(`[CashfreeUtil-Payouts] Attempting to fetch auth token from: ${authUrl}`);
    const response = await axios.post(
      authUrl,
      {}, // Empty body for POST /authorize
      {
        headers: {
          "X-Client-Id": process.env.CASHFREE_PAYOUT_CLIENT_ID,
          "X-Client-Secret": process.env.CASHFREE_PAYOUT_CLIENT_SECRET,
          "Content-Type": "application/json", // Good practice to include Content-Type
        },
        timeout: 10000, // Set a timeout for the request (e.g., 10 seconds)
      }
    );

    // Check if token data is present in the response.
    if (response.data && response.data.data && response.data.data.token) {
      console.log("[CashfreeUtil-Payouts] Successfully fetched Payouts auth token.");
      return response.data.data.token;
    } else {
      // Unexpected response structure from Cashfree.
      console.error(
        "[CashfreeUtil-Payouts] Failed to get auth token, unexpected response structure:",
        response.data
      );
      throw new Error(
        "Failed to get auth token from Cashfree: Unexpected response structure."
      );
    }
  } catch (error) {
    // Handle errors from the Axios request or other issues.
    console.error(
      "[CashfreeUtil-Payouts] Error generating Cashfree Payouts auth token:",
      error.response ? error.response.data : error.message, // Log Cashfree's error response
      error.stack
    );
    // Re-throw a more specific error for the caller to handle.
    throw new Error(
        `Failed to get Payouts auth token from Cashfree. ${error.message || ''}`
    );
  }
};

/**
 * @async
 * @function cashfreePayoutClient
 * @description Creates and returns an Axios instance pre-configured for Cashfree Payouts API.
 * The instance includes the base URL and the necessary authorization header with a fresh token.
 *
 * @returns {Promise<import('axios').AxiosInstance>} A promise that resolves to an Axios instance.
 * @throws {Error} If fetching the Payouts auth token fails or if environment configuration is incorrect.
 */
export const cashfreePayoutClient = async () => {
  // Determine the correct base URL based on the Payouts environment.
  const PayoutsBaseUrl =
    process.env.CASHFREE_PAYOUT_ENVIRONMENT === "PROD"
      ? PAYOUTS_PRODUCTION_URL
      : PAYOUTS_SANDBOX_URL;

  // Crucial: Ensure Payouts environment variable is set to distinguish PROD from SANDBOX.
  if (!process.env.CASHFREE_PAYOUT_ENVIRONMENT) {
      const errorMsg = "FATAL ERROR in cashfreePayoutClient: CASHFREE_PAYOUT_ENVIRONMENT is not defined. Set to 'PROD' for production or other value (e.g., 'SANDBOX') for testing.";
      console.error(errorMsg);
      throw new Error(errorMsg);
  }
  console.log(`[CashfreeUtil-Payouts] Configured Payouts Base URL: ${PayoutsBaseUrl} (Env: ${process.env.CASHFREE_PAYOUT_ENVIRONMENT})`);


  try {
    // Fetch a fresh Payouts authentication token.
    const token = await getPayoutAuthToken();

    // Create and configure the Axios instance.
    const axiosInstance = axios.create({
      baseURL: PayoutsBaseUrl, // Set the base URL for all requests with this client.
      headers: {
        Authorization: `Bearer ${token}`, // Set the auth token for all requests.
        "Content-Type": "application/json",
      },
      timeout: 15000, // Set a default timeout for API calls (e.g., 15 seconds)
    });

    console.log("[CashfreeUtil-Payouts] Cashfree Payouts Axios client created successfully.");
    return axiosInstance;
  } catch (error) {
    // Error during token fetching will propagate here.
    console.error(
      "[CashfreeUtil-Payouts] Failed to create Cashfree Payouts client:",
      error.message,
      error.stack
    );
    // Re-throw the error to be handled by the caller.
    throw new Error(`Failed to initialize Cashfree Payouts client: ${error.message}`);
  }
};