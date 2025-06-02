// ======================================
// File: frontend/api/membershipMilestoneService.js
// ======================================

import axios from "axios";
// Assuming you have a config file for your backend URL
import { backendConfig } from "../constant/config"; // Adjust path as necessary

const backendOriginUrl = backendConfig.base;

// Create an Axios instance for membership milestone API calls
const apiClient = axios.create({
  baseURL: backendOriginUrl + "/membership-milestones", // Match your backend route prefix
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach Authorization token from localStorage (if available)
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const MembershipMilestoneService = {
  /**
   * @desc Create a new membership milestone
   * @param {object} milestoneData - The data for the new milestone
   * @returns {Promise<object>} - The created milestone data
   */
  createMilestone: async (milestoneData) => {
    try {
      const response = await apiClient.post("/", milestoneData);
      return response.data;
    } catch (error) {
      console.error('Error creating membership milestone:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  /**
   * @desc Get all membership milestones
   * @returns {Promise<Array>} - An array of membership milestones
   */
  getAllMilestones: async () => {
    try {
      const response = await apiClient.get("/");
      return response.data;
    } catch (error) {
      console.error('Error fetching all membership milestones:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  /**
   * @desc Get a single membership milestone by its MongoDB _id
   * @param {string} id - The MongoDB _id of the milestone to fetch
   * @returns {Promise<object>} - The single milestone data
   */
  getMilestoneById: async (id) => {
    try {
      const response = await apiClient.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching membership milestone with ID ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  /**
   * @desc Update an existing membership milestone
   * @param {string} id - The MongoDB _id of the milestone to update
   * @param {object} updatedData - The data to update (partial or full)
   * @returns {Promise<object>} - The updated milestone data
   */
  updateMilestone: async (id, updatedData) => {
    try {
      const response = await apiClient.put(`update-membership-milestone/${id}`, updatedData);
      return response.data;
    } catch (error) {
      console.error(`Error updating membership milestone with ID ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  /**
   * @desc Delete a membership milestone by its MongoDB _id
   * @param {string} id - The MongoDB _id of the milestone to delete
   * @returns {Promise<object>} - Confirmation message
   */
  deleteMilestone: async (id) => {
    try {
      const response = await apiClient.delete(`delete/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting membership milestone with ID ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  /**
   * @desc Get membership milestone statistics for dashboard display
   * @returns {Promise<object>} - Object with statistics like totalRewardsDistributed, totalUsersAchieved, averageRewardPerUser, totalActiveMilestones, totalMilestones.
   */
  getMilestoneStats: async () => {
    try {
      const response = await apiClient.get("/membership-milestone-home");
      return response.data;
    } catch (error) {
      console.error('Error fetching membership milestone statistics:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },
};