import axios from "axios";
import { backendConfig } from "../constant/config"; // Make sure this path is correct

const backendOriginUrl = backendConfig.base;

const apiClient = axios.create({
  baseURL: `${backendOriginUrl}/banners`,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * @typedef {Object} Banner
 * @property {string} _id - Banner ID (from MongoDB)
 * @property {Object} image
 * @property {string} image.url - Image URL
 * @property {string} image.key - Image storage key
 * @property {string} [redirectTo] - Optional redirect URL
 */

/**
 * Create a new banner
 * @param {{ image: { url: string, key: string }, redirectTo?: string }} data
 * @returns {Promise<Banner>}
 */
export const createBanner = async (data) => {
  try {
    const response = await apiClient.post("/", data);
    return response.data;
  } catch (error) {
    console.error("Error creating banner:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetch all banners
 * @returns {Promise<Banner[]>}
 */
export const getAllBanners = async () => {
  try {
    const response = await apiClient.get("/");
    return response.data;
  } catch (error) {
    console.error("Error fetching banners:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetch a single banner by ID
 * @param {string} id
 * @returns {Promise<Banner>}
 */
export const getBannerById = async (id) => {
  try {
    const response = await apiClient.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching banner by ID:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update a banner
 * @param {string} id
 * @param {{ image?: { url: string, key: string }, redirectTo?: string }} data
 * @returns {Promise<Banner>}
 */
export const updateBanner = async (id, data) => {
  try {
    const response = await apiClient.put(`/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating banner:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete a banner
 * @param {string} id
 * @returns {Promise<{ message: string }>}
 */
export const deleteBanner = async (id) => {
  try {
    const response = await apiClient.delete(`/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting banner:", error.response?.data || error.message);
    throw error;
  }
};
