// routes/razorpay.routes.js
import express from "express";
import {
  createOrderController,
  verifyPaymentController,
  capturePaymentController,
} from "../controllers/razorpay.controller.js"; // Adjust path

const router = express.Router();

// Route to create a new Razorpay order
router.post("/create-order", createOrderController);

// Route to verify a Razorpay payment signature
router.post("/verify-payment", verifyPaymentController);

// Route to manually capture a Razorpay payment
router.post("/capture-payment", capturePaymentController);

export default router;
