import axios from "axios";
import { backendConfig } from "../constant/config";

const backendOriginUrl = backendConfig.base;

const apiClient = axios.create({
    baseURL: backendOriginUrl + "/auth",
    headers: {
        "Content-Type": "application/json",
    },
});

// Login API
export const loginUser = async (payload) => {
    try {
        const response = await apiClient.post("/login", payload);
        // console.log(response);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Login failed" };
    }
};

// Register API
export const registerUser = async (payload) => {
    try {
        const response = await apiClient.post("/register", payload);
        return response.data;
    } catch (error) {
        console.error(error);
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
