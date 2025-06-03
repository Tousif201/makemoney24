// src/routes/cashfree.routes.js (assuming this is your router file)
import express from "express";
// Import handleWebhook along with your existing controller functions
import { createOrderCF, verifyPayment, handleWebhook } from "../controllers/cashfree.controller.js";

const router = express.Router();

// Route to create a Cashfree order
router.post("/create-order", createOrderCF); // Changed from "/" to "/create-order" for clarity and consistency

// Route to verify payment status
router.get("/verify-payment/:order_id", verifyPayment);

// Route for Cashfree Webhook notifications
// This is the URL you will configure in your Cashfree Dashboard for webhooks.
// Make sure your backend server allows raw body parsing for this endpoint if you implement signature verification.
router.post("/webhook", handleWebhook);

export default router;
