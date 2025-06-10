import axios from "axios";
import { backendConfig } from "../constant/config";

const backendOriginUrl = backendConfig.base;

const apiClient = axios.create({
  baseURL: backendOriginUrl + "/coupon-code",
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

export const CreateCouponCode = async (couponCodeData) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Token not found");
  
      const response = await apiClient.post("/",
        
        couponCodeData,
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

// ==============================
// Create Coupon
// ==============================


// ==============================
// Get All Coupons
// ==============================
export const GetAllCoupons = async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Authentication token not found.");

    const response = await apiClient.get("/", { // Adjusted path. Confirm your backend route.
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("API Error - GetAllCoupons:", error.response?.data || error.message);
    throw error.response?.data || { message: "Failed to fetch coupons." };
  }
};

// ==============================
// Update Coupon
// ==============================
export const UpdateCoupon = async (id, couponData) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Authentication token not found.");

    const response = await apiClient.put(`/update/${id}`, couponData, { // Adjusted path. Confirm your backend route.
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("api update coupon ",response)
    return response.data;
  } catch (error) {
    console.error("API Error - UpdateCoupon:", error.response?.data || error);
    throw error.response?.data || { message: "Failed to update coupon." };
  }
};

// ==============================
// Delete Coupon
// ==============================
export const DeleteCoupon = async (id) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Authentication token not found.");

    const response = await apiClient.delete(`/delete/${id}`, { // Adjusted path. Confirm your backend route.
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("API Error - DeleteCoupon:", error.response?.data || error.message);
    throw error.response?.data || { message: "Failed to delete coupon." };
  }
};

// ==============================
// Get Single Coupon by ID (Optional, but good for editing flow)
// ==============================
// export const GetCouponById = async (id) => {
//   try {
//     const token = localStorage.getItem("authToken");
//     if (!token) throw new Error("Authentication token not found.");

//     const response = await apiClient.get(`/admin/coupon/${id}`, { // Adjusted path. Confirm your backend route.
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error("API Error - GetCouponById:", error.response?.data || error.message);
//     throw error.response?.data || { message: "Failed to fetch coupon details." };
//   }
// };