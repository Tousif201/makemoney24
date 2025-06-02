import axios from "axios";
import { backendConfig } from "../constant/config"; // Ensure this path is correct

const backendOriginUrl = backendConfig.base; // e.g., "http://localhost:5000/api"

const apiClient = axios.create({
  baseURL: `${backendOriginUrl}/categories`, // Base URL for category endpoints
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * @typedef {Object} CategoryPayload
 * @property {string} name - The name of the category.
 * @property {string} [description] - A description of the category.
 * @property {'product' | 'service'} type - The type of category ('product' or 'service').
 */

/**
 * @typedef {Object} CategoryResponse
 * @property {string} _id - The ID of the category.
 * @property {string} name - The name of the category.
 * @property {string} [description] - A description of the category.
 * @property {'product' | 'service'} type - The type of category.
 * @property {string} createdAt - The creation timestamp.
 * @property {string} updatedAt - The last update timestamp.
 * @property {number} __v - Version key.
 */

/**
 * @desc Creates a new category.
 * @param {CategoryPayload} categoryData - The data for the new category.
 * @returns {Promise<CategoryResponse>} A promise that resolves to the created category object.
 * @throws {Error} Throws an error if the API call fails or validation errors occur.
 */
export const createCategory = async (categoryData) => {
  try {
    const response = await apiClient.post("/", categoryData);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating category:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * @desc Fetches all categories, optionally filtered by type.
 * @param {'product' | 'service'} [type] - Optional type to filter categories.
 * @returns {Promise<CategoryResponse[]>} A promise that resolves to an array of category objects.
 * @throws {Error} Throws an error if the API call fails.
 */
export const getCategories = async (type = null) => {
  try {
    const params = {};
    if (type) {
      params.type = type;
    }
    const response = await apiClient.get("/", { params });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching categories:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * @desc Fetches a single category by its ID.
 * @param {string} id - The ID of the category to fetch.
 * @returns {Promise<CategoryResponse>} A promise that resolves to the category object.
 * @throws {Error} Throws an error if the API call fails (e.g., category not found, invalid ID).
 */
export const getCategoryById = async (id) => {
  try {
    if (!id) {
      throw new Error("Category ID is required.");
    }
    const response = await apiClient.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching category with ID ${id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * @desc Updates an existing category by its ID.
 * @param {string} id - The ID of the category to update.
 * @param {Partial<CategoryPayload>} updateData - The data to update (e.g., { name: 'New Name' }).
 * @returns {Promise<CategoryResponse>} A promise that resolves to the updated category object.
 * @throws {Error} Throws an error if the API call fails or validation errors occur.
 */
export const updateCategory = async (id, updateData) => {
  try {
    if (!id) {
      throw new Error("Category ID is required for update.");
    }
    const response = await apiClient.put(`/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error(
      `Error updating category with ID ${id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * @desc Deletes a category by its ID.
 * @param {string} id - The ID of the category to delete.
 * @returns {Promise<{ message: string }>} A promise that resolves to a success message.
 * @throws {Error} Throws an error if the API call fails (e.g., category not found, invalid ID).
 */
export const deleteCategory = async (id) => {
  try {
    if (!id) {
      throw new Error("Category ID is required for deletion.");
    }
    const response = await apiClient.delete(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error deleting category with ID ${id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * @desc Fetches all categories with a representative image.
 * @route GET /api/categories-with-images
 * @returns {Promise<CategoryWithImageResponse[]>} A promise that resolves to an array of category objects with an image URL.
 * @throws {Error} Throws an error if the API call fails.
 */
export const getAllCategoriesWithImages = async () => {
  try {
    const response = await apiClient.get("/categories-with-images");
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching categories with images:",
      error.response?.data || error.message
    );
    throw error;
  }
};
