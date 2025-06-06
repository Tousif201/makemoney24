import axios from "axios";
import { backendConfig } from "../constant/config"; // Make sure this path is correct

const backendOriginUrl = backendConfig.base;

const apiClient = axios.create({
  baseURL: `${backendOriginUrl}/membership-packages`, // Base URL for membership packages
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * @typedef {Object} MembershipPackage
 * @property {string} _id - Package ID (from MongoDB)
 * @property {string} name - Name of the membership package
 * @property {number} validityInDays - Duration of the package in days
 * @property {string} description - Description of the package
 * @property {number} amount - Price of the package
 * @property {string} createdAt - Creation timestamp
 */

/**
 * @typedef {Object} MembershipPackageStats
 * @property {string} _id - Package ID (from MongoDB)
 * @property {string} name - Name of the membership package
 * @property {number} amount - Price of the package
 * @property {number} validityInDays - Duration of the package in days
 * @property {string} createdAt - Creation timestamp
 * @property {number} totalUsersEnrolled - Total number of users enrolled in this package
 * @property {number} totalAmountCollected - Total amount collected for this package
 */

/**
 * Create a new membership package
 * @param {{ name: string, validityInDays: number, description: string, amount: number }} data
 * @returns {Promise<MembershipPackage>}
 */
export const createMembershipPackage = async (data) => {
  try {
    const response = await apiClient.post("/create", data);
    return response.data.data; // Assuming your controller returns { message, data }
  } catch (error) {
    console.error(
      "Error creating membership package:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Get all membership packages with enrollment and amount stats
 * @returns {Promise<MembershipPackageStats[]>}
 */
export const getMembershipPackagesWithStats = async () => {
  try {
    const response = await apiClient.get("/stats");
    return response.data.data; // Assuming your controller returns { success, data }
  } catch (error) {
    console.error(
      "Error fetching membership package stats:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Update a membership package by ID
 * @param {string} id - The ID of the membership package to update
 * @param {{ name?: string, validityInDays?: number, description?: string, amount?: number }} data - Fields to update
 * @returns {Promise<MembershipPackage>}
 */
export const updateMembershipPackage = async (id, data) => {
  try {
    const response = await apiClient.put(`/update/${id}`, data);
    return response.data.data; // Assuming your controller returns { message, data }
  } catch (error) {
    console.error(
      "Error updating membership package:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Delete a membership package by ID
 * @param {string} id - The ID of the membership package to delete
 * @returns {Promise<{ message: string }>}
 */
export const deleteMembershipPackage = async (id) => {
  try {
    const response = await apiClient.delete(`/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting membership package:",
      error.response?.data || error.message
    );
    throw error;
  }
};
