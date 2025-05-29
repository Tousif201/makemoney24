import axios from "axios";
import { backendConfig } from "../constant/config";

const backendOriginUrl = backendConfig.base;

const apiClient = axios.create({
  baseURL: backendOriginUrl + "/orders", // Base URL for order-related API calls
  headers: {
    "Content-Type": "application/json",
  },
});

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
    // You might want to throw a custom error or re-throw the original error
    throw error;
  }
};
