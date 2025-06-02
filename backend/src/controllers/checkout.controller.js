// ============================
// File: controllers/checkout.controller.js
// ============================

import mongoose from "mongoose";
import { Order } from "../models/Order.model.js";
import { Transaction } from "../models/Transaction.model.js";

/**
 * handleCheckout - Controller to handle the checkout process.
 * Creates an order and a corresponding pending transaction.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const handleCheckout = async (req, res) => {
  // 1. Validate Request Body
  const { userId, vendorId, items, totalAmount, address } = req.body;

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

  // Ensure totalAmount is a valid number
  if (typeof totalAmount !== "number" || totalAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: "totalAmount must be a positive number.",
    });
  }

  // Start a Mongoose session for atomicity
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 2. Create the Order
    const newOrder = new Order({
      userId,
      vendorId,
      items,
      totalAmount,
      address,
      paymentStatus: "pending", // Initial status
      orderStatus: "placed", // Initial status
    });

    const savedOrder = await newOrder.save({ session });

    // 3. Create a corresponding Transaction (pending)
    const newTransaction = new Transaction({
      userId,
      orderId: savedOrder._id,
      transactionType: "purchase",
      amount: totalAmount,
      description: `Payment for Order ID: ${savedOrder._id}`,
      status: "pending", // Initial status, will be updated by payment gateway callback
    });

    const savedTransaction = await newTransaction.save({ session });

    // 4. Update the Order with the transactionId
    savedOrder.transactionId = savedTransaction._id;
    await savedOrder.save({ session });

    // 5. Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // 6. Respond with success
    res.status(201).json({
      success: true,
      message: "Checkout successful. Order and pending transaction created.",
      order: savedOrder,
      transaction: savedTransaction,
      redirectUrl: `/payment/${savedTransaction._id}`, // Example: Redirect to a payment page
    });
  } catch (error) {
    // Abort transaction on error
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
