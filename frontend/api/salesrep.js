import axios from "axios";
import { backendConfig } from "../constant/config";

const backendOriginUrl = backendConfig.base;

const apiClient = axios.create({
  baseURL: backendOriginUrl + "/sales-rep",
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
export const CreateSalesRep = async (SalesRepData) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Token not found");
console.log(token)
    const response = await apiClient.post(
      "/create",

      SalesRepData,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Optional if you're not using protect middleware
        },
      }
    );
    console.log("create sales rep api",response);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch profile" };
  }
};
// create vender Api

// create vender Api
export const getAllSalesRep = async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Token not found");
console.log(token)
    const response = await apiClient.get(
      "/get",

      
      {
        headers: {
          Authorization: `Bearer ${token}`, // Optional if you're not using protect middleware
        },
      }
    );
    console.log("create sales rep api",response);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch profile" };
  }
};
// create vender Api
export const deleteSalesRep = async (salesRepId) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Token not found");
console.log(token)
    const response = await apiClient.delete(
      `/delete/${salesRepId}`,

      
      {
        headers: {
          Authorization: `Bearer ${token}`, // Optional if you're not using protect middleware
        },
      }
    );
    console.log("create sales rep api",response);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch profile" };
  }
};


export const createAffiliate = async (affiliateData) => {
  try {
    const token = localStorage.getItem("authToken");
    const { data } = await apiClient.post("/create-affiliate", affiliateData,{
      headers :{
        Authorization:`Bearer ${token}`
      }
    });

    return data;
  } catch (error) {
    console.error("Error creating affiliate:", error.response?.data || error.message);
    // Re-throw a clearer error for the UI to catch
    throw new Error(error.response?.data?.message || "Failed to create the new affiliate.");
  }
};
