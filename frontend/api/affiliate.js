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
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});





export const submitAffiliateRequest = async (formData) => {
  try {
    const token = localStorage.getItem("authToken")
    const response = await apiClient.post(`/create-request`, formData, {
      headers:{
        Authorization:`Bearer ${token}`
      } // If you're using cookies for authentication
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// You can add more API functions related to affiliate requests here
export const getAffiliateRequests = async () => {
  try {
    const response = await apiClient.get(`/get-request`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const handleAffiliateRequest = async (action, userId, commissionRate = null) => {
  try {
    const response = await apiClient.post(`/approve-reject`, {
      action,
      userId,
      commissionRate,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};



export const getAffiliateUserDetails = async (userId) =>{
  try {
    const response = await apiClient.get(`/shopnship/${userId}`);
    return response;
  } catch (error) {
    throw error
  }
}

export const addAffiliateUserBucket = async (productId) =>{
  try {
    const response = await apiClient.get(`/add-bucket/${productId}`);
    return response;
  } catch (error) {
    throw error
  }
}

export const fetchAffiliateBucket = async () => {
  try {
    const token = localStorage.getItem("authToken")
    const response = await apiClient.get(`/get-bucket`,{
      headers :{
        Authorization:`Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching affiliate bucket:', error);
    throw error;
  }
};

export const fetchAffiliateOrders = async () => {
  try {
    const token = localStorage.getItem("authToken")
    const response = await apiClient.get(`/get-orders`,{
      headers :{
        Authorization:`Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching affiliate orders:', error);
    throw error;
  }
};


export const fetchAffiliateLinkProducts = async (userId,companyName) => {
  try {
    const token = localStorage.getItem("authToken")
    const response = await apiClient.get(`/affiliate-products/${userId}/${companyName}`,{
      headers :{
        Authorization:`Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching affiliate orders:', error);
    throw error;
  }
};
