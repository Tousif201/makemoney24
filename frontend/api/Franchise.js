import axios from "axios";
import { backendConfig } from "../constant/config";

const backendOriginUrl = backendConfig.base;

const apiClient = axios.create({
  baseURL: backendOriginUrl + "/franchises",
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

// create vender Api
export const CreateFranchise = async (franchiseData) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Token not found");

    const response = await apiClient.post(
      "/",

      franchiseData,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Optional if you're not using protect middleware
        },
      }
    );
    console.log(response);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch profile" };
  }
};

export const getFranchise = async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Token not found");

    const response = await apiClient.get(
      "/",

      {
        headers: {
          Authorization: `Bearer ${token}`, // Optional if you're not using protect middleware
        },
      }
    );
    // console.log(response);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch profile" };
  }
};
/**
 * @desc Fetches all franchises (Admin access)
 * @route GET /api/franchises/getAll (This is already covered by `getFranchise` if it's meant to be global)
 * @returns {Promise<Object[]>} A promise that resolves to an array of franchise data.
 * @throws {Error} Throws an error if the API call fails.
 */
export const getAllFranchise = async () => {
  try {
    // The interceptor already adds the token, but it's good practice to ensure it's there.
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Token not found");

    const response = await apiClient.get("/getAll"); // Calls GET /api/franchises
    return response.data;
  } catch (error) {
    console.error("Error fetching all franchises:", error);
    throw error.response?.data || { message: "Failed to fetch all franchises" };
  }
};