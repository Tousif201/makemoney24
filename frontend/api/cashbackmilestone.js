import axios from "axios";
import { backendConfig } from "../constant/config";

const backendOriginUrl = backendConfig.base;

const apiClient = axios.create({
  baseURL: backendOriginUrl + "/cashback-milestone",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization token from localStorage (authToken)
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const CashbackMilestoneService = {
  /**
   * @desc Create a new cashback milestone
   * @param {object} milestoneData - The data for the new milestone (name, status, milestone, rewardAmount, timeLimitDays, purchaseValue)
   * @returns {Promise<object>} - The created milestone data
   */
  createMilestone: async (milestoneData) => {
    try {
      const response = await apiClient.post("/", milestoneData);
      return response.data; // Contains { success: true, message: "...", data: {...} }
    } catch (error) {
      console.error('Error creating cashback milestone:', error.response?.data || error.message);
      throw error.response?.data || error; // Re-throw for handling in components/pages
    }
  },

  /**
   * @desc Get all cashback milestones
   * @returns {Promise<Array>} - An array of cashback milestones
   */
  getAllMilestones: async () => {
    try {
      const response = await apiClient.get("/");
      return response.data; // Contains { success: true, count: ..., data: [...] }
    } catch (error) {
      console.error('Error fetching all cashback milestones:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  /**
   * @desc Get a single cashback milestone by ID
   * @param {string} id - The ID of the milestone to fetch
   * @returns {Promise<object>} - The single milestone data
   */
//   getMilestoneById: async (id) => {
//     try {
//       const response = await apiClient.get(`${}/${id}`);
//       return response.data; // Contains { success: true, data: {...} }
//     } catch (error) {
//       console.error(Error `fetching cashback milestone with ID ${id}:`, error.response?.data || error.message);
//       throw error.response?.data || error;
//     }
//   },

  /**
   * @desc Update an existing cashback milestone
   * @param {string} id - The ID of the milestone to update
   * @param {object} updatedData - The data to update (partial or full)
   * @returns {Promise<object>} - The updated milestone data
   */
  updateMilestone: async (id, updatedData) => {
    try {
      const response = await apiClient.put(`update-cashback-milestone/${id}`, updatedData);
      return response.data; // Contains { success: true, message: "...", data: {...} }
    } catch (error) {
      console.error(Error `updating cashback milestone with ID ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  /**
   * @desc Delete a cashback milestone by ID
   * @param {string} id - The ID of the milestone to delete
   * @returns {Promise<object>} - Confirmation message
   */
  deleteMilestone: async (id) => {
    try {
      const response = await apiClient.delete(`delete/${id}`);
      return response.data; // Contains { success: true, message: "...", data: {} }
    } catch (error) {
      console.error(Error `deleting cashback milestone with ID ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },
};