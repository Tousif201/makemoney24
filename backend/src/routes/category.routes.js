// ============================
// File: routes/category.routes.js
// ============================
import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getAllCategoriesWithImages,
  getCategoriesWithSubcategories,
  getCategoriesByParentId,
  getAllCategoriesFlat,
} from "../controllers/category.controller.js";

const router = express.Router();

// Category CRUD routes
// Note: Order matters. More specific routes should come before less specific ones.

router.get("/all-flat", getAllCategoriesFlat)
router.get("/categories-with-images", getAllCategoriesWithImages);

// New route for fetching all categories with nested subcategories
router.get("/nested", getCategoriesWithSubcategories);

// --- FIX START ---
// Define two separate routes for optional parentId
// 1. Route for when parentId is provided
router.get("/children/:parentId", getCategoriesByParentId);
// 2. Route for when no parentId is provided (fetch top-level)
router.get("/children/", getCategoriesByParentId);
// --- FIX END ---

router.post("/", createCategory); // Create a new category (now supports parentId)
router.get("/", getCategories); // Get all TOP-LEVEL categories (with optional type filter)
router.get("/:id", getCategoryById); // Get a single category by ID (now populates parentId)
router.put("/:id", updateCategory); // Update an existing category (now supports parentId)
router.delete("/:id", deleteCategory); // Delete a category (with new integrity checks)
export default router;
