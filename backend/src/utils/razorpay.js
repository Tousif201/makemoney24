import Razorpay from "razorpay";
import crypto from "crypto";

/**
 * Create a new Razorpay order
 * @param {Object} params
 * @param {number} params.amount - Amount in paise (e.g., 50000 = ₹500)
 * @param {string} params.currency - Currency code, default is INR
 * @param {string} params.receipt - Unique receipt ID
 * @param {boolean|number} params.payment_capture - 1 for auto capture
 */
export const createRazorpayOrder = async ({
  amount,
  currency = "INR",
  receipt,
  payment_capture = 1,
}) => {
  const options = {
    amount,
    currency,
    receipt,
    payment_capture,
  };
  // In server.js, right after dotenv.config();
  const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  try {
    const order = await razorpayInstance.orders.create(options);
    return order;
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw error;
  }
};

/**
 * Verify Razorpay payment signature
 * @param {Object} params
 * @param {string} params.order_id - Razorpay order ID
 * @param {string} params.payment_id - Razorpay payment ID
 * @param {string} params.razorpay_signature - Signature from Razorpay
 * @returns {boolean}
 */
export const verifyPaymentSignature = ({
  order_id,
  payment_id,
  razorpay_signature,
}) => {
  const body = `${order_id}|${payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  return expectedSignature === razorpay_signature;
};

/**
 * Capture a payment (if not auto-captured)
 * @param {string} payment_id - Razorpay payment ID
 * @param {number} amount - Amount in paise
 */
export const capturePayment = async (payment_id, amount) => {
  console.log(process.env.RAZORPAY_KEY_ID);
  const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  try {
    const response = await razorpayInstance.payments.capture(
      payment_id,
      amount
    );
    return response;
  } catch (error) {
    console.error("Error capturing Razorpay payment:", error);
    throw error;
  }
};
