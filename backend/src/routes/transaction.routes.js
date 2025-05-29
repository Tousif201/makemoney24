import express from "express";
import { getAllTransactions } from "../controllers/transaction.controller.js";

const router = express.Router();

// GET /api/hello - Example route with middleware
router.get("/", getAllTransactions);

export default router;
