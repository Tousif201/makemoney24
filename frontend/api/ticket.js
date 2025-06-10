// api/ticketApi.js (or wherever you prefer to name it)
import axios from "axios";
import { backendConfig } from "../constant/config"; // Ensure this path is correct for your project

const backendOriginUrl = backendConfig.base;

// Create an Axios instance for ticket-related API calls
const ticketApiClient = axios.create({
  baseURL: backendOriginUrl + "/ticket", // Base URL for ticket routes
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization token from localStorage (authToken) to every request
ticketApiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ======================================
// Ticket API Functions
// ======================================

/**
 * Creates a new support ticket.
 * @param {object} ticketData - The data for the new ticket.
 * @param {string} ticketData.title - The title of the ticket.
 * @param {string} ticketData.description - The detailed description.
 * @param {string} ticketData.category - The category of the ticket.
 * @param {string} ticketData.requesterId - The ID of the user creating the ticket.
 * @param {string} [ticketData.priority] - Optional priority (low, medium, high, urgent).
 * @param {string} [ticketData.assignedToId] - Optional ID of the agent to assign.
 * @param {Array<{key: string, url: string}>} [ticketData.attachments] - Array of attachment objects.
 * @returns {Promise<object>} - The created ticket object.
 */
export const createTicket = async (ticketData) => {
  try {
    const response = await ticketApiClient.post("/", ticketData);
    return response.data;
  } catch (error) {
    console.error("Error creating ticket:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches all tickets, with optional filters.
 * @param {object} [filters] - Optional filter parameters.
 * @param {string} [filters.status] - Filter by ticket status.
 * @param {string} [filters.category] - Filter by ticket category.
 * @param {string} [filters.requesterId] - Filter by requester ID.
 * @param {string} [filters.assignedToId] - Filter by assigned agent ID.
 * @returns {Promise<Array<object>>} - An array of ticket objects.
 */
export const getTickets = async (filters = {}) => {
  try {
    const response = await ticketApiClient.get("/", { params: filters });
    return response.data;
  } catch (error) {
    console.error("Error fetching tickets:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches a single ticket by its ID.
 * @param {string} ticketId - The ID of the ticket to fetch.
 * @returns {Promise<object>} - The ticket object.
 */
export const getTicketById = async (ticketId) => {
  try {
    const response = await ticketApiClient.get(`/${ticketId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching ticket by ID:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Updates an existing ticket.
 * @param {string} ticketId - The ID of the ticket to update.
 * @param {object} updateData - The data to update the ticket with.
 * @param {string} [updateData.status] - New status for the ticket.
 * @param {string} [updateData.assignedToId] - New assigned agent ID.
 * @param {string} [updateData.priority] - New priority for the ticket.
 * @param {Array<{key: string, url: string}>} [updateData.attachments] - New attachments to add.
 * @returns {Promise<object>} - The updated ticket object.
 */
export const updateTicket = async (ticketId, updateData) => {
  try {
    const response = await ticketApiClient.put(`/${ticketId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Error updating ticket:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Deletes a ticket by its ID.
 * @param {string} ticketId - The ID of the ticket to delete.
 * @returns {Promise<object>} - A success message.
 */
export const deleteTicket = async (ticketId) => {
  try {
    const response = await ticketApiClient.delete(`/${ticketId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting ticket:", error.response?.data || error.message);
    throw error;
  }
};

// ======================================
// Ticket Message API Functions
// ======================================

/**
 * Creates a new message for a specific ticket.
 * @param {object} messageData - The data for the new message.
 * @param {string} messageData.ticketId - The ID of the parent ticket.
 * @param {string} messageData.senderId - The ID of the user sending the message.
 * @param {string} messageData.message - The content of the message.
 * @param {Array<{key: string, url: string}>} [messageData.attachments] - Optional array of attachment objects.
 * @param {boolean} [messageData.isInternalNote] - Optional flag if it's an internal note.
 * @returns {Promise<object>} - The created ticket message object.
 */
export const createTicketMessage = async (messageData) => {
  try {
    // This route is /api/v1/tickets/messages on the backend
    const response = await ticketApiClient.post("/messages", messageData);
    return response.data;
  } catch (error) {
    console.error("Error creating ticket message:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches all messages for a specific ticket.
 * @param {string} ticketId - The ID of the ticket to fetch messages for.
 * @returns {Promise<Array<object>>} - An array of ticket message objects.
 */
export const getTicketMessages = async (ticketId) => {
  try {
    // This route is /api/v1/tickets/:ticketId/messages on the backend
    const response = await ticketApiClient.get(`/${ticketId}/messages`);
    return response.data;
  } catch (error) {
    console.error("Error fetching ticket messages:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Deletes a specific ticket message.
 * @param {string} messageId - The ID of the message to delete.
 * @returns {Promise<object>} - A success message.
 */
export const deleteTicketMessage = async (messageId) => {
  try {
    // This route is /api/v1/tickets/messages/:messageId on the backend
    const response = await ticketApiClient.delete(`/messages/${messageId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting ticket message:", error.response?.data || error.message);
    throw error;
  }
};

// You can export the apiClient instance itself if you need direct access
// export default ticketApiClient;
