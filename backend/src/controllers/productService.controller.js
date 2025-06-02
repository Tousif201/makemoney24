// ===================================
// File: controllers/productService.controller.js
// ===================================
import { ProductService } from "../models/ProductService.model.js";
import mongoose from "mongoose";

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * @desc Create a new product or service
 * @route POST /api/productservices
 * @access Public (or Private, e.g., Vendor role)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createProductService = async (req, res) => {
  try {
    const {
      vendorId,
      categoryId,
      type,
      title,
      description,
      price,
      portfolio,
      variants,
      pincode,
      isBookable,
      isInStock,
    } = req.body;

    // Basic validation for required fields
    if (!vendorId || !categoryId || !type || !title || price === undefined) {
      return res
        .status(400)
        .json({
          message:
            "Vendor ID, Category ID, type, title, and price are required.",
        });
    }
    if (!isValidObjectId(vendorId)) {
      return res.status(400).json({ message: "Invalid Vendor ID format." });
    }
    if (!isValidObjectId(categoryId)) {
      return res.status(400).json({ message: "Invalid Category ID format." });
    }
    if (!["product", "service"].includes(type)) {
      return res
        .status(400)
        .json({ message: 'Type must be "product" or "service".' });
    }
    if (price < 0) {
      return res.status(400).json({ message: "Price cannot be negative." });
    }

    // Prepare portfolio array
    const productPortfolio = Array.isArray(portfolio)
      ? portfolio.map((item) => ({
          type: item.type,
          url: item.url,
        }))
      : [];

    // Prepare variants array (only for products)
    let productVariants = [];
    if (type === "product" && Array.isArray(variants)) {
      productVariants = variants.map((variant) => ({
        color: variant.color,
        size: variant.size,
        sku: variant.sku,
        quantity: variant.quantity !== undefined ? variant.quantity : 0,
        images: Array.isArray(variant.images) ? variant.images : [],
      }));
    } else if (type === "service" && variants && variants.length > 0) {
      // Services should not have variants
      return res
        .status(400)
        .json({ message: "Services cannot have variants." });
    }

    // isBookable is only true for services
    const finalIsBookable = type === "service" ? isBookable || false : false;

    const newProductService = new ProductService({
      vendorId,
      categoryId,
      type,
      title,
      description,
      price,
      portfolio: productPortfolio,
      variants: productVariants,
      pincode,
      isBookable: finalIsBookable,
      isInStock: isInStock !== undefined ? isInStock : true,
    });

    const savedProductService = await newProductService.save();
    res.status(201).json(savedProductService);
  } catch (error) {
    console.error("Error creating product/service:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get all products/services or filter by various criteria, including vendorId
 * @route GET /api/productservices (with query parameters: vendorId, categoryId, type, pincode, title, minPrice, maxPrice)
 * @access Public
 * @param {Object} req - Express request object (query parameters: vendorId, categoryId, type, pincode, title, minPrice, maxPrice)
 * @param {Object} res - Express response object
 */
export const getProductServices = async (req, res) => {
  // This is the controller to update
  try {
    const { vendorId, categoryId, type, pincode, title, minPrice, maxPrice } =
      req.query;
    const filter = {};

    // --- NEW / MODIFIED LOGIC FOR vendorId ---
    if (vendorId) {
      if (!isValidObjectId(vendorId)) {
        return res.status(400).json({ message: "Invalid Vendor ID format." });
      }
      filter.vendorId = vendorId; // Add vendorId to filter if present
    }
    // --- END NEW / MODIFIED LOGIC ---

    if (categoryId) {
      if (!isValidObjectId(categoryId))
        return res.status(400).json({ message: "Invalid Category ID format." });
      filter.categoryId = categoryId;
    }
    if (type) {
      if (!["product", "service"].includes(type))
        return res
          .status(400)
          .json({ message: 'Type must be "product" or "service".' });
      filter.type = type;
    }
    if (pincode) {
      filter.pincode = pincode;
    }
    if (title) {
      filter.title = { $regex: title, $options: "i" }; // Case-insensitive search
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const productServices = await ProductService.find(filter).sort({
      createdAt: -1,
    }); // Sort by newest first
    res.status(200).json(productServices);
  } catch (error) {
    console.error("Error fetching products/services:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
/**
 * @desc Get a single product or service by ID, populating related fields
 * @route GET /api/products/:id or /api/services/:id
 * @access Public
 */
export const getProductServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Product/Service ID format." });
    }

    // Find the product/service and populate the 'vendorId' and 'categoryId' fields.
    // Adjust the second argument of populate to select specific fields from the populated documents
    // to avoid sending sensitive data or unnecessarily large objects.
    const productService = await ProductService.findById(id)
      .populate("categoryId", "name description"); // Populating category details, select fields carefully

    // Check if the product/service was found
    if (!productService) {
      return res.status(404).json({ success: false, message: "Product or Service not found." });
    }

    // Send the populated product/service data
    res.status(200).json({ success: true, data: productService });
  } catch (error) {
    console.error("Error fetching product/service by ID:", error);
    // Handle specific Mongoose CastError if an invalid ID is passed that bypasses isValidObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: "Invalid ID format for lookup." });
    }
    // Generic server error for other issues
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
/**
 * @desc Update an existing product or service
 * @route PUT /api/productservices/:id
 * @access Public (or Private, e.g., Vendor role, only owner can update)
 * @param {Object} req - Express request object (params: id, body: fields to update)
 * @param {Object} res - Express response object
 */
export const updateProductService = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      categoryId,
      type, // Type should generally not be changed after creation, but allowed for flexibility
      title,
      description,
      price,
      portfolio,
      variants,
      pincode,
      isBookable,
      isInStock,
    } = req.body;

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ message: "Invalid Product/Service ID format." });
    }

    const updateFields = {};
    if (categoryId !== undefined) {
      if (!isValidObjectId(categoryId))
        return res.status(400).json({ message: "Invalid Category ID format." });
      updateFields.categoryId = categoryId;
    }
    if (type !== undefined) {
      if (!["product", "service"].includes(type))
        return res
          .status(400)
          .json({ message: 'Type must be "product" or "service".' });
      updateFields.type = type;
    }
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (price !== undefined) {
      if (price < 0)
        return res.status(400).json({ message: "Price cannot be negative." });
      updateFields.price = price;
    }
    if (portfolio !== undefined) {
      if (!Array.isArray(portfolio))
        return res.status(400).json({ message: "Portfolio must be an array." });
      updateFields.portfolio = portfolio.map((item) => ({
        type: item.type,
        url: item.url,
      }));
    }
    if (pincode !== undefined) updateFields.pincode = pincode;
    if (isInStock !== undefined) updateFields.isInStock = isInStock;

    // Handle variants and isBookable conditionally based on the updated type or existing type
    const currentProductService = await ProductService.findById(id);
    if (!currentProductService) {
      return res.status(404).json({ message: "Product or Service not found." });
    }

    const effectiveType = type || currentProductService.type; // Use new type if provided, else old type

    if (effectiveType === "product") {
      if (variants !== undefined) {
        if (!Array.isArray(variants))
          return res
            .status(400)
            .json({ message: "Variants must be an array for products." });
        updateFields.variants = variants.map((variant) => ({
          color: variant.color,
          size: variant.size,
          sku: variant.sku,
          quantity: variant.quantity !== undefined ? variant.quantity : 0,
          images: Array.isArray(variant.images) ? variant.images : [],
        }));
      }
      // Ensure isBookable is false for products
      updateFields.isBookable = false;
    } else if (effectiveType === "service") {
      // Services should not have variants, clear them if type changes to service
      updateFields.variants = [];
      if (isBookable !== undefined) {
        updateFields.isBookable = isBookable;
      }
    }

    const updatedProductService = await ProductService.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedProductService) {
      return res.status(404).json({ message: "Product or Service not found." });
    }
    res.status(200).json(updatedProductService);
  } catch (error) {
    console.error("Error updating product/service:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Delete a product or service
 * @route DELETE /api/productservices/:id
 * @access Public (or Private, e.g., Vendor role, only owner or admin can delete)
 * @param {Object} req - Express request object (params: id)
 * @param {Object} res - Express response object
 */
export const deleteProductService = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ message: "Invalid Product/Service ID format." });
    }

    const deletedProductService = await ProductService.findByIdAndDelete(id);
    if (!deletedProductService) {
      return res.status(404).json({ message: "Product or Service not found." });
    }
    res
      .status(200)
      .json({ message: "Product or Service deleted successfully." });
  } catch (error) {
    console.error("Error deleting product/service:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
