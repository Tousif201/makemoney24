import axios from "axios";
import { backendConfig } from "../constant/config";

const backendOriginUrl = backendConfig.base;

const apiClient = axios.create({
  baseURL: `${backendOriginUrl}/users`, 
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * @typedef {Object} GlobalMetrics
 * @property {number} totalUsers - Total number of registered users.
 * @property {number} totalReferrals - Total number of users who were referred.
 * @property {number} totalReferralEarnings - Total earnings from all referral rewards.
 */

/**
 * @typedef {Object} UserDetail
 * @property {string} id - User's MongoDB ID.
 * @property {string} name - User's name.
 * @property {string} email - User's email address.
 * @property {string} phone - User's phone number.
 * @property {string} referralCode - User's unique referral code.
 * @property {string} membershipStatus - "Member" or "Non-Member" based on `isMember` field.
 * @property {number} totalReferrals - Total number of direct referrals made by this user.
 * @property {number} totalReferralEarnings - Total referral earnings for this specific user.
 * @property {string} joiningDate - User's joining date (ISO string).
 * @property {number} totalSpent - Total amount spent by the user on completed orders.
 */

/**
 * @typedef {Object} PaginationInfo
 * @property {number} currentPage - The current page number.
 * @property {number} limit - The number of items per page.
 * @property {number} totalPages - Total number of pages available.
 * @property {number} totalResults - Total number of results matching the criteria.
 */

/**
 * @typedef {Object} AdminDashboardData
 * @property {boolean} success - Indicates if the request was successful.
 * @property {GlobalMetrics} globalMetrics - Overall statistics for the dashboard.
 * @property {PaginationInfo} pagination - Information about the current pagination state.
 * @property {UserDetail[]} users - Array of user details for the current page.
 */

/**
 * Fetches comprehensive admin dashboard data, including global metrics and
 * a paginated list of users with their referral and spending details.
 *
 * @param {number} [page=1] - The page number to retrieve.
 * @param {number} [limit=10] - The number of users per page.
 * @param {string} [search=""] - A search term to filter users by name, email, phone, or referral code.
 * @returns {Promise<AdminDashboardData>} A promise that resolves to the admin dashboard data.
 * @throws {Error} If the API request fails.
 */
export const getAdminDashboard = async (page = 1, limit = 10, search = "") => {
  try {
    const response = await apiClient.get("/admin", {
      params: {
        page,
        limit,
        search,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching admin dashboard data:",
      error.response?.data || error.message
    );
    throw error; // Re-throw the error for the calling component to handle
  }
};
