import {
  createRazorpayOrder,
  verifyPaymentSignature,
  capturePayment,
} from "../utils/razorpay.js"; // Adjust path to your razorpay utils file

/**
 * @desc Create a new Razorpay order
 * @route POST /api/razorpay/create-order
 * @access Private (e.g., Authenticated User making a payment)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createOrderController = async (req, res) => {
  try {
    const { amount, currency, receipt, payment_capture } = req.body;

    // Basic validation
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Amount is required and must be a positive number.",
        });
    }
    if (!receipt) {
      return res
        .status(400)
        .json({ success: false, message: "Receipt ID is required." });
    }
    // currency and payment_capture have defaults in the util, so not strictly required here
    // but you might want to validate their types if provided.

    const order = await createRazorpayOrder({
      amount,
      currency,
      receipt,
      payment_capture,
    });

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Controller Error: Failed to create Razorpay order:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to create Razorpay order",
        error: error.message,
      });
  }
};

/**
 * @desc Verify Razorpay payment signature
 * @route POST /api/razorpay/verify-payment
 * @access Public (called by Razorpay webhook or client-side after payment)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const verifyPaymentController = async (req, res) => {
  try {
    // Razorpay typically sends these in req.body for webhooks,
    // or your client might send them after successful payment.
    const { order_id, payment_id, razorpay_signature } = req.body;

    // Basic validation
    if (!order_id || !payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Missing required payment verification parameters.",
        });
    }

    const isValid = verifyPaymentSignature({
      order_id,
      payment_id,
      razorpay_signature,
    });

    if (isValid) {
      res
        .status(200)
        .json({
          success: true,
          message: "Payment signature verified successfully.",
        });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Invalid payment signature." });
    }
  } catch (error) {
    console.error(
      "Controller Error: Failed to verify payment signature:",
      error
    );
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error during signature verification.",
        error: error.message,
      });
  }
};

/**
 * @desc Capture a Razorpay payment (if not auto-captured)
 * @route POST /api/razorpay/capture-payment
 * @access Private (e.g., Admin or internal system)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const capturePaymentController = async (req, res) => {
  try {
    const { payment_id, amount } = req.body;

    // Basic validation
    if (!payment_id || typeof amount !== "number" || amount <= 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Payment ID and a positive amount are required.",
        });
    }

    const capturedPayment = await capturePayment(payment_id, amount);

    res.status(200).json({ success: true, payment: capturedPayment });
  } catch (error) {
    console.error(
      "Controller Error: Failed to capture Razorpay payment:",
      error
    );
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to capture payment",
        error: error.message,
      });
  }
};
