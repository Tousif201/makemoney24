// ============================
// File: routes/order.routes.js
// ============================
import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../controllers/order.controller.js";

const router = express.Router();

// Order CRUD routes
router.post("/", createOrder); // Create a new order
router.get("/", getOrders); // Get all orders (with optional filters)
router.get("/:id", getOrderById); // Get a single order by ID
router.put("/:id", updateOrder); // Update an existing order
router.delete("/:id", deleteOrder); // Delete an order

export default router;
