// Import necessary models and the internal verification function
import mongoose from "mongoose";
import { Order } from "../models/Order.model.js"; // Adjust path
import { Transaction } from "../models/Transaction.model.js"; // Adjust path
import { Emi } from "../models/emi.model.js"; // Adjust path
import { User } from "../models/User.model.js"; // Adjust path
import { verifyCashfreePayment } from "../utils/cashfreePaymentUtils.js";
// internalCashfreePaymentVerification (defined above or imported)

// --- Standard Online Payment Checkout ---
export const handleOnlinePaymentCheckout = async (req, res) => {
  const {
    userId,
    vendorId,
    items,
    totalAmount,
    address,
    cashfreeOrderId, // This is the order_id from Cashfree, passed back by your frontend
  } = req.body;

  // 1. Basic mandatory fields validation
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
  if (!cashfreeOrderId) {
    return res
      .status(400)
      .json({ success: false, message: "Missing Cashfree Order ID." });
  }

  // 2. Basic validation for items array and totalAmount (similar to original)
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
  if (typeof totalAmount !== "number" || totalAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: "totalAmount must be a positive number.",
    });
  }

  // 3. Verify Cashfree Payment INTERNALLY
  const paymentVerification = await verifyCashfreePayment(cashfreeOrderId);
  if (!paymentVerification.success) {
    return res.status(400).json({
      success: false,
      message:
        paymentVerification.message || "Cashfree payment verification failed.",
      details:
        paymentVerification.orderDetails || paymentVerification.errorDetails,
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // 4. Create the Order
    // The pre-save hook on Transaction will update Order's paymentStatus if transaction is successful
    const newOrder = new Order({
      userId,
      vendorId,
      items,
      totalAmount,
      address,
      paymentStatus: "pending", // Will be updated by Transaction pre-save hook if payment is successful
      orderStatus: "placed",
    });
    const savedOrder = await newOrder.save({ session });

    // 5. Create the Transaction
    const newTransaction = new Transaction({
      userId,
      orderId: savedOrder._id,
      transactionType: "purchase",
      amount: totalAmount, // Amount verified from Cashfree
      description: `Payment for Order ID: ${savedOrder._id}`,
      status: "success", // Since paymentVerification.success is true
      cashfreeOrderId: paymentVerification.orderDetails.orderId, // Store Cashfree's order_id
      cashfreePaymentId: paymentVerification.orderDetails.cfPaymentId, // Store Cashfree's payment_id
      paymentGatewayResponse:
        paymentVerification.orderDetails.paymentGatewayResponse,
    });
    const savedTransaction = await newTransaction.save({ session });

    // 6. Update Order with transactionId (already done by pre-save hook if successful)
    // If not using the hook, or for explicitness:
    savedOrder.transactionId = savedTransaction._id;
    if (savedTransaction.status === "success") {
      savedOrder.paymentStatus = "completed";
    }
    await savedOrder.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message:
        "Online payment checkout successful. Order and transaction created.",
      order: savedOrder,
      transaction: savedTransaction,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error during online payment checkout:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during the online payment checkout process.",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// --- EMI Checkout ---
export const handleEmiCheckout = async (req, res) => {
  const {
    userId,
    vendorId,
    items,
    totalAmount, // Full order amount for the goods
    address,
    // EMI specific fields
    downPayment,
    processingFee,
    billingCycleInDays,
    totalInstallments,
    installmentAmount,
    // Cashfree payment confirmation details
    cashfreeOrderId, // This is the order_id from Cashfree for the (downpayment + processing fee) transaction
  } = req.body;

  const initialPaymentAmount = downPayment + processingFee; // This is what should have been paid via Cashfree

  // 1. Basic mandatory fields validation
  if (
    !userId ||
    !vendorId ||
    !Array.isArray(items) ||
    items.length === 0 ||
    !totalAmount ||
    !address
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Missing common required fields." });
  }
  if (!cashfreeOrderId) {
    return res.status(400).json({
      success: false,
      message: "Missing Cashfree Order ID for EMI initial payment.",
    });
  }

  // 2. Basic validation for items array and totalAmount
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
  if (typeof totalAmount !== "number" || totalAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Order totalAmount must be a positive number.",
    });
  }

  // 3. Validate EMI specific fields
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
        "For EMI: downPayment, processingFee, billingCycleInDays, totalInstallments, and installmentAmount are mandatory and must be valid.",
    });
  }

  // 4. EMI consistency check (totalAmount of goods vs EMI plan)
  //   const calculatedEmiTotalValue =
  //     downPayment + totalInstallments * installmentAmount + processingFee;
  //   const expectedTotalValueIncludingProcessing = totalAmount + processingFee;
  //   const epsilon = 0.01;
  // console.log(calculatedEmiTotalValue,expectedTotalValueIncludingProcessing ,processingFee, Math.abs(calculatedEmiTotalValue - expectedTotalValueIncludingProcessing),calculatedEmiTotalValue - expectedTotalValueIncludingProcessing)
  //   if (
  //     Math.abs(calculatedEmiTotalValue - expectedTotalValueIncludingProcessing) >
  //     epsilon
  //   ) {
  //     return res.status(400).json({
  //       success: false,
  //       message: `EMI payment breakdown (Downpayment: ${downPayment} + Installments: ${totalInstallments}*${installmentAmount}=${totalInstallments * installmentAmount}) sums to ${calculatedEmiTotalValue}. This should cover Total Order Amount (${totalAmount}) + Processing Fee (${processingFee}) = ${expectedTotalValueIncludingProcessing}. Difference is ${Math.abs(calculatedEmiTotalValue - expectedTotalValueIncludingProcessing)}. Please check terms.`,
  //     });
  //   }

  // 5. User EMI Eligibility Check (same as before)
  try {
    const user = await User.findById(userId).populate({
      path: "emiHistory",
      model: "Emi",
    }); // Ensure Emi model is registered for populate
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    if (!user.isMember) {
      return res.status(403).json({
        success: false,
        message: "User is not a member. EMI facility not available.",
      });
    }

    const nonDefaultedEmis = user.emiHistory.filter(
      (emi) => emi.status !== "defaulted"
    );
    const existingActiveOrDefaultedEmis = user.emiHistory.filter(
      (emi) => emi.status === "ongoing" || emi.status === "defaulted"
    );

    if (
      existingActiveOrDefaultedEmis.some((emi) => emi.status === "defaulted")
    ) {
      return res.status(403).json({
        success: false,
        message: "User has a defaulted EMI. New EMI facility is blocked.",
      });
    }

    const currentEmiAttemptNumber = nonDefaultedEmis.length + 1;
    const allowedTotalOrderAmount = currentEmiAttemptNumber * 1000;

    if (totalAmount > allowedTotalOrderAmount) {
      return res.status(403).json({
        success: false,
        message: `Order total ${totalAmount} exceeds the allowed limit of ${allowedTotalOrderAmount} for your ${currentEmiAttemptNumber}(st/nd/rd/th) EMI.`,
      });
    }
  } catch (error) {
    console.error("Error during EMI eligibility check:", error);
    return res.status(500).json({
      success: false,
      message: "Error checking EMI eligibility.",
      error: error.message,
    });
  }

  // 6. Verify Cashfree Payment for the initial EMI amount (downpayment + processingFee)
  const paymentVerification = await verifyCashfreePayment(cashfreeOrderId);
  if (!paymentVerification.success) {
    return res.status(400).json({
      success: false,
      message:
        paymentVerification.message ||
        "Cashfree payment verification for EMI initial amount failed.",
      details:
        paymentVerification.orderDetails || paymentVerification.errorDetails,
    });
  }

  // Ensure the amount paid matches initialPaymentAmount
  if (
    parseFloat(paymentVerification.orderDetails.amount) !==
    parseFloat(initialPaymentAmount)
  ) {
    console.warn(
      `EMI Initial Amount mismatch for Cashfree Order ID ${cashfreeOrderId}. Expected: ${initialPaymentAmount}, Got: ${paymentVerification.orderDetails.amount}`
    );
    return res.status(400).json({
      success: false,
      message: `EMI initial payment amount mismatch. Expected ${initialPaymentAmount} but paid ${paymentVerification.orderDetails.amount}.`,
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // 7. Create the Order
    const newOrder = new Order({
      userId,
      vendorId,
      items,
      totalAmount, // Full order amount for goods
      address,
      paymentStatus: "pending", // Will be 'completed' after successful initial transaction
      orderStatus: "placed",
    });
    const savedOrder = await newOrder.save({ session });

    // 8. Create the EMI document
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + billingCycleInDays);

    const newEmi = new Emi({
      userId,
      orderId: savedOrder._id,
      totalAmount: totalAmount, // Total value of goods being financed via EMI (excluding downpayment for loan part)
      downPayment,
      processingFee,
      billingCycleInDays,
      totalInstallments,
      installmentAmount,
      paidInstallments: 0, // Downpayment is not an "installment"
      nextDueDate,
      status: "ongoing",
    });
    const savedEmi = await newEmi.save({ session });

    // 9. Create the initial Transaction (for downpayment + processing fee)
    const newTransaction = new Transaction({
      userId,
      orderId: savedOrder._id,
      emiId: savedEmi._id,
      transactionType: "emi_initial_payment",
      amount: initialPaymentAmount, // Verified amount from Cashfree
      description: `EMI Initial Payment (Down Payment + Processing Fee) for Order ID: ${savedOrder._id}`,
      status: "success",
      cashfreeOrderId: paymentVerification.orderDetails.orderId,
      cashfreePaymentId: paymentVerification.orderDetails.cfPaymentId,
      paymentGatewayResponse:
        paymentVerification.orderDetails.paymentGatewayResponse,
    });
    const savedTransaction = await newTransaction.save({ session });

    // 10. Update Order with transactionId and paymentStatus
    savedOrder.transactionId = savedTransaction._id;
    if (savedTransaction.status === "success") {
      savedOrder.paymentStatus = "completed"; // Mark order as paid (initial part)
    }
    await savedOrder.save({ session });

    // 11. Update User's EMI History
    await User.findByIdAndUpdate(
      userId,
      { $push: { emiHistory: savedEmi._id } },
      { session, new: true }
    );

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message:
        "EMI checkout successful. Order, initial transaction, and EMI plan created.",
      order: savedOrder,
      transaction: savedTransaction,
      emi: savedEmi,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error during EMI checkout:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during the EMI checkout process.",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};
