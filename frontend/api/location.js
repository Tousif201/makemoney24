import axios from "axios";
import { backendConfig } from "../constant/config";

// Base URL for the backend API
const backendOriginUrl = backendConfig.base;

/**
 * Creates an Axios instance for making API requests related to location.
 * Sets 'Content-Type' header to 'application/json' by default.
 */
const apiClient = axios.create({
    baseURL: backendOriginUrl + "/location", // Base URL for location-related endpoints
    headers: {
        "Content-Type": "application/json", // Default content type
    },
});

/**
 * Axios request interceptor to attach the Authorization token (if needed).
 * This ensures that all requests made using 'apiClient' are authenticated.
 */
apiClient.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("authToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

/**
 * Fetches location details based on latitude and longitude.
 * Makes a GET request to the /location endpoint with query params.
 *
 * @param {number|string} lat - The latitude of the user location.
 * @param {number|string} lon - The longitude of the user location.
 * @returns {Promise<object>} A promise that resolves to the location data including pincode.
 * @throws {Error} If the API call fails.
 */
export const fetchLocationByCoordinates = async (lat, lon) => {
    try {
        const response = await apiClient.get("/", {
            params: { lat, lon },
        });
        return response.data; // Return the location info from server
    } catch (error) {
        console.error("Error fetching location from coordinates:", error);
        throw error;
    }
};
