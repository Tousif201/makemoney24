import axios from "axios";
import { backendConfig } from "../constant/config";

// Base URL for the backend API, derived from backendConfig
const backendOriginUrl = backendConfig.base;

/**
 * Creates an Axios instance for making API requests related to EMI.
 * The base URL is constructed using the backend configuration.
 * Sets 'Content-Type' header to 'application/json' by default.
 */
const apiClient = axios.create({
    baseURL: backendOriginUrl + "/emi", // Base URL for EMI-related endpoints
    headers: {
        "Content-Type": "application/json", // Default content type for requests
    },
});

/**
 * Axios request interceptor to attach the Authorization token to outgoing requests.
 * This ensures that all requests made using 'apiClient' are authenticated if a token exists.
 * The token is retrieved from localStorage.
 */
apiClient.interceptors.request.use((config) => {
    // Check if window is defined (for client-side execution)
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("authToken"); // Get the authentication token from localStorage
        if (token) {
            // If a token exists, set the Authorization header
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config; // Return the modified config
});

/**
 * Fetches EMI history details for a specific user.
 * This function relies on the `apiClient` interceptor to automatically attach the auth token.
 *
 * @param {string} userId - The ID of the user whose EMI history is to be fetched.
 * @returns {Promise<object>} A promise that resolves to the EMI history data.
 * @throws {Error} If the API call fails or a token is not found (though the interceptor handles token attachment).
 */
export const fetchUserEmiDetails = async (userId) => {
    try {
        // The apiClient interceptor automatically adds the Authorization header.
        // No need to manually add headers here.
        const response = await apiClient.get(`history/user/${userId}`);
        return response.data; // Return the data received from the API
    } catch (error) {
        // Log and re-throw any errors that occur during the API call
        console.error('Error fetching user EMI history details:', error);
        throw error;
    }
};

/**
 * Fetches general EMI details for a specific user.
 * This function also relies on the `apiClient` interceptor for authentication.
 *
 * @param {string} userId - The ID of the user whose general EMI details are to be fetched.
 * @returns {Promise<object>} A promise that resolves to the general EMI details data.
 * @throws {Error} If the API call fails.
 */
export const fetchUserEmiDetailsByUser = async (userId) => {
    try {
        // The apiClient interceptor automatically adds the Authorization header.
        // No need to manually add headers here.
        const response = await apiClient.get(`/details/user/${userId}`);
        return response.data; // Return the data received from the API
    } catch (error) {
        // Log and re-throw any errors that occur during the API call
        console.error('Error fetching user EMI details:', error);
        throw error;
    }
};
