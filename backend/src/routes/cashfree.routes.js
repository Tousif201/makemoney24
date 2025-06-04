// src/routes/cashfree.routes.js
import express from "express";
import {
  createOrderCF,
  verifyPayment,
  handleWebhook,
  getBalance,     // <-- Import new payout controller
  verifyBank,     // <-- Import new payout controller
  sendPayout      // <-- Import new payout controller
} from "../controllers/cashfree.controller.js"; // Assuming controller file is named cashfreeController.js

const router = express.Router();

// -----------------------------------------------------------------------------
// PAYMENT GATEWAY (PG) ROUTES
// -----------------------------------------------------------------------------

// Route to create a Cashfree order
router.post("/create-order", createOrderCF);

// Route to verify payment status
router.get("/verify-payment/:order_id", verifyPayment);

// Route for Cashfree Webhook notifications for Payment Gateway
// This is the URL you will configure in your Cashfree Dashboard for PG webhooks.
router.post("/webhook", handleWebhook);

// -----------------------------------------------------------------------------
// PAYOUTS ROUTES
// -----------------------------------------------------------------------------

// Route to get Cashfree Payout account balance
router.get("/payouts/balance", getBalance);

// Route to verify bank account details for Payouts
// Expects bankAccount and ifsc in the request body
router.post("/payouts/verify-bank-account", verifyBank);

// Route to initiate a payout (bank transfer)
// Expects amount, bankAccount, ifsc, name, transferId in the request body
router.post("/payouts/transfer", sendPayout);

export default router;
