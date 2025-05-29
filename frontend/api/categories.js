import axios from 'axios';
import { backendConfig } from '../constant/config'; // Ensure this path is correct

const backendOriginUrl = backendConfig.base; // e.g., "http://localhost:5000/api"

const apiClient = axios.create({
  baseURL: `${backendOriginUrl}/categories`, // Base URL for category endpoints
  headers: {
    'Content-Type': 'application/json',
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
    const response = await apiClient.post('/', categoryData);
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error.response?.data || error.message);
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
    const response = await apiClient.get('/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error.response?.data || error.message);
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
      throw new Error('Category ID is required.');
    }
    const response = await apiClient.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching category with ID ${id}:`, error.response?.data || error.message);
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
      throw new Error('Category ID is required for update.');
    }
    const response = await apiClient.put(`/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`Error updating category with ID ${id}:`, error.response?.data || error.message);
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
      throw new Error('Category ID is required for deletion.');
    }
    const response = await apiClient.delete(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting category with ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// --- Example Usage ---
/*
// 1. Create a category
createCategory({ name: 'Groceries', description: 'Daily food items', type: 'product' })
  .then(category => console.log('Created category:', category))
  .catch(error => console.error('Failed to create category:', error.message));

// 2. Get all categories
getCategories()
  .then(categories => console.log('All categories:', categories))
  .catch(error => console.error('Failed to get categories:', error.message));

// 3. Get all service categories
getCategories('service')
  .then(serviceCategories => console.log('Service categories:', serviceCategories))
  .catch(error => console.error('Failed to get service categories:', error.message));

// 4. Get a category by ID
const categoryId = '60d0fe4f3b8b1a001c8a123a'; // Replace with a real ID
getCategoryById(categoryId)
  .then(category => console.log('Category by ID:', category))
  .catch(error => console.error(`Failed to get category ${categoryId}:`, error.message));

// 5. Update a category
const updateCategoryId = '60d0fe4f3b8b1a001c8a123b'; // Replace with a real ID
updateCategory(updateCategoryId, { name: 'Updated Electronics', description: 'All electronic gadgets' })
  .then(updatedCat => console.log('Updated category:', updatedCat))
  .catch(error => console.error('Failed to update category:', error.message));

// 6. Delete a category
const deleteCategoryId = '60d0fe4f3b8b1a001c8a123c'; // Replace with a real ID
deleteCategory(deleteCategoryId)
  .then(message => console.log('Delete message:', message))
  .catch(error => console.error('Failed to delete category:', error.message));
*/