// ===================================
// File: controllers/category.controller.js
// ===================================
import { Category } from "../models/Category.model.js";
import { ProductService } from "../models/ProductService.model.js";
import mongoose from "mongoose";

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
    // Destructure image field from req.body
    const { name, description, type, parentId, image } = req.body;

    // Basic validation
    if (!name || !type) {
      return res
        .status(400)
        .json({ message: "Name and type are required for a category." });
    }
    if (!["product", "service"].includes(type)) {
      return res
        .status(400)
        .json({ message: 'Category type must be "product" or "service".' });
    }

    // Validate parentId if provided
    if (parentId) {
      if (!isValidObjectId(parentId)) {
        return res.status(400).json({ message: "Invalid parentId format." });
      }
      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        return res.status(404).json({ message: "Parent category not found." });
      }
      // Optional: Ensure child category type matches parent category type or is consistent
      if (parentCategory.type !== type) {
        return res.status(400).json({ message: "Subcategory type must match parent category type." });
      }
    }

    // Check if a category with the same name, type, and parentId already exists
    // This ensures uniqueness within a parent, or globally if it's a top-level category
    const existingCategory = await Category.findOne({
      name: name,
      type: type,
      parentId: parentId || null, // Handle null for top-level categories
    });
    if (existingCategory) {
      return res
        .status(409)
        .json({ message: "Category with this name, type, and parent already exists." });
    }

    const newCategory = new Category({
      name,
      description,
      type,
      parentId: parentId || null, // Save parentId as null if not provided
      image: image || {}, // Assign the image object, default to empty if not provided
    });

    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
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
      if (!["product", "service"].includes(type)) {
        return res
          .status(400)
          .json({ message: 'Category type must be "product" or "service".' });
      }
      filter.type = type;
    }
    // Only return top-level categories by default for this endpoint
    // Use getCategoriesByParentId or getCategoriesWithSubcategories for hierarchical data
    filter.parentId = null;

    const categories = await Category.find(filter).sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
      return res.status(400).json({ message: "Invalid Category ID format." });
    }

    const category = await Category.findById(id).populate('parentId'); // Populate parent if it exists
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
    // Destructure image field from req.body
    const { name, description, type, parentId, image } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid Category ID format." });
    }

    // Find the category to be updated first to get its current state
    const categoryToUpdate = await Category.findById(id);
    if (!categoryToUpdate) {
      return res.status(404).json({ message: "Category not found." });
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (type !== undefined) {
      if (!["product", "service"].includes(type)) {
        return res
          .status(400)
          .json({ message: 'Category type must be "product" or "service".' });
      }
      updateFields.type = type;
    }
    // Handle parentId update
    if (parentId !== undefined) {
      if (parentId === null) { // If null is explicitly sent, set parentId to null
        updateFields.parentId = null;
      } else if (isValidObjectId(parentId)) {
        // Prevent a category from being its own parent
        if (parentId.toString() === id.toString()) {
          return res.status(400).json({ message: "A category cannot be its own parent." });
        }
        const newParentCategory = await Category.findById(parentId);
        if (!newParentCategory) {
          return res.status(404).json({ message: "New parent category not found." });
        }
        // Optional: Ensure child category type matches new parent category type or is consistent
        if (newParentCategory.type !== (type || categoryToUpdate.type)) {
          return res.status(400).json({ message: "Subcategory type must match parent category type." });
        }
        updateFields.parentId = parentId;
      } else {
        return res.status(400).json({ message: "Invalid parentId format." });
      }
    }
    // Add image field to updateFields if present in req.body
    if (image !== undefined) {
      // Ensure image is an object with url and key, even if one is missing
      updateFields.image = {
        url: image.url || "",
        key: image.key || ""
      };
    }


    // Check for uniqueness conflict (name, type, parentId)
    // The new name, type, and parentId would be taken from updateFields if present,
    // otherwise from categoryToUpdate (the original category).
    const newName = updateFields.name !== undefined ? updateFields.name : categoryToUpdate.name;
    const newType = updateFields.type !== undefined ? updateFields.type : categoryToUpdate.type;
    const newParentId = updateFields.parentId !== undefined ? updateFields.parentId : categoryToUpdate.parentId;

    const existingCategory = await Category.findOne({
      name: newName,
      type: newType,
      parentId: newParentId,
      _id: { $ne: id }, // Exclude the current category being updated
    });

    if (existingCategory) {
      return res.status(409).json({
        message: "Another category with this name, type, and parent already exists.",
      });
    }

    // Prevent moving a parent category under one of its own subcategories
    if (parentId && parentId.toString() !== categoryToUpdate.parentId?.toString()) {
      let currentParent = parentId;
      // Recursively check if the new parentId is a descendant of the category being updated
      while (currentParent) {
        if (currentParent.toString() === id.toString()) {
          return res.status(400).json({ message: "Cannot move a category under its own descendant." });
        }
        const parent = await Category.findById(currentParent).select('parentId');
        currentParent = parent ? parent.parentId : null;
      }
    }


    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
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
      return res.status(400).json({ message: "Invalid Category ID format." });
    }

    // Check if the category has any subcategories
    const hasSubcategories = await Category.exists({ parentId: id });
    if (hasSubcategories) {
      return res.status(400).json({
        message: "Cannot delete category with existing subcategories. Delete subcategories first.",
      });
    }

    // Check if any products/services are associated with this category
    const hasAssociatedProducts = await ProductService.exists({ categoryId: id });
    if (hasAssociatedProducts) {
      return res.status(400).json({
        message: "Cannot delete category with associated products/services. Reassign or delete them first.",
      });
    }

    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found." });
    }
    res.status(200).json({ message: "Category deleted successfully." });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get all categories with a representative image from an associated product/service
 * @route GET /api/categories-with-images
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllCategoriesWithImages = async (req, res) => {
  try {
    const { categoryType } = req.query; // Get the categoryType from query parameters

    let categoryFilter = {}; // Initialize an empty filter object

    // If categoryType is provided, add it to the filter
    if (categoryType) {
      categoryFilter.type = categoryType;
    }

    const categories = await Category.find(categoryFilter); // Apply the filter here
    
    const categoriesWithImages = await Promise.all(
      categories.map(async (category) => {
        let imageUrl = null;
        let imageKey = null;

        // Prioritize the category's own image field if it exists and has a URL
        if (category.image && category.image.url) {
          imageUrl = category.image.url;
          imageKey = category.image.key;
        } else {
          // Fallback to a product/service image if category doesn't have one
          const productService = await ProductService.findOne({
            categoryId: category._id,
            "portfolio.0": { $exists: true },
          }).select("portfolio.url portfolio.key"); // Also select key if available

          if (productService && productService.portfolio.length > 0) {
            imageUrl = productService.portfolio[0].url;
            imageKey = productService.portfolio[0].key; // Get key from product/service
          }
        }

        return {
          _id: category._id,
          categoryName: category.name,
          description: category.description,
          type: category.type,
          parentId: category.parentId,
          image: { url: imageUrl || "", key: imageKey || "" }, // Return as image object
        };
      })
    );

    res.status(200).json(categoriesWithImages);
  } catch (error) {
    console.error("Error fetching categories with images:", error);
    res.status(500).json({
      message: "Failed to retrieve categories with images due to a server error.",
      error: error.message,
    });
  }
};


/**
 * @desc Recursive helper function to get all subcategories of a given parent
 * @param {ObjectId} parentId - The ID of the parent category
 * @returns {Array} An array of subcategory objects, potentially nested
 */
async function getSubcategories(parentId) {
  const subcategories = await Category.find({ parentId: parentId }).sort({ name: 1 });

  // Recursively fetch sub-subcategories
  const categoriesWithChildren = await Promise.all(
    subcategories.map(async (subcat) => {
      const children = await getSubcategories(subcat._id); // Recursive call
      return {
        ...subcat.toObject(),
        subcategories: children, // Nest children under 'subcategories' key
      };
    })
  );
  return categoriesWithChildren;
}

/**
 * @desc Get all categories and their nested subcategories
 * @route GET /api/categories/nested
 * @access Public
 * @param {Object} req - Express request object (query parameters: type)
 * @param {Object} res - Express response object
 */
export const getCategoriesWithSubcategories = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { parentId: null }; // Start with top-level categories

    if (type) {
      if (!["product", "service"].includes(type)) {
        return res
          .status(400)
          .json({ message: 'Category type must be "product" or "service".' });
      }
      filter.type = type;
    }

    const topLevelCategories = await Category.find(filter).sort({ name: 1 });

    const categoriesWithHierarchy = await Promise.all(
      topLevelCategories.map(async (category) => {
        const subcategories = await getSubcategories(category._id);
        return {
          ...category.toObject(),
          subcategories: subcategories,
        };
      })
    );

    res.status(200).json(categoriesWithHierarchy);
  } catch (error) {
    console.error("Error fetching nested categories:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get categories by their immediate parentId (or top-level if no parentId)
 * @route GET /api/categories/children/:parentId?
 * @access Public
 * @param {Object} req - Express request object (params: parentId, query: type)
 * @param {Object} res - Express response object
 */
export const getCategoriesByParentId = async (req, res) => {
  try {
    const { parentId } = req.params; // Get parentId from URL params
    const { type } = req.query; // Filter by type if provided

    const filter = {};

    if (parentId === "null" || parentId === undefined) { // If "null" string or undefined, fetch top-level
      filter.parentId = null;
    } else if (isValidObjectId(parentId)) {
      filter.parentId = parentId;
    } else {
      return res.status(400).json({ message: "Invalid parentId format." });
    }

    if (type) {
      if (!["product", "service"].includes(type)) {
        return res
          .status(400)
          .json({ message: 'Category type must be "product" or "service".' });
      }
      filter.type = type;
    }

    const categories = await Category.find(filter).sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories by parent ID:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get all categories (flat list, no hierarchy implied in return)
 * @route GET /api/categories/all-flat
 * @access Public
 * @param {Object} req - Express request object (query parameters: type)
 * @param {Object} res - Express response object
 */
export const getAllCategoriesFlat = async (req, res) => { // ADD THIS NEW FUNCTION
  try {
    const { type } = req.query;
    const filter = {};
    if (type) {
      if (!["product", "service"].includes(type)) {
        return res.status(400).json({ message: 'Category type must be "product" or "service".' });
      }
      filter.type = type;
    }
    const categories = await Category.find(filter).sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching all flat categories:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};