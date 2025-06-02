// ===================================
// File: api/order.api.js
// ===================================
import axios from "axios";
import { backendConfig } from "../constant/config";

const backendOriginUrl = backendConfig.base;

const apiClient = axios.create({
  baseURL: backendOriginUrl + "/orders", // Base URL for order-related API calls
  headers: {
    "Content-Type": "application/json",
    // Add authorization header if needed, e.g., 'Authorization': `Bearer ${token}`
  },
});

/**
 * @desc Creates a new order.
 * @param {Object} orderData - The order data (userId, vendorId, items).
 * @returns {Promise<Object>} A promise that resolves to the created order.
 * @throws {Error} Throws an error if the API call fails.
 */
export const createOrderApi = async (orderData) => {
  try {
    const response = await apiClient.post("/", orderData);
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

/**
 * @desc Fetches all orders, with optional filters.
 * @param {Object} [filters] - Optional filters like userId, vendorId, paymentStatus, orderStatus, startDate, endDate.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of orders.
 * @throws {Error} Throws an error if the API call fails.
 */
export const getOrdersApi = async (filters = {}) => {
  try {
    // Axios automatically serializes the filters object into query parameters
    const response = await apiClient.get("/", { params: filters });
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

/**
 * @desc Fetches a single order by its ID.
 * @param {string} orderId - The ID of the order to fetch.
 * @returns {Promise<Object>} A promise that resolves to the order data.
 * @throws {Error} Throws an error if the API call fails or order is not found.
 */
export const getOrderByIdApi = async (orderId) => {
  try {
    const response = await apiClient.get(`/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order with ID ${orderId}:`, error);
    throw error;
  }
};

/**
 * @desc Updates an existing order by its ID.
 * @param {string} orderId - The ID of the order to update.
 * @param {Object} updateData - The data to update (e.g., { paymentStatus: 'completed', orderStatus: 'delivered' }).
 * @returns {Promise<Object>} A promise that resolves to the updated order data.
 * @throws {Error} Throws an error if the API call fails or order is not found.
 */
export const updateOrderApi = async (orderId, updateData) => {
  try {
    const response = await apiClient.put(`/${orderId}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`Error updating order with ID ${orderId}:`, error);
    throw error;
  }
};

/**
 * @desc Deletes an order by its ID.
 * @param {string} orderId - The ID of the order to delete.
 * @returns {Promise<Object>} A promise that resolves to a success message.
 * @throws {Error} Throws an error if the API call fails or order is not found.
 */
export const deleteOrderApi = async (orderId) => {
  try {
    const response = await apiClient.delete(`/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting order with ID ${orderId}:`, error);
    throw error;
  }
};

/**
 * @desc Fetches the admin sales report.
 * @returns {Promise<Object>} A promise that resolves to the sales report data.
 * @throws {Error} Throws an error if the API call fails.
 */
export const getAdminSalesReportApi = async () => {
  try {
    const response = await apiClient.get("/getAdminSalesReport");
    return response.data;
  } catch (error) {
    console.error("Error fetching admin sales report:", error);
    throw error;
  }
};
