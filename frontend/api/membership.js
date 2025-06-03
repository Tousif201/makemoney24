import axios from "axios";
import { backendConfig } from "../constant/config";

const backendOriginUrl = backendConfig.base;

const apiClient = axios.create({
  baseURL: backendOriginUrl + "/membership", // Changed baseURL to /membership as per the controller route
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * @desc Fetches the admin membership report.
 * @returns {Promise<Object>} A promise that resolves to the membership report data.
 * @throws {Error} Throws an error if the API call fails.
 */
export const adminMembershipReport = async () => {
  try {
    const response = await apiClient.get("/adminMembershipReport");
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error fetching admin membership report:", error);
    // It's good practice to re-throw the error so the calling component can handle it.
    throw error;
  }
};
