// src/controllers/cashfreeController.js
import { Cashfree } from "cashfree-pg";

// Helper function to get a Cashfree instance.
// This centralizes the instantiation logic and ensures consistency.
const getCashfreeInstance = () => {
  // Determine the environment based on NODE_ENV.
  // Cashfree.SANDBOX and Cashfree.PRODUCTION are direct string values in SDK v5+.
  const environment =
    process.env.NODE_ENV === "production"
      ? Cashfree.PRODUCTION
      : Cashfree.SANDBOX;

  // Create and return a new Cashfree SDK instance.
  return new Cashfree(
    environment,
    process.env.CASHFREE_CLIENT_ID,
    process.env.CASHFREE_CLIENT_SECRET
  );
};

/**
 * Creates a Cashfree order and returns the payment session ID.
 * This function handles the server-side logic for initiating a payment.
 * @param {Object} req - Express request object. Expected body: { order_amount, customer_details, order_id?, order_note? }
 * @param {Object} res - Express response object.
 */
export const createOrderCF = async (req, res) => {
  // Get a new Cashfree instance for this request.
  const cashfree = getCashfreeInstance();

  try {
    const {
      order_amount,
      customer_details,
      order_id,
      order_note,
      redirectPath,
    } = req.body;

    // Basic validation for required fields
    if (
      !order_amount ||
      !customer_details ||
      !customer_details.customer_id ||
      !customer_details.customer_phone ||
      !customer_details.customer_email
    ) {
      console.error(
        "Validation Error: Missing required fields for order creation."
      );
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: order_amount, customer_details (customer_id, phone, email)",
      });
    }

    // Generate a unique order_id if not provided by the frontend.
    // This ensures uniqueness for each transaction.
    const newOrderId =
      order_id || `order_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

    const orderRequest = {
      order_amount: order_amount,
      order_currency: "INR",
      order_id: newOrderId,
      customer_details: customer_details,
      order_meta: {
        // The URL where Cashfree will redirect the user after payment.
        // It's crucial to set this to your frontend's payment status page.
        return_url: `${process.env.FRONTEND_URL}/${redirectPath}?order_id={order_id}`,
        // Optional: Webhook URL for server-to-server payment status notifications.
        // Highly recommended for robust payment handling.
        notify_url: `${process.env.BACKEND_URL}/api/cashfree/webhook`,
      },
      order_note: order_note || "Payment for services/products",
      // Example for EMI (if applicable to your EMI model):
      // payment_methods: "emi" // Or "upi,cc,dc,netbanking,emi"
      // You might dynamically set payment_methods based on product type or user selection.
    };

    console.log(`Attempting to create Cashfree order with ID: ${newOrderId}`);
    // Call PGCreateOrder on the cashfree instance
    const response = await cashfree.PGCreateOrder(orderRequest);

    // Check if the order creation was successful and payment_session_id is present
    if (response && response.data && response.data.payment_session_id) {
      console.log(
        `Cashfree order created successfully. Order ID: ${response.data.order_id}`
      );
      return res.status(200).json({
        success: true,
        order_id: response.data.order_id,
        payment_session_id: response.data.payment_session_id,
        order_status: response.data.order_status, // Typically 'ACTIVE' or 'CREATED'
      });
    } else {
      console.error(
        "Cashfree order creation failed. Response data:",
        response.data
      );
      return res.status(500).json({
        success: false,
        message: "Failed to create Cashfree order",
        details: response.data || "No data received from Cashfree",
      });
    }
  } catch (error) {
    console.error(
      "Error in createOrder controller:",
      error.response ? error.response.data : error.message
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error during order creation",
      details: error.response ? error.response.data : error.message,
    });
  }
};

/**
 * Verifies the payment status of a Cashfree order by querying Cashfree's API.
 * This is crucial for server-side verification after a payment attempt.
 * @param {Object} req - Express request object. Expected params: { order_id }
 * @param {Object} res - Express response object.
 */
export const verifyPayment = async (req, res) => {
  const { order_id } = req.params;

  if (!order_id) {
    console.error(
      "Validation Error: Order ID is required for payment verification."
    );
    return res.status(400).json({
      success: false,
      message: "Order ID is required for verification.",
    });
  }

  // Get a new Cashfree instance for this verification request.
  const cashfree = getCashfreeInstance();

  try {
    console.log(`Attempting to verify payment for Order ID: ${order_id}`);
    // Call PGOrderFetchPayments on the cashfree instance
    const response = await cashfree.PGOrderFetchPayments(order_id);

    if (response && response.data) {
      console.log(
        `Payment verification successful for Order ID ${order_id}. Status: ${response.data.order_status}`
      );
      return res.status(200).json({
        success: true,
        order_details: response.data,
        order_status: response.data.order_status,
        payment_status: response.data.payment_status, // Specific payment status
      });
    } else {
      console.warn(
        `Payment verification failed for Order ID ${order_id}. No data received.`
      );
      return res.status(404).json({
        success: false,
        message: "Order not found or payment details unavailable from Cashfree",
        details: response.data || "No data received",
      });
    }
  } catch (error) {
    console.error(
      "Error in verifyPayment controller:",
      error.response ? error.response.data : error.message
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error during payment verification",
      details: error.response ? error.response.data : error.message,
    });
  }
};

/**
 * Handles Cashfree webhook notifications for asynchronous payment updates.
 * This endpoint receives real-time updates from Cashfree about payment status changes.
 * IMPORTANT: You MUST implement webhook signature verification for security.
 * @param {Object} req - Express request object (Cashfree webhook payload).
 * @param {Object} res - Express response object.
 */
export const handleWebhook = async (req, res) => {
  // === ADD THIS LOG: IMMEDIATE ENTRY POINT ===
  console.log("====================================================");
  console.log("[WEBHOOK RECEIVER] Webhook endpoint was HIT!");
  console.log("====================================================");

  // --- IMPORTANT: Implement Webhook Signature Verification ---
  // (Keep this commented out for now if you haven't set it up, but remember its importance)
  // ... (your signature verification comments)
  // --- End of Webhook Signature Verification ---

  const event = req.body; // The Cashfree webhook payload

  // === ADD THIS LOG: SHOW RECEIVED BODY ===
  console.log(
    "[WEBHOOK RECEIVER] Received raw webhook body:",
    JSON.stringify(req.body, null, 2)
  );

  console.log("[WEBHOOK RECEIVER] Webhook Event Type:", event.type);

  try {
    // === ADD THIS LOG: INSIDE TRY BLOCK ===
    console.log(
      "[WEBHOOK RECEIVER] Inside try block. Attempting to parse event data."
    );

    const orderId = event.data.order.order_id;
    const paymentStatus = event.data.payment.payment_status; // e.g., "SUCCESS", "FAILED", "PENDING"
    const paymentId = event.data.payment.cf_payment_id; // Cashfree payment ID

    console.log(
      `[WEBHOOK RECEIVER] Extracted Data: Order ID: ${orderId}, Payment Status: ${paymentStatus}, CF Payment ID: ${paymentId}`
    );

    // ** Crucial Step: Update your database with the definitive payment status **
    // This is where you would typically:
    // 1. Find the order in your database using `orderId`.
    // 2. Update its status (e.g., to 'PAID', 'FAILED', 'PENDING').
    // 3. Store `paymentId` for future reference.
    // 4. Potentially trigger other actions like sending a confirmation email,
    //    updating inventory, or fulfilling the order.

    // Example (pseudo-code - replace with your actual database logic):
    // console.log("[WEBHOOK RECEIVER] Simulating database update...");
    // await new Promise(resolve => setTimeout(resolve, 500)); // Simulate async DB operation
    // console.log(`[WEBHOOK RECEIVER] Database updated for Order ID ${orderId} with status ${paymentStatus}`);

    // Acknowledge the webhook: Cashfree expects a 200 OK response.
    // If you don't send 200, Cashfree will retry sending the webhook.
    console.log("[WEBHOOK RECEIVER] Sending 200 OK response to Cashfree.");
    res.status(200).send("Webhook received and processed successfully");
  } catch (error) {
    // === ADD THIS LOG: INSIDE CATCH BLOCK ===
    console.error(
      "[WEBHOOK RECEIVER] Error processing Cashfree Webhook payload:",
      error
    );
    console.error(
      "[WEBHOOK RECEIVER] Error details:",
      error.message,
      error.stack
    );
    // If there's an internal error processing the webhook, it's often best
    // to still send a 200 OK to prevent Cashfree from retrying indefinitely,
    // but ensure the error is logged for investigation.
    console.log(
      "[WEBHOOK RECEIVER] Sending 200 OK response despite internal error."
    );
    res.status(200).send("Error processing webhook, please check server logs.");
  }
};
