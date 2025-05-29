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
  
      const response = await apiClient.post("/",
        
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
        console.error(error)
      throw error.response?.data || { message: "Failed to fetch profile" };
    }
  };
  
export const getVendor = async (salesRepId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Token not found");
  
      const response = await apiClient.post("/assigned-to-salesrep",
        
        {salesRepId},
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
  
