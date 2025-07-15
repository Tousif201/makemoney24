import axios from "axios";
import { backendConfig } from "../constant/config";

const backendOriginUrl = backendConfig.base;

const apiClient = axios.create({
  baseURL: backendOriginUrl + "/auth",
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

// Login API
export const loginUser = async (payload) => {
  try {
    const response = await apiClient.post("/login", payload);
    // console.log(response);
    return response.data;
  } catch (error) {
    console.error(error)
    throw error.response?.data || { message: "Login failed" };
  }
};

// Register API
export const registerUser = async (payload) => {
  try {
    const response = await apiClient.post("/register", payload);
    console.log(response,"api response")
    return response.data;
  } catch (error) {
    console.error(error)
    throw error.response?.data || { message: "Registration failed" };
  }
};

// Verify OTP API
export const verifyOtp = async (payload) => {
  try {
    const response = await apiClient.post("/verify-otp", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "OTP verification failed" };
  }
};

// Logout API
export const logoutUser = async () => {
  try {
    const response = await apiClient.post("/logout");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Logout failed" };
  }
};


export const forgotPassword = async (payload)=>{
  try {
    const response = await apiClient.post("/forgot-password-request-otp", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "OTP verification failed" };
  }
}
export const resetPassword = async (payload)=>{
  try {
    const response = await apiClient.post("/reset-password", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "OTP verification failed" };
  }
}

// ✅ Get User Profile API
export const getUserProfile = async (userId) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Token not found");

    const response = await apiClient.post(
      "/profile",
      { userId },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Optional if you're not using protect middleware
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch profile" };
  }
};
export const fetchUserDetails = async (userId) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Token not found");

    const response = await apiClient.get(`/admin-dashboard/user/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Optional if you're not using protect middleware
        },
      }
    );
    // console.log("fetch api call", response);
    return response.data;
  } catch (error) {
    console.error(error)
    throw error.response?.data || { message: "Failed to fetch profile" };
  }
};

// Function to fetch user's referral performance (requires admin role)
export const fetchUserReferralPerformance = async (userId, date,authToken) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Token not found");
    
    // DEBUG: Log what we're sending
    console.log("=== FRONTEND DEBUG ===");
    console.log("userId:", userId);
    console.log("date being sent:", date);
    console.log("typeof date:", typeof date);
    console.log("=====================");
    
    const response = await apiClient.post(
      `/admin-dashboard/user/referral-performance/${userId}`,
      {
        date: date,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    console.log("Referral performance response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user referral performance:', error);
    throw error;
  }
};

export const loginAffiliate = async ({ email, password }) => {
 try {
  const response = await apiClient.post(`/login-affiliate`, {
    email,
    password,
  });

  return response.data;
 } catch (error) {
  console.error('Error in login as affiliate:', error);
  throw error;
}
 } 
