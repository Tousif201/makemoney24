import axios from "axios";
import { backendConfig } from "../constant/config";

const backendOriginUrl = backendConfig.base;

const apiClient = axios.create({
  baseURL: backendOriginUrl + "/analytics",
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





export const getSalesRepHomeData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Token not found");
  
      const response = await apiClient.get("/vendor-home",
        
       
        {
          headers: {
            Authorization: `Bearer ${token}`, // Optional if you're not using protect middleware
          },
        }
      );
        // console.log(response);
      return response.data;
    } catch (error) {
        console.log(error)
      throw error.response?.data || { message: "Failed to fetch profile" };
    }
  };
  