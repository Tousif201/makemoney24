import express from "express";
import {
  createTransaction,
  getAllTransactions,
} from "../controllers/transaction.controller.js";

const router = express.Router();

// GET /api/hello - Example route with middleware
router.get("/", getAllTransactions);
router.post("/", createTransaction);

export default router;
