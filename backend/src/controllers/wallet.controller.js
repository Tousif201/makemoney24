// controllers/userWalletHistory.controller.js

import { User } from "../models/User.model.js";
import { Transaction } from "../models/Transaction.model.js";
import { RewardLog } from "../models/RewardLog.model.js";
import mongoose from "mongoose";

export const getUserWalletHistory = async (req, res) => {
  const { userId } = req.query; // Assuming userId is passed as a query parameter

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required as a query parameter.",
    });
  }

  // Validate if userId is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid User ID format.",
    });
  }

  try {
    // 1. Fetch Current Balance from User Model
    const user = await User.findById(userId).select(
      "purchaseWallet withdrawableWallet"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const currentBalance = user.purchaseWallet + user.withdrawableWallet; // Sum of both wallets

    // 2. Calculate Total Credits from RewardLog Model
    const totalCreditsResult = await RewardLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null, // Group all matching documents
          totalCredits: { $sum: "$amount" },
        },
      },
    ]);

    const totalCredits =
      totalCreditsResult.length > 0 ? totalCreditsResult[0].totalCredits : 0;

    // 3. Calculate Total Debits from Transaction Model
    // Debits can be considered as 'withdrawal', 'payout', 'purchase'
    const totalDebitsResult = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          transactionType: { $in: ["withdrawal", "payout", "purchase"] },
          status: "success", // Only consider successful debits
        },
      },
      {
        $group: {
          _id: null,
          totalDebits: { $sum: "$amount" },
        },
      },
    ]);

    const totalDebits =
      totalDebitsResult.length > 0 ? totalDebitsResult[0].totalDebits : 0;

    // 4. Get all transactions with their details from Transaction Model
    const allTransactions = await Transaction.find({ userId: userId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean(); // Return plain JavaScript objects

    return res.status(200).json({
      success: true,
      data: {
        userId: userId,
        currentBalance: currentBalance,
        totalCredits: totalCredits,
        totalDebits: totalDebits,
        transactions: allTransactions,
      },
    });
  } catch (error) {
    console.error("Error fetching user wallet history:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
export const getUserWalletTransactions = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required as a query parameter.",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid User ID format.",
    });
  }

  try {
    const objectUserId = new mongoose.Types.ObjectId(userId);

    // Fetch all relevant transactions from the Transaction model
    const transactionEntries = await Transaction.find({
      userId: objectUserId,
      transactionType: { $in: ["withdrawal", "deposit", "payout", "cashback", "purchase", "return"] },
      status: "success", // Only successful transactions
    })
      .lean();

    // Fetch all reward log entries for the user
    const rewardLogEntries = await RewardLog.find({
      userId: objectUserId,
    })
      .lean();

    let allUnifiedTransactions = [];

    // Standardize and add Transaction entries
    transactionEntries.forEach(t => {
      let type;
      let description = t.description;

      if (["withdrawal", "payout", "purchase"].includes(t.transactionType)) {
        type = "debit";
        if (!description) description = `Spent on ${t.transactionType}`; // Default description for debits
      } else if (["deposit", "cashback", "return"].includes(t.transactionType)) {
        type = "credit";
        if (!description) description = `Received via ${t.transactionType}`; // Default description for credits
      } else {
        // Handle any other unexpected transaction types if necessary
        type = "unknown";
        if (!description) description = `Transaction type: ${t.transactionType}`;
      }

      allUnifiedTransactions.push({
        _id: t._id,
        userId: t.userId,
        amount: t.amount,
        description: description,
        type: type, // 'credit' or 'debit'
        status: t.status,
        createdAt: t.createdAt,
        txnId: t.txnId,
        sourceModel: 'Transaction'
      });
    });

    // Standardize and add RewardLog entries (these are always credits)
    rewardLogEntries.forEach(r => {
      allUnifiedTransactions.push({
        _id: r._id,
        userId: r.userId,
        amount: r.amount,
        description: `Reward: ${r.type}`, // e.g., "Reward: ReferralRewardMilestone"
        type: "credit", // Rewards are always credits
        status: "success", // Reward logs are inherently successful awards
        createdAt: r.createdAt,
        txnId: `REWARD-${r._id.toString().slice(-8)}`, // Generate a simple ID for display consistency
        sourceModel: 'RewardLog'
      });
    });

    // Sort the combined array by createdAt in descending order (latest first)
    allUnifiedTransactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return res.status(200).json({
      success: true,
      data: {
        userId: userId,
        transactions: allUnifiedTransactions, // Now contains all unified transactions
      },
    });
  } catch (error) {
    console.error("Error fetching user wallet transactions:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};