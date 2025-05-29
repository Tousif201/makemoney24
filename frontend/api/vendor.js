import axios from "axios";
import { backendConfig } from "../constant/config";

const backendOriginUrl = backendConfig.base;

const apiClient = axios.create({
  baseURL: backendOriginUrl, // /api is already in the url by convention, adjust if not
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * @desc Fetches orders from the backend with optional filters.
 * @param {Object} payload - Object containing query parameters for filtering.
 * @param {string} [payload.userId] - Optional. Filter by User ID.
 * @param {string} [payload.vendorId] - Optional. Filter by Vendor ID.
 * @param {('pending'|'completed'|'failed')} [payload.paymentStatus] - Optional. Filter by payment status.
 * @param {('placed'|'confirmed'|'in-progress'|'delivered'|'cancelled')} [payload.orderStatus] - Optional. Filter by order status.
 * @param {string} [payload.startDate] - Optional. Filter orders placed on or after this date (YYYY-MM-DD).
 * @param {string} [payload.endDate] - Optional. Filter orders placed on or before this date (YYYY-MM-DD).
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of order objects.
 * @throws {Error} - Throws an error if the API call fails.
 */
export const getOrders = async (payload = {}) => {
  try {
    const response = await apiClient.get("/orders", {
      params: payload, // Axios automatically serializes this object into query parameters
    });
    return response.data; // The actual order data is in response.data
  } catch (error) {
    console.error("Error fetching orders:", error);
    // You might want to throw a custom error or handle it more gracefully
    throw error;
  }
};


/**
 * @typedef {Object} PortfolioItem
 * @property {string} type - Type of portfolio item (e.g., 'image', 'video').
 * @property {string} url - URL of the portfolio item.
 */

/**
 * @typedef {Object} ProductVariant
 * @property {string} [color] - Color of the variant.
 * @property {string} [size] - Size of the variant.
 * @property {string} [sku] - Stock Keeping Unit.
 * @property {number} [quantity] - Quantity in stock for this variant.
 * @property {string[]} [images] - Array of image URLs for this variant.
 */

/**
 * @typedef {Object} CreateProductServicePayload
 * @property {string} vendorId - The ID of the vendor creating the product/service.
 * @property {string} categoryId - The ID of the category this product/service belongs to.
 * @property {'product'|'service'} type - Whether it's a 'product' or a 'service'.
 * @property {string} title - The title of the product or service.
 * @property {string} [description] - A detailed description.
 * @property {number} price - The price of the product or service.
 * @property {PortfolioItem[]} [portfolio] - Array of portfolio items (images, videos, etc.).
 * @property {ProductVariant[]} [variants] - Array of product variants (only for 'product' type).
 * @property {string} [pincode] - The pincode associated with the product/service (e.g., service area).
 * @property {boolean} [isBookable] - Whether the service is bookable (only for 'service' type, defaults to false).
 * @property {boolean} [isInStock] - Whether the product is in stock (defaults to true).
 */

/**
 * @desc Creates a new product or service in the backend.
 * @param {CreateProductServicePayload} payload - The data for the new product or service.
 * @returns {Promise<Object>} A promise that resolves to the created product/service object.
 * @throws {Error} Throws an error if the API call fails or validation errors occur.
 */
export const createProductService = async (payload) => {
  try {
    const response = await apiClient.post("/product-services", payload);
    return response.data; // The created product/service object
  } catch (error) {
    console.error("Error creating product/service:", error.response?.data || error.message);
    throw error; // Re-throw the error for the calling component to handle
  }
};

/**
 * @typedef {Object} GetProductServicesPayload
 * @property {string} [vendorId] - Optional. Filter by Vendor ID.
 * @property {string} [categoryId] - Optional. Filter by Category ID.
 * @property {('product'|'service')} [type] - Optional. Filter by type ('product' or 'service').
 * @property {string} [pincode] - Optional. Filter by pincode.
 * @property {string} [title] - Optional. Filter by title (case-insensitive search).
 * @property {number} [minPrice] - Optional. Filter by minimum price.
 * @property {number} [maxPrice] - Optional. Filter by maximum price.
 */

/**
 * @desc Fetches products and services from the backend with optional filters.
 * @param {GetProductServicesPayload} payload - Object containing query parameters for filtering.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of product/service objects.
 * @throws {Error} - Throws an error if the API call fails.
 */
export const getProductServices = async (payload = {}) => {
  try {
    const response = await apiClient.get("/product-services", {
      params: payload, // Axios automatically serializes this object into query parameters
    });
    return response.data; // The actual product/service data is in response.data
  } catch (error) {
    console.error("Error fetching product/services:", error);
    // You might want to throw a custom error or handle it more gracefully
    throw error;
  }
};

/**
 * @desc Fetches a single product or service by its ID.
 * @param {string} id - The ID of the product or service to fetch.
 * @returns {Promise<Object>} - A promise that resolves to a single product/service object.
 * @throws {Error} - Throws an error if the API call fails or the product/service is not found.
 */
export const getProductServiceById = async (id) => {
  try {
    const response = await apiClient.get(`/product-services/${id}`);
    return response.data; // The single product/service object
  } catch (error) {
    console.error(`Error fetching product/service with ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * @typedef {Object} UpdateProductServicePayload
 * @property {string} [categoryId] - The ID of the category this product/service belongs to.
 * @property {'product'|'service'} [type] - Whether it's a 'product' or a 'service'.
 * @property {string} [title] - The title of the product or service.
 * @property {string} [description] - A detailed description.
 * @property {number} [price] - The price of the product or service.
 * @property {PortfolioItem[]} [portfolio] - Array of portfolio items (images, videos, etc.).
 * @property {ProductVariant[]} [variants] - Array of product variants (only for 'product' type).
 * @property {string} [pincode] - The pincode associated with the product/service.
 * @property {boolean} [isBookable] - Whether the service is bookable (only for 'service' type).
 * @property {boolean} [isInStock] - Whether the product is in stock.
 */

/**
 * @desc Updates an existing product or service in the backend.
 * @param {string} id - The ID of the product or service to update.
 * @param {UpdateProductServicePayload} payload - The data for updating the product or service.
 * @returns {Promise<Object>} A promise that resolves to the updated product/service object.
 * @throws {Error} Throws an error if the API call fails or validation errors occur.
 */
export const updateProductService = async (id, payload) => {
  try {
    const response = await apiClient.put(`/product-services/${id}`, payload);
    return response.data; // The updated product/service object
  } catch (error) {
    console.error(`Error updating product/service with ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * @desc Deletes a product or service from the backend.
 * @param {string} id - The ID of the product or service to delete.
 * @returns {Promise<Object>} - A promise that resolves to a success message.
 * @throws {Error} - Throws an error if the API call fails or the product/service is not found.
 */
export const deleteProductService = async (id) => {
  try {
    const response = await apiClient.delete(`/product-services/${id}`);
    return response.data; // A success message object
  } catch (error) {
    console.error(`Error deleting product/service with ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
};
