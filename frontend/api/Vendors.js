import axios from "axios";
import { backendConfig } from "../constant/config";

const backendOriginUrl = backendConfig.base;

const apiClient = axios.create({
  baseURL: backendOriginUrl + "/vendors",
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
export const createVendor = async (vendorData) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Token not found");

    const response = await apiClient.post(
      "/",

      vendorData,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Optional if you're not using protect middleware
        },
      }
    );
    console.log(response);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error.response?.data || { message: "Failed to fetch profile" };
  }
};

export const getVendor = async (salesRepId) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Token not found");

    const response = await apiClient.post(
      "/assigned-to-salesrep",

      { salesRepId },
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

/**
 * @desc Fetches all vendors.
 * @returns {Promise<Object[]>} A promise that resolves to an array of vendor data.
 * @throws {Error} Throws an error if the API call fails.
 */
export const getAllVendors = async (sortByRevenue = null) => {
  try {
    // The interceptor already handles adding the token, but we ensure it exists.
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Token not found");

    // Build query parameters
    const params = new URLSearchParams();
    if (sortByRevenue) {
      params.append('sortByRevenue', sortByRevenue);
    }

    const queryString = params.toString();
    const url = queryString ? `/?${queryString}` : "/";

    const response = await apiClient.get(url); // Corresponds to GET /api/vendors
    return response.data;
  } catch (error) {
    console.error("Error fetching all vendors:", error);
    throw error.response?.data || { message: "Failed to fetch all vendors" };
  }
};


export const AddVendorAddress = async (addressData) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Token not found");
    const response = await apiClient.post("/create-address", addressData, { // <-- Adjust endpoint if needed
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating address:", error.response?.data?.message || error.message);
    // Re-throw the error so the component can handle it
    throw error;
  }
};


export const approveVendor = async (vendorId) => {
  try {
    // The interceptor already handles adding the token.
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Token not found");

    // This makes a PATCH request to a route like `/api/vendors/${vendorId}/approve`
    // Ensure your backend router is configured to handle this PATCH request.
    const response = await apiClient.patch(`/${vendorId}/approve`);
    return response.data;
  } catch (error) {
    console.error("Error approving vendor:", error);
    throw error.response?.data || { message: "Failed to approve vendor" };
  }
};