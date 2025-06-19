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
  getAdminSalesReport,
  getTodaysOrders,
  rejectOrder
} from "../controllers/order.controller.js";

const router = express.Router();

// Order CRUD routes
router.post("/", createOrder); // Create a new order
router.get("/getAdminSalesReport", getAdminSalesReport);
router.get("/", getOrders); // Get all orders (with optional filters)
router.get("/todays-order", getTodaysOrders); // Get all todays orders 
router.get("/:id", getOrderById); // Get a single order by ID
router.put("/:id", updateOrder); // Update an existing order
router.delete("/:id", deleteOrder); // Delete an order
router.patch('/reject/:id', rejectOrder);

export default router;
