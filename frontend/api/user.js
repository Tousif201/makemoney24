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

/**
 * @typedef {Object} UpgradeUserData
 * @property {number} membershipAmount - The amount paid for the membership.
 * @property {string} razorpayPaymentId - The Razorpay payment ID.
 * @property {string} razorpayOrderId - The Razorpay order ID.
 * @property {string} razorpaySignature - The Razorpay signature.
 */

/**
 * @typedef {Object} UpgradeUserResponse
 * @property {boolean} success - Indicates if the request was successful.
 * @property {string} message - A success message.
 * @property {Object} user - Details of the upgraded user.
 * @property {string} user.id - The ID of the upgraded user.
 * @property {string} user.name - The name of the upgraded user.
 * @property {string} user.email - The email of the upgraded user.
 * @property {boolean} user.isMember - The updated membership status of the user.
 * @property {string} transactionId - The ID of the created transaction.
 * @property {string} membershipId - The ID of the created membership record.
 */

/**
 * Upgrades a user's status to member and records the membership and transaction.
 * This function should typically be called after a successful payment confirmation.
 *
 * @param {string} userId - The ID of the user to upgrade.
 * @param {UpgradeUserData} data - The data required for the upgrade, including membership amount and Razorpay details.
 * @returns {Promise<UpgradeUserResponse>} A promise that resolves to the upgrade success response.
 * @throws {Error} If the API request fails (e.g., user not found, invalid data, or payment issues).
 */
export const upgradeUser = async (userId, data) => {
  try {
    const response = await apiClient.post(`/upgrade/${userId}`, data);
    return response.data;
  } catch (error) {
    console.error(
      `Error upgrading user ${userId} to member:`,
      error.response?.data || error.message
    );
    throw error; // Re-throw the error for the calling component to handle
  }
};

/**
 * @typedef {Object} UpdateAccountStatusResponse
 * @property {boolean} success - Indicates if the request was successful.
 * @property {string} message - A success message indicating the new status.
 * @property {Object} user - Details of the user whose status was updated.
 * @property {string} user.id - The ID of the user.
 * @property {string} user.email - The email of the user.
 * @property {string} user.accountStatus - The new account status ("active" or "suspended").
 */

/**
 * Updates a user's account status to a specified value ("active" or "suspended").
 * This function is typically used by administrators.
 *
 * @param {string} userId - The ID of the user whose account status is to be updated.
 * @param {string} status - The desired account status ("active" or "suspended").
 * @returns {Promise<UpdateAccountStatusResponse>} A promise that resolves to the update status response.
 * @throws {Error} If the API request fails (e.g., user not found, invalid user ID, invalid status).
 */
export const updateAccountStatus = async (userId, status) => {
  try {
    const response = await apiClient.put(`/update-status/${userId}`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error updating account status for user ${userId}:`,
      error.response?.data || error.message
    );
    throw error; // Re-throw the error for the calling component to handle
  }
};
