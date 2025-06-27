import axios from "axios";
import { backendConfig } from "../constant/config"; // Ensure this path is correct

const backendOriginUrl = backendConfig.base;

const apiClient = axios.create({
  baseURL: `${backendOriginUrl}/product-services`, // Base URL for product/service endpoints
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * @typedef {Object} PortfolioItem
 * @property {string} type - Type of media (e.g., "image", "video")
 * @property {string} url - URL of the media
 */

/**
 * @typedef {Object} ProductVariantImage
 * @property {string} url - Image URL
 * @property {string} key - Image storage key (if applicable)
 */

/**
 * @typedef {Object} ProductVariant
 * @property {string} [color] - Variant color
 * @property {string} [size] - Variant size
 * @property {string} [sku] - Stock Keeping Unit
 * @property {number} [quantity] - Quantity in stock for this variant
 * @property {ProductVariantImage[]} [images] - Array of variant images
 */

/**
 * @typedef {Object} ProductServiceData
 * @property {string} _id - Product/Service ID (from MongoDB)
 * @property {string} vendorId - ID of the vendor
 * @property {string} categoryId - ID of the category
 * @property {"product" | "service"} type - Type of listing
 * @property {string} title - Title of the product or service
 * @property {string} [description] - Description of the product or service
 * @property {number} price - Price of the product or service
 * @property {PortfolioItem[]} [portfolio] - Array of portfolio media (images/videos)
 * @property {ProductVariant[]} [variants] - Array of product variants (only for products)
 * @property {string} [pincode] - Associated pincode for serviceability/delivery
 * @property {boolean} [isBookable] - True if service can be booked (only for services)
 * @property {boolean} [isInStock] - True if product is in stock (default: true)
 * @property {string} createdAt - Timestamp of creation
 * @property {string} updatedAt - Timestamp of last update
 */

/**
 * Creates a new product or service.
 * @param {Omit<ProductServiceData, '_id' | 'createdAt' | 'updatedAt'>} data - The product/service data.
 * @returns {Promise<ProductServiceData>} A promise that resolves to the created product/service data.
 */
export const createProductService = async (data) => {
  try {
    const response = await apiClient.post("/", data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating product/service:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Fetches products/services based on various criteria.
 * @param {Object} [params] - Query parameters for filtering.
 * @param {string} [params.vendorId] - Filter by vendor ID.
 * @param {string} [params.categoryId] - Filter by category ID.
 * @param {"product" | "service"} [params.type] - Filter by type ("product" or "service").
 * @param {string} [params.pincode] - Filter by pincode.
 * @param {string} [params.title] - Filter by title (case-insensitive search).
 * @param {number} [params.minPrice] - Filter by minimum price.
 * @param {number} [params.maxPrice] - Filter by maximum price.
 * @returns {Promise<ProductServiceData[]>} A promise that resolves to an array of product/service data.
 */
export const getProductServices = async (params) => {
  try {
    const response = await apiClient.get("/", { params });
    // console.log("get product and service browse",response.data)
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching products/services:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Fetches a single product or service by its ID.
 * @param {string} id - The ID of the product or service.
 * @returns {Promise<ProductServiceData>} A promise that resolves to the product/service data.
 */
export const getProductServiceById = async (id) => {
  try {
    const response = await apiClient.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching product/service with ID ${id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Updates an existing product or service.
 * @param {string} id - The ID of the product or service to update.
 * @param {Partial<Omit<ProductServiceData, '_id' | 'createdAt' | 'updatedAt'>>} data - The fields to update.
 * @returns {Promise<ProductServiceData>} A promise that resolves to the updated product/service data.
 */
export const updateProductService = async (id, data) => {
  try {
    const response = await apiClient.put(`/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(
      `Error updating product/service with ID ${id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Deletes a product or service.
 * @param {string} id - The ID of the product or service to delete.
 * @returns {Promise<{ message: string }>} A promise that resolves to a success message.
 */
export const deleteProductService = async (id) => {
  try {
    const response = await apiClient.delete(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error deleting product/service with ID ${id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};
