"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component
import { createRazorpayOrderApi, verifyPaymentApi } from "../../api/razorpay"; // Adjust path as needed
import { useSession } from "../context/SessionContext";

/**
 * @typedef {Object} RazorpayPaymentButtonProps
 * @property {number} amount - The amount to be paid in paise (e.g., 50000 for ₹500).
 * @property {string} [currency='INR'] - The currency code (e.g., 'INR').
 * @property {string} receiptId - A unique receipt ID for the order.
 * @property {string} companyName - The name of your company to display in the checkout.
 * @property {string} description - A short description for the payment (e.g., "Membership Fee").
 * @property {string} [logoUrl] - URL to your company logo (optional).
 * @property {Function} onPaymentSuccess - Callback function on successful and verified payment.
 * Receives the Razorpay response object and backend verification response.
 * @property {Function} onPaymentError - Callback function on payment failure or verification error.
 * Receives the error object.
 * @property {React.ReactNode} children - The content to render inside the button.
 * @property {string} [razorpayKeyId] - Your Razorpay Key ID (public key). If not provided, it will try to use process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID (for Next.js) or assume it's globally available.
 * @property {string} [className] - Optional Tailwind CSS classes for the button.
 */

/**
 * A reusable React component to trigger Razorpay payment.
 * It handles loading the Razorpay SDK, creating an order on the backend,
 * opening the payment modal, and verifying the payment signature.
 *
 * @param {RazorpayPaymentButtonProps} props
 */
export default function RazorpayPaymentButton({
  amount,
  currency = "INR",
  receiptId,
  companyName,
  description,
  logoUrl,
  onPaymentSuccess,
  onPaymentError,
  children,
  razorpayKeyId, // Optional: if you prefer to pass it directly rather than rely on env
  className,
}) {
  const { user, loading: sessionLoading } = useSession(); // Get user for prefill
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Dynamically load the Razorpay SDK script
  useEffect(() => {
    const loadScript = () => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        setScriptLoaded(true);
      };
      script.onerror = () => {
        console.error("Razorpay SDK failed to load.");
        setPaymentError("Payment gateway failed to load. Please try again.");
        onPaymentError &&
          onPaymentError(new Error("Razorpay SDK failed to load."));
      };
      document.head.appendChild(script);
    };

    if (!window.Razorpay) {
      loadScript();
    } else {
      setScriptLoaded(true);
    }

    return () => {
      // Clean up script if component unmounts (optional, but good practice)
      const scriptElement = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );
      if (scriptElement) {
        // document.head.removeChild(scriptElement); // Be careful with this in SPAs if other components use it
      }
    };
  }, [onPaymentError]);

  const handlePayment = async () => {
    if (!scriptLoaded || isProcessing || sessionLoading || !user?._id) {
      // Prevent multiple clicks or if SDK/session not ready
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // 1. Create order on your backend
      const orderResponse = await createRazorpayOrderApi({
        amount,
        currency,
        receipt: receiptId,
        payment_capture: 1, // Auto-capture
      });

      if (!orderResponse.success || !orderResponse.order) {
        throw new Error(
          orderResponse.message || "Failed to create order on backend."
        );
      }

      const order = orderResponse.order;

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID, // Use prop or env var
        amount: order.amount,
        currency: order.currency,
        name: companyName,
        description: description,
        image: logoUrl, // Optional company logo
        order_id: order.id, // Order ID from your backend
        handler: async function (response) {
          // This function is called on successful payment by Razorpay
          setIsProcessing(true); // Re-set processing during verification
          try {
            // 3. Verify payment signature on your backend
            const verificationResponse = await verifyPaymentApi({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verificationResponse.success) {
              onPaymentSuccess &&
                onPaymentSuccess(response, verificationResponse);
            } else {
              setPaymentError(
                verificationResponse.message || "Payment verification failed."
              );
              onPaymentError &&
                onPaymentError(
                  new Error(
                    verificationResponse.message ||
                      "Payment verification failed."
                  )
                );
            }
          } catch (verifyError) {
            console.error("Payment verification error:", verifyError);
            setPaymentError(
              "Payment verification failed due to an internal error."
            );
            onPaymentError && onPaymentError(verifyError);
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        notes: {
          userId: user?._id,
          receiptId: receiptId,
          // Add any other relevant notes
        },
        theme: {
          color: "#8B5CF6", // A nice purple color
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        console.error("Razorpay Payment Failed:", response.error);
        setPaymentError(
          response.error.description || "Payment failed. Please try again."
        );
        onPaymentError && onPaymentError(response.error);
        setIsProcessing(false); // Stop processing on failure
      });
      rzp.open();
    } catch (err) {
      console.error("Payment initiation error:", err);
      setPaymentError(err.message || "Failed to initiate payment.");
      onPaymentError && onPaymentError(err);
      setIsProcessing(false); // Stop processing on error
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={!scriptLoaded || isProcessing || sessionLoading || !user?._id}
      className={className}
    >
      {isProcessing ? "Processing..." : children}
    </Button>
  );
}
