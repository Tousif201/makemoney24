// ===================================
// File: controllers/productService.controller.js
// ===================================
import { ProductService } from "../models/ProductService.model.js";
import mongoose from "mongoose";
import { Review } from "../models/Review.model.js";
import { Vendor } from "../models/Vendor.model.js";
import { Category } from "../models/Category.model.js";
import { getNearbyPincodes } from "../utils/locationHelpers.js"; // Assuming you have a utility function to get nearby pincodes
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
      vendorId, // This is now assumed to be the userId of the vendor
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
      isEmiEligible,
      details,
      discountRate, // Destructure the discountRate
    } = req.body;

    // Basic validation for required fields
    if (!vendorId || !categoryId || !type || !title || price === undefined) {
      return res.status(400).json({
        message: "Vendor User ID, Category ID, type, title, and price are required.",
      });
    }

    // *** MODIFICATION START ***

    // 1. Find the Vendor document using the provided vendorId (which is the userId)
    const vendor = await Vendor.findOne({ userId: vendorId });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found with the provided user ID." });
    }

    // Now, use the actual _id of the found vendor document
    const actualVendorId = vendor._id;
    console.log(vendor, "Vendor")
    // Validate the actual vendorId from the found document
    if (!isValidObjectId(actualVendorId)) {
      return res.status(400).json({ message: "Invalid Vendor ID format obtained from the user ID." });
    }
    // *** MODIFICATION END ***

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

    // --- New Validation for Discount Rate ---
    // Ensure discountRate is a number and within 0-100 range
    const parsedDiscountRate = parseFloat(discountRate);
    if (isNaN(parsedDiscountRate) || parsedDiscountRate < 0 || parsedDiscountRate > 100) {
      return res.status(400).json({ message: "Discount rate must be a number between 0 and 100." });
    }
    // --- End New Validation ---

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
      vendorId: actualVendorId, // Use the actual _id from the found vendor document
      categoryId,
      type,
      title,
      details,
      description,
      price,
      portfolio: productPortfolio,
      variants: productVariants,
      pincode,
      isBookable: finalIsBookable,
      isInStock: isInStock !== undefined ? isInStock : true,
      isEmiEligible: isEmiEligible !== undefined ? isEmiEligible : false,
      discountRate: parsedDiscountRate, // Use the parsed and validated discount rate
    });

    const savedProductService = await newProductService.save();
    res.status(201).json(savedProductService);
  } catch (error) {
    console.error("Error creating product/service:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get all products/services with advanced filtering, sorting, pagination, and population
 * @route GET /api/product-services
 * @access Public
 * @param {Object} req - Express request object
 * @query {string} [vendorId] - Filter by vendor ID.
 * @query {string} [categoryId] - Comma-separated category IDs.
 * @query {"product" | "service"} [type] - Filter by type.
 * @query {string} [pincode] - Filter by pincode.
 * @query {string} [title] - Case-insensitive search by title.
 * @query {number} [minPrice] - Minimum price.
 * @query {number} [maxPrice] - Maximum price.
 * @query {string} [sortBy] - Field to sort by (e.g., 'price', 'createdAt', 'title', 'rating').
 * @query {"asc" | "desc"} [order] - Sort order ('asc' or 'desc', default 'desc').
 * @query {number} [page] - Page number (default 1).
 * @query {number} [limit] - Number of items per page (default 10).
 * @param {Object} res - Express response object
 * @returns {Object} { data: ProductServiceData[], totalCount: number, page: number, totalPages: number }
 */
// --- NEW HELPER FUNCTION ---
// This function finds all descendant category IDs for a given set of initial IDs.
const getAllDescendantCategoryIds = async (initialCategoryIds) => {
  if (!initialCategoryIds || initialCategoryIds.length === 0) {
    return [];
  }

  // Use a Set to store final IDs to prevent duplicates
  const finalIds = new Set(initialCategoryIds);

  // A queue to hold the IDs whose children we need to find
  let queue = [...initialCategoryIds];

  while (queue.length > 0) {
    // Find all categories whose parent is in the current queue
    const children = await Category.find({ parentId: { $in: queue } }).select("_id");

    // Get just the IDs of the children
    const childrenIds = children.map(c => c._id.toString());

    // Clear the queue for the next iteration
    queue = [];

    for (const childId of childrenIds) {
      // If we haven't already processed this ID, add it to the final set and the queue for the next level of search
      if (!finalIds.has(childId)) {
        finalIds.add(childId);
        queue.push(childId);
      }
    }
  }

  // Convert the Set back to an array
  return Array.from(finalIds);
};


// --- Main Controller Function ---
export const getProductServices = async (req, res) => {
  try {
    const {
      vendorId,
      categoryId,
      type,
      pincode,
      title,
      minPrice,
      maxPrice,
      sortBy,
      order,
      page,
      limit,
      color,
      size,
    } = req.query;
  console.log(req.query,"Query Params")

    let filter = {
      isAdminApproved: "approved",
    };

    let sort = { createdAt: -1 };

    // --- Build the initial filter object with ALL provided query parameters ---
    // This logic remains the same.
    if (categoryId) {
      const initialCategoryIds = categoryId.split(",").map((id) => id.trim()).filter((id) => isValidObjectId(id));
      if (initialCategoryIds.length === 0) return res.status(400).json({ message: "Invalid Category ID format(s)." });
      const allApplicableCategoryIds = await getAllDescendantCategoryIds(initialCategoryIds);
      filter.categoryId = { $in: allApplicableCategoryIds.map((id) => new mongoose.Types.ObjectId(id)) };
    }
    if (vendorId) {
      if (!isValidObjectId(vendorId)) return res.status(400).json({ message: "Invalid User ID format for vendorId." });
      const vendor = await Vendor.findOne({ userId: vendorId });
      if (!vendor) return res.status(404).json({ message: "Vendor not found for the provided user ID." });
      filter.vendorId = vendor._id;
    }
    if (type) {
      if (!["product", "service"].includes(type)) return res.status(400).json({ message: 'Type must be "product" or "service".' });
      filter.type = type;
    }
    if (pincode) {
      const allPincodes = await getNearbyPincodes(pincode);
      filter.pincode = { $in: allPincodes };
    }
    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    const variantConditions = {};
    if (color) {
      const colors = color.split(",").map((c) => c.trim()).filter(Boolean).map((c) => new RegExp(`^${c}$`, "i")); // "i" flag for case-insensitive match
      // console.log(colors)
      if (colors.length > 0) variantConditions.color = { $in: colors };
    }
    if (size) {
      const sizes = size.split(",").map((s) => s.trim()).filter(Boolean);
      if (sizes.length > 0) variantConditions.size = { $in: sizes };
    }
    if (Object.keys(variantConditions).length > 0) {
      filter.variants = { $elemMatch: variantConditions };
    }
    if (sortBy) {
      const sortOrder = order === "asc" ? 1 : -1;
      const allowedSortFields = ["price", "createdAt", "title", "rating"];
      if (allowedSortFields.includes(sortBy)) {
        sort = { [sortBy]: sortOrder };
        if (sortBy === "rating") sort.createdAt = -1;
      }
    }

    // --- Pagination and Smart Fallback Query Execution ---
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    let finalFilter = { ...filter };
    let totalCount;

    // We only perform this special check if a pincode was provided.
    if (pincode) {
      // Step 1: Count documents with the strict location-based filter.
      const localCount = await ProductService.countDocuments(finalFilter);

      // ✅ NEW FALLBACK LOGIC:
      // If a pincode was provided BUT we found fewer products than the page limit (or zero products)...
      if (localCount < limitNum) {
        // console.log(`Found only ${localCount} products locally. Falling back to a general search to provide more options.`);
        // ...then remove the pincode constraint to search globally.
        delete finalFilter.pincode;
      }
    }

    // Step 2: Calculate the final total count using the determined filter (either local or global).
    totalCount = await ProductService.countDocuments(finalFilter);
    const totalPages = Math.ceil(totalCount / limitNum);

    // Step 3: Execute the final find query using the `finalFilter`.
    const productServices = await ProductService.find(finalFilter)
      .populate({ path: "vendorId", select: "name" })
      .populate({ path: "categoryId", select: "name" })
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // --- Send the final response ---
    res.status(200).json({
      data: productServices,
      totalCount,
      page: pageNum,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching products/services:", error);
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({ message: `Invalid ID format for ${error.path}.` });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



/**
 * @desc Get a single product or service by ID, populating related fields and associated reviews
 * @route GET /api/products/:id or /api/services/:id
 * @access Public
 */
export const getProductServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product/Service ID format.",
      });
    }

    // 1. Find the product/service and populate the 'categoryId' and 'vendorId' fields.
    // Ensure you populate 'vendorId' as well if you need vendor details on the frontend.
    // If your ProductService model has 'vendorId', you should populate it.
    const productService = await ProductService.findById(id).populate(
      "categoryId",
      "name description"
    ); // Populating category details
    // .populate("vendorId", "name email"); // Uncomment and adjust if you need vendor details
    // Select fields carefully to avoid sensitive data.

    // Check if the product/service was found
    if (!productService) {
      return res
        .status(404)
        .json({ success: false, message: "Product or Service not found." });
    }

    // 2. Fetch associated reviews for the found product/service
    const reviews = await Review.find({
      itemId: productService._id,
      itemType: productService.type, // Assuming 'type' (product/service) is on your ProductService model
    }).populate("userId", "name avatar"); // Populate user details for each review (e.g., username, avatar)
    // Adjust 'username' and 'avatar' to match your User model fields.

    // 3. Combine the product/service data with its reviews
    const responseData = {
      ...productService.toObject(), // Convert Mongoose document to plain JavaScript object
      reviews: reviews,
    };

    // Send the populated product/service data along with its reviews
    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error("Error fetching product/service by ID:", error);
    // Handle specific Mongoose CastError if an invalid ID is passed that bypasses isValidObjectId
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format for lookup." });
    }
    // Generic server error for other issues
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
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
