// src/controllers/cashfreeController.js
import { Cashfree } from "cashfree-pg";
import { cashfreePayoutClient } from "../utils/cashfreePaymentUtils.js";

// -----------------------------------------------------------------------------
// HELPER FUNCTIONS
// -----------------------------------------------------------------------------

/**
 * @function getCashfreeInstance
 * @description Helper function to get a Cashfree PG SDK instance.
 * This centralizes the instantiation logic, ensuring consistency and
 * proper environment configuration based on NODE_ENV.
 * @returns {Cashfree} A new instance of the Cashfree SDK.
 */
const getCashfreeInstance = () => {
  // Determine the environment for the Cashfree SDK.
  // Cashfree.SANDBOX and Cashfree.PRODUCTION are direct string values in SDK v5+.
  // It's crucial to use 'production' for live transactions and 'sandbox' for testing.
  const environment =
    process.env.NODE_ENV === "production"
      ? Cashfree.PRODUCTION
      : Cashfree.SANDBOX;

  // Ensure required environment variables are set.
  if (!process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET) {
    console.error(
      "FATAL ERROR: CASHFREE_CLIENT_ID or CASHFREE_CLIENT_SECRET is not defined in environment variables."
    );
    // Depending on application structure, you might want to throw an error here
    // or handle it in a way that prevents the application from running in an invalid state.
  }

  // Create and return a new Cashfree SDK instance with the specified credentials.
  return new Cashfree(
    environment,
    process.env.CASHFREE_CLIENT_ID,
    process.env.CASHFREE_CLIENT_SECRET
  );
};

// -----------------------------------------------------------------------------
// PAYMENT GATEWAY (PG) CONTROLLERS
// -----------------------------------------------------------------------------

/**
 * @async
 * @function createOrderCF
 * @description Creates a Cashfree order and returns the payment session ID.
 * This function handles the server-side logic for initiating a payment.
 * It validates input, generates a unique order ID if necessary,
 * and communicates with the Cashfree API to create a payment order.
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.body - The body of the request.
 * @param {number} req.body.order_amount - The amount of the order.
 * @param {Object} req.body.customer_details - Customer information.
 * @param {string} req.body.customer_details.customer_id - Unique ID for the customer.
 * @param {string} req.body.customer_details.customer_phone - Customer's phone number.
 * @param {string} req.body.customer_details.customer_email - Customer's email address.
 * @param {string} req.body.redirectPath - The frontend path (e.g., "payment/success" or "checkout/complete")
 * where the user should be redirected after payment attempt.
 * The base FRONTEND_URL will be prepended.
 * @param {string} [req.body.order_id] - Optional: A unique order ID from your system. If not provided, one will be generated.
 * @param {string} [req.body.order_note] - Optional: A note for the order.
 * @param {Object} res - Express response object.
 *
 * @returns {Promise<Object>} Resolves with a JSON response containing success status, order ID,
 * payment session ID, and order status, or an error message.
 */
export const createOrderCF = async (req, res) => {
  // Get a new Cashfree PG SDK instance for this request.
  const cashfree = getCashfreeInstance();

  try {
    const {
      order_amount,
      customer_details,
      order_id, // User-provided order_id (optional)
      order_note,
      redirectPath, // Path for frontend redirection post-payment
    } = req.body;

    // Basic validation for required fields
    if (
      !order_amount ||
      !customer_details ||
      !customer_details.customer_id ||
      !customer_details.customer_phone ||
      !customer_details.customer_email ||
      !redirectPath // Ensure redirectPath is also provided
    ) {
      console.error(
        "Validation Error in createOrderCF: Missing required fields."
      );
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: order_amount, customer_details (with customer_id, customer_phone, customer_email), and redirectPath.",
      });
    }

    // Generate a unique order_id if not provided by the frontend.
    // This ensures each transaction has a distinct identifier.
    // Format: "order_" + timestamp + "_" + random_number
    const newOrderId =
      order_id || `order_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

    // Construct the order request payload for Cashfree.
    const orderRequest = {
      order_amount: parseFloat(order_amount), // Ensure amount is a number
      order_currency: "INR", // Standard currency for Indian transactions
      order_id: newOrderId,
      customer_details: {
        customer_id: customer_details.customer_id,
        customer_phone: customer_details.customer_phone,
        customer_email: customer_details.customer_email,
        // customer_name: customer_details.customer_name, // Optional: if you collect customer name
      },
      order_meta: {
        // The URL where Cashfree will redirect the user after payment completion (success or failure).
        // It's crucial this points to your frontend's payment status handling page.
        // {order_id} is a placeholder that Cashfree replaces with the actual order ID.
        return_url: `${process.env.FRONTEND_URL}/${redirectPath}?order_id={order_id}`,

        // Optional but Highly Recommended: Webhook URL for server-to-server payment status notifications.
        // This ensures robust payment handling even if the user closes the browser prematurely.
        notify_url: `${process.env.BACKEND_URL}/api/cashfree/webhook`,
      },
      order_note: order_note || "Payment for services/products", // Default note if none provided
      // Example for enabling specific payment methods, including EMI (if applicable to your emi model):
      // payment_methods: "emi" // To only show EMI
      // payment_methods: "cc,dc,upi,nb,paypal,emi,paylater" // To show multiple options including EMI
      // You might dynamically set payment_methods based on product type, order amount, or user selection.
      // For your "emi model", you might want to ensure "emi" is included here if it's a primary payment option.
    };

    console.log(
      `Attempting to create Cashfree order. Request ID: ${newOrderId}, Amount: ${order_amount}`
    );

    // Call the PGCreateOrder method on the Cashfree SDK instance.
    // Note: Ensure you are using the correct method name as per your Cashfree SDK version.
    // For SDK v3, it was `cashfree.orders.createOrder(orderRequest)`.
    // For SDK v5+, it seems to be `cashfree.PGCreateOrder(orderRequest)`.
    const response = await cashfree.PGCreateOrder(orderRequest);

    // Check if the order creation was successful and if a payment_session_id is present.
    if (response && response.data && response.data.payment_session_id) {
      console.log(
        `Cashfree order created successfully. Order ID: ${response.data.order_id}, Payment Session ID: ${response.data.payment_session_id}`
      );
      return res.status(200).json({
        success: true,
        order_id: response.data.order_id,
        payment_session_id: response.data.payment_session_id,
        order_status: response.data.order_status, // Typically 'ACTIVE' or 'CREATED' initially
      });
    } else {
      // Handle cases where order creation might fail at Cashfree's end.
      console.error(
        "Cashfree order creation failed. Response from Cashfree:",
        response.data
      );
      return res.status(500).json({
        success: false,
        message: "Failed to create Cashfree order. Please check Cashfree response.",
        details: response.data || "No data received from Cashfree",
      });
    }
  } catch (error) {
    // Catch any unexpected errors during the process.
    console.error(
      "Error in createOrderCF controller:",
      error.response ? error.response.data : error.message, // Log detailed error if available from Cashfree
      error.stack // Log stack trace for debugging
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error during order creation.",
      details: error.response ? error.response.data : error.message,
    });
  }
};

/**
 * @async
 * @function verifyPayment
 * @description Verifies the payment status of a Cashfree order by querying Cashfree's API.
 * This is a crucial step for server-side confirmation of payment after the user
 * is redirected back to the application or via webhook notification.
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.params - URL parameters.
 * @param {string} req.params.order_id - The ID of the order to verify.
 * @param {Object} res - Express response object.
 *
 * @returns {Promise<Object>} Resolves with a JSON response containing success status,
 * order details, order status, and payment status, or an error message.
 */
export const verifyPayment = async (req, res) => {
  const { order_id } = req.params;

  // Validate that an order_id is provided.
  if (!order_id) {
    console.error(
      "Validation Error in verifyPayment: Order ID is required."
    );
    return res.status(400).json({
      success: false,
      message: "Order ID is required for payment verification.",
    });
  }

  // Get a new Cashfree PG SDK instance.
  const cashfree = getCashfreeInstance();

  try {
    console.log(`Attempting to verify payment for Order ID: ${order_id}`);

    // Call the PGOrderFetchPayments method on the Cashfree SDK instance to get payment details.
    // For SDK v3, this might have been `cashfree.orders.getOrder(order_id)` or similar.
    // For SDK v5+, it seems to be `cashfree.PGOrderFetchPayments(order_id)`.
    const response = await cashfree.PGOrderFetchPayments(order_id);

    // Check if payment details were successfully fetched.
    if (response && response.data) {
      console.log(
        `Payment verification successful for Order ID: ${order_id}. Current Order Status: ${response.data.order_status}, Payment Status: ${response.data.tx_status || response.data.payment_status}` // tx_status or payment_status depending on API version response
      );
      return res.status(200).json({
        success: true,
        order_details: response.data, // Contains all details returned by Cashfree
        order_status: response.data.order_status,
        // Note: The exact field for payment status might vary (e.g., tx_status, transaction_status, payment_status).
        // Refer to Cashfree documentation for the specific response structure of PGOrderFetchPayments.
        payment_status: response.data.tx_status || response.data.payment_status || "N/A",
      });
    } else {
      // Handle cases where the order is not found or details are unavailable.
      console.warn(
        `Payment verification query for Order ID ${order_id} returned no data or failed at Cashfree's end.`
      );
      return res.status(404).json({
        success: false,
        message:
          "Order not found or payment details unavailable from Cashfree.",
        details: response.data || "No data received from Cashfree API",
      });
    }
  } catch (error) {
    // Catch any unexpected errors during the verification process.
    console.error(
      `Error in verifyPayment controller for Order ID ${order_id}:`,
      error.response ? error.response.data : error.message,
      error.stack
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error during payment verification.",
      details: error.response ? error.response.data : error.message,
    });
  }
};

/**
 * @async
 * @function handleWebhook
 * @description Handles incoming Cashfree webhook notifications for asynchronous payment updates.
 * This endpoint receives real-time updates from Cashfree about changes in payment status
 * (e.g., SUCCESS, FAILED, PENDING).
 *
 * IMPORTANT: Implement Webhook Signature Verification for security.
 * This ensures that the webhook request genuinely originated from Cashfree and
 * has not been tampered with. The signature verification logic involves using your
 * webhook secret key provided by Cashfree.
 *
 * @param {Object} req - Express request object (contains the Cashfree webhook payload in req.body).
 * @param {Object} res - Express response object.
 *
 * @returns {Promise<void>} Sends a 200 OK response to Cashfree to acknowledge receipt.
 */
export const handleWebhook = async (req, res) => {
  // Log the entry point of the webhook handler.
  console.log("====================================================");
  console.log("[WEBHOOK RECEIVER] Webhook endpoint was HIT!");
  console.log("Timestamp:", new Date().toISOString());
  console.log("====================================================");

  // --- IMPORTANT: Webhook Signature Verification ---
  // You MUST implement webhook signature verification in a production environment.
  // This is critical for security to ensure the payload is from Cashfree and not tampered with.
  // Example (conceptual - refer to Cashfree documentation for exact implementation):
  // const receivedSignature = req.headers['x-webhook-signature'];
  // const timestamp = req.headers['x-webhook-timestamp'];
  // const payload = JSON.stringify(req.body); // Use the raw body if possible
  // const secretKey = process.env.CASHFREE_WEBHOOK_SECRET;
  // try {
  //   Cashfree.webhooks.verifySignature(payload, receivedSignature, timestamp, secretKey);
  //   console.log("[WEBHOOK RECEIVER] Signature verified successfully.");
  // } catch (err) {
  //   console.error("[WEBHOOK RECEIVER] Webhook signature verification FAILED:", err.message);
  //   return res.status(403).send("Webhook signature verification failed.");
  // }
  // --- End of Webhook Signature Verification ---

  const event = req.body; // The Cashfree webhook payload

  // Log the received webhook body for debugging purposes.
  // Be mindful of sensitive data if logging entire payloads in production.
  console.log(
    "[WEBHOOK RECEIVER] Received raw webhook body:",
    JSON.stringify(event, null, 2) // Pretty print JSON
  );

  // Ensure the event and necessary data structures are present.
  if (!event || !event.data || !event.data.order || !event.data.payment) {
    console.error(
      "[WEBHOOK RECEIVER] Invalid webhook payload structure. Missing event.data.order or event.data.payment."
    );
    // Sending 200 to prevent retries for a malformed payload that we can't process.
    return res.status(200).send("Webhook received but payload structure is invalid.");
  }

  console.log("[WEBHOOK RECEIVER] Webhook Event Type:", event.type); // e.g., "PAYMENT_SUCCESS_WEBHOOK", "ORDER_PAID"

  try {
    console.log(
      "[WEBHOOK RECEIVER] Inside try block. Attempting to parse event data."
    );

    // Extract relevant information from the webhook payload.
    // The exact paths might vary slightly based on Cashfree API version and event type.
    // Always refer to the Cashfree documentation for the most accurate payload structure.
    const orderId = event.data.order.order_id;
    const paymentStatus = event.data.payment.payment_status; // e.g., "SUCCESS", "FAILED", "PENDING", "CHARGED_BACK"
    const paymentAmount = event.data.order.order_amount; // Typically the authorized amount
    const cfPaymentId = event.data.payment.cf_payment_id; // Cashfree's unique payment ID
    const paymentInstrument = event.data.payment.payment_instrument; // e.g., "upi", "credit_card"
    const eventTime = event.data.event_time; // Timestamp of the event

    console.log(
      `[WEBHOOK RECEIVER] Extracted Data: Order ID: ${orderId}, Payment Status: ${paymentStatus}, CF Payment ID: ${cfPaymentId}, Amount: ${paymentAmount}, Instrument: ${paymentInstrument}, Event Time: ${eventTime}`
    );

    // ** Crucial Step: Update your database with the definitive payment status. **
    // This is where you implement your application's business logic based on the webhook.
    // 1. Idempotency: Ensure processing the same webhook multiple times doesn't cause issues.
    //    Check if this specific event (e.g., by cf_payment_id or a unique event ID if provided) has already been processed.
    // 2. Find the order in your database using `orderId`.
    // 3. Update its status (e.g., to 'PAID', 'FAILED', 'REFUNDED').
    // 4. Store `cfPaymentId` and other relevant payment details for reconciliation and records.
    // 5. Trigger other business processes:
    //    - Send confirmation emails/SMS to the customer.
    //    - Update inventory levels.
    //    - Grant access to services/digital products.
    //    - Notify relevant internal teams.

    // Example (pseudo-code - replace with your actual database and business logic):
    /*
    const existingOrder = await YourOrderModel.findOne({ orderId: orderId });
    if (existingOrder) {
      if (existingOrder.status !== paymentStatus) { // Process only if status is different
        existingOrder.status = paymentStatus;
        existingOrder.cashfreePaymentId = cfPaymentId;
        existingOrder.paymentInstrument = paymentInstrument;
        existingOrder.lastWebhookAt = new Date(eventTime);
        await existingOrder.save();
        console.log(`[WEBHOOK RECEIVER] Database updated for Order ID ${orderId} to status ${paymentStatus}.`);

        if (paymentStatus === "SUCCESS") {
          // Trigger successful order fulfillment logic
          // await sendOrderConfirmationEmail(existingOrder);
          // await provisionService(existingOrder);
        } else if (paymentStatus === "FAILED") {
          // Trigger failed order logic
          // await sendPaymentFailedEmail(existingOrder);
        }
      } else {
        console.log(`[WEBHOOK RECEIVER] Order ID ${orderId} already has status ${paymentStatus}. No update needed.`);
      }
    } else {
      console.warn(`[WEBHOOK RECEIVER] Order ID ${orderId} not found in database.`);
      // Consider if this scenario requires special handling or logging.
    }
    */
    console.log(
      `[WEBHOOK RECEIVER] Business logic for Order ID ${orderId} (status: ${paymentStatus}) would be processed here.`
    );

    // Acknowledge the webhook: Cashfree expects a 200 OK HTTP status code.
    // If you don't send a 200 OK, Cashfree will retry sending the webhook multiple times,
    // which could lead to duplicate processing if your handler is not idempotent.
    console.log(
      "[WEBHOOK RECEIVER] Sending 200 OK response to Cashfree to acknowledge receipt."
    );
    res.status(200).send("Webhook received and acknowledged successfully.");
  } catch (error) {
    // Handle any errors that occur during webhook processing.
    console.error(
      "[WEBHOOK RECEIVER] Error processing Cashfree Webhook payload:",
      error
    );
    console.error(
      "[WEBHOOK RECEIVER] Error details - Message:",
      error.message
    );
    console.error("[WEBHOOK RECEIVER] Error details - Stack:", error.stack);

    // It's generally recommended to still send a 200 OK for critical processing errors
    // IF your system has robust logging and alerting for these internal errors.
    // This prevents Cashfree from retrying indefinitely for an error that might be on your end
    // and requires manual intervention. However, if the error is transient (e.g., temporary DB unavailability),
    // a non-200 status might be appropriate to trigger retries. Assess based on error type.
    // For this example, we send 200 to stop retries but log the error thoroughly.
    console.log(
      "[WEBHOOK RECEIVER] Sending 200 OK response despite internal error to prevent Cashfree retries. Please check server logs for critical failure."
    );
    res
      .status(200)
      .send("Error processing webhook internally. Please check server logs.");
  }
};

// -----------------------------------------------------------------------------
// PAYOUTS CONTROLLERS
// -----------------------------------------------------------------------------

/**
 * @async
 * @function getBalance
 * @description Fetches the available payout balance from Cashfree.
 * Uses the `cashfreePayoutClient` which should be configured for Payouts API.
 *
 * @param {Object} req - Express request object (not directly used but standard for controllers).
 * @param {Object} res - Express response object.
 *
 * @returns {Promise<Object>} Resolves with a JSON response containing success status,
 * available balance, and the full Cashfree response, or an error message.
 */
export const getBalance = async (req, res) => {
  try {
    // Obtain the pre-configured Axios client for Cashfree Payouts API.
    const client = await cashfreePayoutClient(); // This function should handle Payouts authentication.

    console.log("Attempting to fetch Cashfree Payout account balance.");
    // Make a GET request to the getBalance endpoint for Payouts.
    const response = await client.get("/payout/v1/getBalance");

    if (response.data && response.data.status === "SUCCESS" && response.data.data) {
      console.log(
        `Successfully fetched balance. Available: ${response.data.data.availableBalance}`
      );
      return res.status(200).json({
        success: true,
        balance: response.data.data.availableBalance, // The actual available balance figure
        response: response.data, // The full response from Cashfree for reference
      });
    } else {
      console.error(
        "Failed to get balance from Cashfree or unexpected response structure:",
        response.data
      );
      return res.status(response.status || 500).json({
        success: false,
        message: "Failed to fetch balance or unexpected response from Cashfree.",
        details: response.data,
      });
    }
  } catch (error) {
    console.error(
      "Error in getBalance controller (Cashfree Payouts):",
      error.response ? error.response.data : error.message,
      error.stack
    );
    return res.status(error.response?.status || 500).json({
      success: false,
      message: "Internal server error while fetching Cashfree Payout balance.",
      error: error.response?.data || error.message,
    });
  }
};

/**
 * @async
 * @function verifyBank
 * @description Verifies bank account details (account number and IFSC) using Cashfree Payouts API.
 * This is useful for validating beneficiary bank details before initiating a payout.
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.bankAccount - The bank account number to verify.
 * @param {string} req.body.ifsc - The IFSC code of the bank.
 * @param {Object} res - Express response object.
 *
 * @returns {Promise<Object>} Resolves with a JSON response containing success status,
 * verification status (verified true/false), bank name if found, and the full Cashfree response, or an error message.
 */
export const verifyBank = async (req, res) => {
  const { bankAccount, ifsc } = req.body;

  // Validate input: bankAccount and ifsc are mandatory.
  if (!bankAccount || !ifsc) {
    console.error(
      "Validation Error in verifyBank: bankAccount and ifsc are required."
    );
    return res.status(400).json({
      success: false,
      message: "Bank account number (bankAccount) and IFSC code (ifsc) are required.",
    });
  }

  try {
    // Obtain the pre-configured Axios client for Cashfree Payouts API.
    const client = await cashfreePayoutClient();

    console.log(
      `Attempting to verify bank details: Account: ${bankAccount}, IFSC: ${ifsc}`
    );
    console.log(client)
    // Make a POST request to the validateBankDetails endpoint.
    const response = await client.post("/payout/v1/validateBankDetails", {
      bankAccount,
      ifsc,
    });
console.log(response.data)
    if (response.data && response.data.status === "SUCCESS" && response.data.data) {
      const isVerified = response.data.data.bankName !== "" && response.data.data.accountStatus === "VALID";
      console.log(
        `Bank verification result for ${bankAccount}: Verified: ${isVerified}, Bank Name: ${response.data.data.bankName}, Account Status: ${response.data.data.accountStatus}`
      );
      return res.status(200).json({
        success: true,
        verified: isVerified, // True if bankName is returned and account is valid, indicating successful verification.
        bankName: response.data.data.bankName, // Name of the bank if verification is successful.
        accountStatus: response.data.data.accountStatus, // More detailed status from Cashfree
        message: response.data.data.message, // Message from Cashfree, e.g., "Valid BENKA Invalid IFSC"
        response: response.data, // Full response from Cashfree.
      });
    } else {
      console.error(
        "Bank verification failed or unexpected response from Cashfree:",
        response.data
      );
      return res.status(response.status || 500).json({
        success: false,
        message: response.data?.message || "Bank verification failed or unexpected response from Cashfree.",
        details: response.data,
      });
    }
  } catch (error) {
    console.error(
      "Error in verifyBank controller (Cashfree Payouts):",
      error.response ? error.response.data : error.message,
      error.stack
    );
    // Check for specific Cashfree error structure for bank validation (e.g., invalid IFSC)
    const errorData = error.response?.data;
    if (errorData && errorData.subCode && errorData.message) {
         return res.status(error.response.status || 400).json({
            success: false,
            message: errorData.message, // Cashfree's specific error message
            subCode: errorData.subCode,
            details: errorData
        });
    }
    return res.status(error.response?.status || 500).json({
      success: false,
      message: "Internal server error during bank verification.",
      error: errorData || error.message,
    });
  }
};

/**
 * @async
 * @function sendPayout
 * @description Initiates a payout (bank transfer) using Cashfree Payouts API.
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.body - The body of the request.
 * @param {number} req.body.amount - The amount to be transferred.
 * @param {string} req.body.bankAccount - The beneficiary's bank account number.
 * @param {string} req.body.ifsc - The beneficiary's bank IFSC code.
 * @param {string} req.body.name - The name of the beneficiary.
 * @param {string} req.body.transferId - A unique ID for this transfer from your system.
 * @param {Object} res - Express response object.
 *
 * @returns {Promise<Object>} Resolves with a JSON response containing success status,
 * transfer details, and status from Cashfree, or an error message.
 */
export const sendPayout = async (req, res) => {
  const { amount, bankAccount, ifsc, name, transferId } = req.body;

  // Validate required fields for the payout.
  if (!amount || !bankAccount || !ifsc || !name || !transferId) {
    console.error("Validation Error in sendPayout: Missing required fields.");
    return res.status(400).json({
      success: false,
      message:
        "Missing required payout fields: amount, bankAccount, ifsc, name, and transferId are required.",
    });
  }

  if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      console.error("Validation Error in sendPayout: Invalid amount.");
      return res.status(400).json({
          success: false,
          message: "Amount must be a positive number.",
      });
  }


  try {
    // Obtain the pre-configured Axios client for Cashfree Payouts API.
    const client = await cashfreePayoutClient();

    // Construct the payload for the requestTransfer API.
    const payoutPayload = {
      amount: parseFloat(amount), // Ensure amount is a number.
      transferId, // Your unique transfer ID for idempotency and tracking.
      transferMode: "banktransfer", // Common transfer mode. Others include "upi", "amazonpay", etc.
      beneDetails: { // Beneficiary details object
        bankAccount,
        ifsc,
        name,
        // email: beneficiaryEmail, // Optional: beneficiary email
        // phone: beneficiaryPhone, // Optional: beneficiary phone
      },
      // narration: "Payout via API", // Optional: description for the transfer (appears in bank statement)
      // remarks: "Monthly Payout", // Optional: internal remarks
    };

    console.log(
      `Attempting to send payout. Transfer ID: ${transferId}, Amount: ${amount} to Account: ${bankAccount}`
    );
    // Make a POST request to the requestTransfer endpoint.
    // Note: The endpoint and payload structure might differ slightly based on Cashfree API version.
    // This example uses a common structure for "/payout/v1.2/requestTransfer" or similar.
    // Adjust "/payout/v1/requestTransfer" if using a different Payouts API version.
    const response = await client.post(
      "/payout/v1.2/requestTransfer", // Using v1.2 as an example with beneDetails
      payoutPayload
    );

    // Check for successful payout initiation.
    if (response.data && response.data.status === "SUCCESS" && response.data.data) {
      console.log(
        `Payout initiated successfully. Transfer ID: ${transferId}, Cashfree Reference ID: ${response.data.data.referenceId}, Status: ${response.data.data.utr || 'PENDING'}`
      );
      return res.status(200).json({
        success: true,
        transfer: response.data.data, // Contains details like referenceId, utr (when available), etc.
        status: response.data.status, // Overall status from Cashfree, usually "SUCCESS" if accepted.
        message: response.data.message || "Payout request accepted by Cashfree.",
      });
    } else {
      console.error(
        "Payout initiation failed or received an unexpected response from Cashfree:",
        response.data
      );
      return res.status(response.status || 500).json({
        success: false,
        message: response.data?.message || "Payout initiation failed or unexpected response from Cashfree.",
        details: response.data,
      });
    }
  } catch (error) {
    console.error(
      "Error in sendPayout controller (Cashfree Payouts):",
      error.response ? error.response.data : error.message,
      error.stack
    );
     const errorData = error.response?.data;
    // Provide more specific error feedback if Cashfree returns structured error.
    if (errorData && errorData.subCode && errorData.message) {
         return res.status(error.response.status || 400).json({
            success: false,
            message: errorData.message,
            subCode: errorData.subCode,
            details: errorData
        });
    }
    return res.status(error.response?.status || 500).json({
      success: false,
      message: "Internal server error during payout initiation.",
      error: errorData || error.message,
    });
  }
};

