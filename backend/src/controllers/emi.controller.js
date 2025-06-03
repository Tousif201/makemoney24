// ============================
// File: controllers/admin.controller.js
// ============================

import { User } from "../models/User.model.js";
import {Emi} from "../models/emi.model.js";

export const getUserEmiHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find all EMI records for the user and populate the order details
    const emiHistory = await Emi.find({ userId: userId }).populate('orderId');

    res.status(200).json({ success: true, data: emiHistory });

  } catch (error) {
    console.error("Error fetching user EMI history:", error);
    res.status(500).json({ message: "Failed to fetch user EMI history", error: error.message });
  }
};
export const getUserEmiHistoryByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find all EMI records for the user and populate the order details
    const emiHistory = await Emi.find({ userId: userId }).populate('orderId');

    let totalRemainingAmount = 0;
    let overdueAmount = 0;
    const today = new Date();

    const emiDetails = emiHistory.map(emi => {
      const remainingAmount = emi.totalAmount - emi.installmentAmount * emi.paidInstallments;
      totalRemainingAmount += remainingAmount;
      let currentOverdueAmount = 0;

      if (
        emi.totalInstallments > emi.paidInstallments &&
        new Date(emi.nextDueDate) < today
      ) {
        const timeDifference = today.getTime() - new Date(emi.nextDueDate).getTime();
        const daysOverdue = Math.ceil(timeDifference / (1000 * 3600 * 24));
        currentOverdueAmount = emi.installmentAmount + (emi.penalty * daysOverdue);
        overdueAmount += currentOverdueAmount;
      }

      return {
        ...emi.toObject(),
        remainingAmount,
        overdueAmount: currentOverdueAmount
      };
    });


    res.status(200).json({ success: true, data: { emiDetails, totalRemainingAmount, overdueAmount } });

  } catch (error) {
    console.error("Error fetching user EMI history:", error);
    res.status(500).json({ message: "Failed to fetch user EMI history", error: error.message });
  }
};