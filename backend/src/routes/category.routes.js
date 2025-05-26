// ============================
// File: routes/category.routes.js
// ============================
import express from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller.js';

const router = express.Router();

// Category CRUD routes
router.post('/', createCategory);       // Create a new category
router.get('/', getCategories);         // Get all categories (with optional filters)
router.get('/:id', getCategoryById);   // Get a single category by ID
router.put('/:id', updateCategory);     // Update an existing category
router.delete('/:id', deleteCategory); // Delete a category

export default router;
