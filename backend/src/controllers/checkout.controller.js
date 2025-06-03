// ============================
// File: controllers/checkout.controller.js
// ============================

import mongoose from "mongoose";
import { Order } from "../models/Order.model.js";
import { Transaction } from "../models/Transaction.model.js";
import { Emi } from "../models/emi.model.js";
/**
 * handleCheckout - Controller to handle the checkout process.
 * This version assumes the user has already completed payment via Razorpay
 * and receives the payment confirmation details in the request body.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const handleCheckout = async (req, res) => {
  // 1. Validate Request Body
  const {
    userId,
    vendorId,
    items,
    totalAmount, // This is the full order amount, regardless of EMI
    address,
    isEmi, // Boolean flag to indicate EMI payment
    downPayment,
    processingFee,
    billingCycleInDays,
    totalInstallments,
    installmentAmount,
    // Razorpay payment confirmation details
    razorpayPaymentId,
    razorpayOrderId,
    razorpaySignature,
  } = req.body;

  // Basic mandatory fields validation
  if (
    !userId ||
    !vendorId ||
    !Array.isArray(items) ||
    items.length === 0 ||
    !totalAmount ||
    !address
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Missing required fields: userId, vendorId, items, totalAmount, and address are mandatory.",
    });
  }

  // Validate Razorpay payment details as payment is assumed to be complete
  if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
    return res.status(400).json({
      success: false,
      message:
        "Missing Razorpay payment details: razorpayPaymentId, razorpayOrderId, and razorpaySignature are mandatory after successful payment.",
    });
  }

  // Basic validation for items array
  for (const item of items) {
    if (
      !item.productServiceId ||
      typeof item.quantity !== "number" ||
      item.quantity < 1 ||
      typeof item.price !== "number" ||
      item.price < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Each item must have a valid productServiceId, quantity (min 1), and price (min 0).",
      });
    }
  }

  // Ensure totalAmount is a valid positive number
  if (typeof totalAmount !== "number" || totalAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: "totalAmount must be a positive number.",
    });
  }

  // Validate EMI specific fields if isEmi is true
  if (isEmi) {
    if (
      typeof downPayment !== "number" ||
      downPayment < 0 ||
      typeof processingFee !== "number" ||
      processingFee < 0 ||
      typeof billingCycleInDays !== "number" ||
      billingCycleInDays < 1 ||
      typeof totalInstallments !== "number" ||
      totalInstallments < 1 ||
      typeof installmentAmount !== "number" ||
      installmentAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "For EMI: downPayment, processingFee, billingCycleInDays, totalInstallments, and installmentAmount are mandatory and must be valid numbers.",
      });
    }

    // Basic consistency check for EMI total
    const calculatedEmiTotal = downPayment + totalInstallments * installmentAmount;
    const expectedEmiTotal = totalAmount + processingFee;

    const epsilon = 0.01; // For floating point comparison
    if (Math.abs(calculatedEmiTotal - expectedEmiTotal) > epsilon) {
      return res.status(400).json({
        success: false,
        message: `EMI payment breakdown (downPayment: ${downPayment}, totalInstallments: ${totalInstallments}, installmentAmount: ${installmentAmount}) does not sum up to total order amount (${totalAmount}) plus processing fee (${processingFee}). Calculated: ${calculatedEmiTotal}, Expected: ${expectedEmiTotal}`,
      });
    }
  }

  // Start a Mongoose session for atomicity
  const session = await mongoose.startSession();
  session.startTransaction();

  let savedTransaction;
  let savedEmi; // To store the EMI document if created

  try {
    // 2. Create the Order
    const newOrder = new Order({
      userId,
      vendorId,
      items,
      totalAmount, // This is the full price of the order
      address,
      paymentStatus: "paid", // Set to 'paid' as payment is confirmed
      orderStatus: "placed", // Initial status
    });

    const savedOrder = await newOrder.save({ session });

    // 3. Prepare and create the initial Transaction
    let transactionAmount;
    let transactionDescription;
    let transactionType;

    if (isEmi) {
      // For EMI, the initial transaction covers the down payment and processing fee
      transactionAmount = downPayment + processingFee;
      transactionDescription = `EMI Initial Payment (Down Payment + Processing Fee) for Order ID: ${savedOrder._id}`;
      transactionType = "emi_initial_payment";

      // Calculate nextDueDate for the first installment
      const nextDueDate = new Date();
      // Add billingCycleInDays to the current date to get the first due date
      nextDueDate.setDate(nextDueDate.getDate() + billingCycleInDays);

      // Create the EMI document
      const newEmi = new Emi({
        userId,
        orderId: savedOrder._id,
        totalAmount: totalAmount, // This is the full order amount for EMI tracking
        downPayment,
        processingFee,
        billingCycleInDays,
        totalInstallments,
        installmentAmount,
        paidInstallments: 0, // Starts with 0 paid installments
        nextDueDate,
        status: "ongoing", // Initial EMI status
      });
      savedEmi = await newEmi.save({ session });

    } else {
      // For standard payment, the transaction covers the full order amount
      transactionAmount = totalAmount;
      transactionDescription = `Payment for Order ID: ${savedOrder._id}`;
      transactionType = "purchase";
    }

    const newTransaction = new Transaction({
      userId,
      orderId: savedOrder._id,
      transactionType,
      amount: transactionAmount,
      description: transactionDescription,
      status: "completed", // Set to 'completed' as payment is confirmed
      ...(isEmi && { emiId: savedEmi._id }), // Link transaction to EMI if an EMI plan was created
      // Store Razorpay payment details
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    });

    savedTransaction = await newTransaction.save({ session });

    // 4. Update the Order with the initial transactionId
    savedOrder.transactionId = savedTransaction._id;
    await savedOrder.save({ session });

    // 5. Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // IMPORTANT SECURITY NOTE:
    // In a production environment, you MUST verify the razorpaySignature
    // using your Razorpay secret key before saving the transaction as 'completed'.
    // This step ensures the callback is legitimate and not tampered with.
    // Example (requires Razorpay SDK and secret key):
    // const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');
    // const generatedSignature = validateWebhookSignature(
    //   JSON.stringify({ order_id: razorpayOrderId, payment_id: razorpayPaymentId }),
    //   razorpaySignature,
    //   RAZORPAY_WEBHOOK_SECRET
    // );
    // if (!generatedSignature) {
    //   // Handle invalid signature - potentially fraudulent attempt
    //   return res.status(400).json({ success: false, message: "Invalid Razorpay signature." });
    // }


    // 6. Respond with success
    const responsePayload = {
      success: true,
      message: isEmi ? "Checkout successful. Order, initial EMI transaction, and EMI plan created." : "Checkout successful. Order and pending transaction created.",
      order: savedOrder,
      transaction: savedTransaction,
      // No redirectUrl needed as payment is already complete
    };

    if (isEmi) {
      responsePayload.emi = savedEmi; // Include the EMI document in the response
    }

    res.status(201).json(responsePayload);
  } catch (error) {
    // Abort transaction on any error
    await session.abortTransaction();
    session.endSession();

    console.error("Error during checkout:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during the checkout process.",
      error: error.message,
    });
  }
};
