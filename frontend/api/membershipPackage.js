import axios from "axios";
import { backendConfig } from "../constant/config";

const backendOriginUrl = backendConfig.base;

const apiClient = axios.create({
  baseURL: backendOriginUrl + "/membership-packages",
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


export const CreateMembershipPackage = async (packageData) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Token not found");
  
      const response = await apiClient.post("/create",
        
        packageData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Optional if you're not using protect middleware
          },
        }
      );
        // console.log("consoling api response",response);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch profile" };
    }
  };

  export const getMembershipPackage = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Token not found");
  
      const response = await apiClient.get("/stats",
        
        
        {
          headers: {
            Authorization: `Bearer ${token}`, // Optional if you're not using protect middleware
          },
        }
      );
        console.log("consoling api response",response);
      return response.data;
    } catch (error) {
        console.error(error)
      throw error.response?.data || { message: "Failed to show package" };
    }
  };

  export const updatePackage = async (packageId, packageData) => {
    try {
        const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Token not found");
      const response = await apiClient.put(`/update/${packageId}`, packageData, {
        headers: {
          Authorization: `Bearer ${token}`, // Optional if you're not using protect middleware
        },
      });
      console.log("update api responsee",response);
      return response.data;
    } catch (error) {
      console.error("Error updating package:", error);
      throw error; // Re-throw to be handled by the component
    }
  };