import axios from "axios";
import { backendConfig } from "../constant/config";

const backendOriginUrl = backendConfig.base;

const apiClient = axios.create({
  baseURL: backendOriginUrl + "/franchise-milestone",
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

export const CreateFranchiseMilestone = async (franchiseMileStoneData) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Token not found");
  
      const response = await apiClient.post("/",
        
        franchiseMileStoneData,
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


  export const getFranchiseMilestone = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Token not found");
  
      const response = await apiClient.get("/",
        
        
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

 // api/franchisemilestone.js
export const deleteFranchiseMilestone = async (milestoneId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Token not found");
  
      // Make a DELETE request to /api/milestones/:milestoneId
      const response = await apiClient.delete(`/delete/${milestoneId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      return response.data; // { success: true, message: "…” }
    } catch (error) {
      throw error.response?.data || { message: "Failed to delete milestone" };
    }
  };
  
  export const updateFranchiseMilestone = async (milestoneId, payload) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Token not found");
  
      // This matches your router: POST /update-franchise-milestone/:milestoneId
      const response = await apiClient.post(
        `/update-franchise-milestone/${milestoneId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      return response.data; // { success: true, message: "...", data: updatedMilestone }
    } catch (error) {
      throw error.response?.data || { message: "Failed to update milestone" };
    }
  };