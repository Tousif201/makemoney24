import axios from "axios";
import { backendConfig } from "../constant/config"; // Assuming this path is correct

const backendOriginUrl = backendConfig.base;

// Create an Axios instance specifically for review-related API calls
const reviewApiClient = axios.create({
  baseURL: backendOriginUrl + "/reviews", // Base URL for review endpoints
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization token from localStorage to every request
reviewApiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/**
 * @desc Create a new review
 * @route POST /api/reviews
 * @param {Object} reviewData - The review payload (userId, itemId, itemType, rating, comment, media)
 * @returns {Promise<Object>} The created review object
 */
export const createReview = async (reviewData) => {
  try {
    const response = await reviewApiClient.post("/", reviewData);
    return response.data;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error.response?.data || { message: "Failed to create review." };
  }
};

/**
 * @desc Get all reviews or filter by itemId/itemType/userId
 * @route GET /api/reviews
 * @param {Object} [params] - Optional query parameters (itemId, itemType, userId)
 * @returns {Promise<Array>} An array of review objects
 */
export const getReviews = async (params) => {
  try {
    const response = await reviewApiClient.get("/", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error.response?.data || { message: "Failed to fetch reviews." };
  }
};

/**
 * @desc Get a single review by ID
 * @route GET /api/reviews/:id
 * @param {string} id - The ID of the review to fetch
 * @returns {Promise<Object>} The review object
 */
export const getReviewById = async (id) => {
  try {
    const response = await reviewApiClient.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching review with ID ${id}:`, error);
    throw error.response?.data || { message: "Review not found." };
  }
};

/**
 * @desc Update an existing review
 * @route PUT /api/reviews/:id
 * @param {string} id - The ID of the review to update
 * @param {Object} updateData - The fields to update (rating, comment, media)
 * @returns {Promise<Object>} The updated review object
 */
export const updateReview = async (id, updateData) => {
  try {
    const response = await reviewApiClient.put(`/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`Error updating review with ID ${id}:`, error);
    throw error.response?.data || { message: "Failed to update review." };
  }
};

/**
 * @desc Delete a review
 * @route DELETE /api/reviews/:id
 * @param {string} id - The ID of the review to delete
 * @returns {Promise<Object>} Success message
 */
export const deleteReview = async (id) => {
  try {
    const response = await reviewApiClient.delete(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting review with ID ${id}:`, error);
    throw error.response?.data || { message: "Failed to delete review." };
  }
};