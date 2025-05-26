// ===================================
// File: controllers/category.controller.js
// ===================================
import { Category } from '../models/Category.model.js';
import mongoose from 'mongoose';

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * @desc Create a new category
 * @route POST /api/categories
 * @access Public (or Private, depending on auth middleware)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createCategory = async (req, res) => {
  try {
    const { name, description, type } = req.body;

    // Basic validation
    if (!name || !type) {
      return res.status(400).json({ message: 'Name and type are required for a category.' });
    }
    if (!['product', 'service'].includes(type)) {
      return res.status(400).json({ message: 'Category type must be "product" or "service".' });
    }

    // Check if a category with the same name and type already exists
    const existingCategory = await Category.findOne({ name: name, type: type });
    if (existingCategory) {
      return res.status(409).json({ message: 'Category with this name and type already exists.' });
    }

    const newCategory = new Category({
      name,
      description,
      type,
    });

    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Get all categories or filter by type
 * @route GET /api/categories
 * @access Public
 * @param {Object} req - Express request object (query parameters: type)
 * @param {Object} res - Express response object
 */
export const getCategories = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = {};

    if (type) {
      if (!['product', 'service'].includes(type)) {
        return res.status(400).json({ message: 'Category type must be "product" or "service".' });
      }
      filter.type = type;
    }

    const categories = await Category.find(filter).sort({ name: 1 }); // Sort by name alphabetically
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Get a single category by ID
 * @route GET /api/categories/:id
 * @access Public
 * @param {Object} req - Express request object (params: id)
 * @param {Object} res - Express response object
 */
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid Category ID format.' });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Update an existing category
 * @route PUT /api/categories/:id
 * @access Public (or Private, depending on auth middleware)
 * @param {Object} req - Express request object (params: id, body: fields to update)
 * @param {Object} res - Express response object
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid Category ID format.' });
    }

    const updateFields = {};
    if (name !== undefined) {
      updateFields.name = name;
    }
    if (description !== undefined) {
      updateFields.description = description;
    }
    if (type !== undefined) {
      if (!['product', 'service'].includes(type)) {
        return res.status(400).json({ message: 'Category type must be "product" or "service".' });
      }
      updateFields.type = type;
    }

    // If name or type is being updated, check for uniqueness conflict
    if (name !== undefined || type !== undefined) {
      const categoryToUpdate = await Category.findById(id);
      if (!categoryToUpdate) {
        return res.status(404).json({ message: 'Category not found.' });
      }

      const newName = name !== undefined ? name : categoryToUpdate.name;
      const newType = type !== undefined ? type : categoryToUpdate.type;

      const existingCategory = await Category.findOne({
        name: newName,
        type: newType,
        _id: { $ne: id } // Exclude the current category being updated
      });

      if (existingCategory) {
        return res.status(409).json({ message: 'Another category with this name and type already exists.' });
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true } // `new: true` returns the updated document, `runValidators` ensures schema validators run
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found.' });
    }
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Delete a category
 * @route DELETE /api/categories/:id
 * @access Public (or Private, e.g., only owner or admin can delete)
 * @param {Object} req - Express request object (params: id)
 * @param {Object} res - Express response object
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid Category ID format.' });
    }

    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found.' });
    }
    res.status(200).json({ message: 'Category deleted successfully.' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
