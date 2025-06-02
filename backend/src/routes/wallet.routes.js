import express from "express";
import {
  getUserWalletHistory,
  getUserWalletTransactions,
} from "../controllers/wallet.controller.js";

const router = express.Router();

// GET /api/hello - Example route with middleware
router.get("/get-user-wallet-histtory", getUserWalletHistory);
router.get("/get-user-wallet-transactions", getUserWalletTransactions);

export default router;
