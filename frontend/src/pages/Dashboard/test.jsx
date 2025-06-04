// src/Test.jsx
import React, { useState, useEffect } from "react";
import { load } from "@cashfreepayments/cashfree-js";

// Console log to confirm file loading
console.log("Test.jsx component file loaded and executed.");

function Test() {
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  // useEffect to run once on initial mount for debugging
  useEffect(() => {
    console.log("Test component rendered/re-rendered.");
  }, []);

  // === Re-enabled useEffect for handling redirect from Cashfree ===
  useEffect(() => {
    console.log("[useEffect] Checking URL for payment status after redirect...");
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');
    const cashfreeOrderStatus = urlParams.get('order_status'); // This is the status from Cashfree's redirect

    if (orderId && cashfreeOrderStatus) {
      console.log(`[useEffect] Payment returned for Order ID: ${orderId}, Status from Cashfree: ${cashfreeOrderStatus}`);
      setPaymentStatus(`Payment for Order ID: ${orderId} is ${cashfreeOrderStatus}. Verifying on backend...`);
      setLoading(true); // Set loading while verifying on backend

      // It's crucial to verify the payment status on your backend
      // for security and reliability, as frontend data can be manipulated.
      console.log(`[useEffect] Initiating backend verification for Order ID: ${orderId}`);
      fetch(`http://localhost:5000/api/cashfree/verify-payment/${orderId}`)
        .then(res => {
          console.log(`[useEffect] Backend verification raw response status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          console.log('[useEffect] Backend verification response data:', data);
          const actualStatus = data.order_details[0].payment_status; // Get the actual status from your backend
          if (data.success && (actualStatus === 'PAID' || actualStatus === 'SUCCESS')) {
            setPaymentStatus(`Payment for Order ID: ${orderId} **SUCCESSFUL** (Verified by Backend)`);
            console.log(`[useEffect] Payment successfully verified by backend.`);
            // Handle successfpayment_statusul payment, e.g., update user's order history, send confirmation email.
          } else {
            setPaymentStatus(`Payment for Order ID: ${orderId} **${actualStatus || 'FAILED'}** (Verified by Backend). Details: ${data.details || data.message || 'N/A'}`);
            console.error(`[useEffect] Backend verification failed for Order ID: ${orderId}. Actual status: ${actualStatus}. Details:`, data.details || data.message);
          }
        })
        .catch(error => {
          console.error('[useEffect] Error verifying payment on backend:', error);
          setPaymentStatus(`Error verifying payment for Order ID: ${orderId}. Network/Backend error.`);
        })
        .finally(() => {
          console.log('[useEffect] Resetting loading state after backend verification.');
          setLoading(false); // ALWAYS reset loading here
          // Optional: Clear URL parameters to prevent re-triggering on refresh
          // window.history.replaceState({}, document.title, window.location.pathname);
        });
    } else {
        console.log("[useEffect] No Cashfree payment parameters found in URL.");
    }
  }, []); // Run only once on component mount for initial URL check


  const initiatePayment = async () => {
    console.log("[initiatePayment] Button clicked. Setting loading to true.");
    setLoading(true);
    setPaymentStatus(null); // Clear previous status

    try {
      console.log("[initiatePayment] Calling backend to create Cashfree order...");
      const requestBody = {
        order_amount: 10.0, // Example amount
        customer_details: {
          customer_id: "user_123",
          customer_name: "John Doe",
          customer_email: "john.doe@example.com",
          customer_phone: "9988776655",
        },
      };
      console.log("[initiatePayment] Request body for backend:", requestBody);

      const response = await fetch("http://localhost:5000/api/cashfree/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("[initiatePayment] Response from backend:", data);

      if (response.ok && data.payment_session_id) {
        const paymentSessionId = data.payment_session_id;
        console.log(`[initiatePayment] Received payment_session_id: ${paymentSessionId}. Loading Cashfree SDK...`);

        const cashfree = await load({
          mode: "sandbox", // "sandbox" for testing, "production" for live
        });

        console.log("[initiatePayment] Cashfree SDK loaded. Initiating checkout with redirect...");
        let checkoutOptions = {
          paymentSessionId: paymentSessionId,
          redirectTarget: "_self", // === KEY CHANGE: Redirect to same tab ===
          onScriptLoad: () => console.log('[Cashfree SDK] script loaded successfully for redirect.'),
          onScriptError: (error) => console.error('[Cashfree SDK] script load error:', error),
          // Removed onSuccess, onFailure, onCancel as they are for modal flow
        };

        cashfree.checkout(checkoutOptions);
        // After cashfree.checkout() with _self, the page will redirect.
        // The loading state will be handled by the useEffect after redirection.
        console.log("[initiatePayment] Redirecting to Cashfree. Frontend loading state will be managed by useEffect on return.");

      } else {
        console.error("[initiatePayment] Error creating order on backend. Details:", data.error || data.message);
        setPaymentStatus(`Error: ${data.error || data.message || "Failed to create order"}`);
        console.log("[initiatePayment] Resetting loading state due to backend order creation error.");
        setLoading(false); // Reset loading on backend error
      }
    } catch (error) {
      console.error("[initiatePayment] Network or unexpected error during order creation:", error);
      setPaymentStatus(`Network Error: ${error.message}. Please check console for details.`);
      console.log("[initiatePayment] Resetting loading state due to network/unexpected error.");
      setLoading(false); // Reset loading on network/unexpected error
    }
  };

  return (
    <div>
      <h1>Cashfree Payment Integration Test</h1>
      <button onClick={initiatePayment} disabled={loading}>
        {loading ? "Processing..." : "Pay with Cashfree"}
      </button>

      {paymentStatus && (
        <p
          style={{
            marginTop: "20px",
            color: paymentStatus.includes("SUCCESSFUL") ? "green" : (paymentStatus.includes("cancelled") || paymentStatus.includes("FAILED") ? "red" : "blue"), // Added blue for 'Verifying...'
          }}
        >
          {paymentStatus}
        </p>
      )}

      <p style={{ marginTop: "30px", fontSize: "0.8em", color: "#555" }}>
        **Note:** After clicking "Pay with Cashfree", you will be redirected to
        the Cashfree checkout page. After completing the payment, you will be
        redirected back to this page (or the specified return_url).
      </p>
    </div>
  );
}

export default Test;
