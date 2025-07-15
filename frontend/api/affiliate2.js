import axios from "axios";
import { backendConfig } from "../constant/config";

const backendOriginUrl = backendConfig.base;

const apiClient = axios.create({
  baseURL: backendOriginUrl + "/affiliate",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization token from localStorage (authToken)
// apiClient.interceptors.request.use((config) => {
//   if (typeof window !== "undefined") {
//     const token = localStorage.getItem("authToken");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//   }
//   return config;
// });

export const getAffiliateDashboardData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      // console.log(token,"my token pp");
      const response = await apiClient.get("/dashboard" , {
        headers: {
          // Your backend expects a token to identify the user
          Authorization: `Bearer ${token}`,
        },
      });
      // The backend nests the data inside a 'data' property
      return response.data.data;
    } catch (error) {
      // Log the error and re-throw it to be handled by the component
      console.error("Error fetching affiliate dashboard data:", error.response?.data?.message || error.message);
      throw error;
    }
  };