// ============================
// File: routes/productService.routes.js
// ============================
import express from "express";
import {
  createProductService,
  getProductServices, // This controller will now handle vendorId query
  getProductServiceById,
  updateProductService,
  deleteProductService,
} from "../controllers/productService.controller.js";

const router = express.Router();

// Product/Service CRUD routes
router.post("/", createProductService); // Create a new product or service
router.get("/", getProductServices); // Get all products/services (now handles vendorId query)
router.get("/:id", getProductServiceById); // Get a single product/service by ID
router.put("/:id", updateProductService); // Update an existing product/service
router.delete("/:id", deleteProductService); // Delete a product or service

export default router;