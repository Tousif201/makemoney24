import axios from "axios";
import { backendConfig } from "../constant/config"; // Ensure this path is correct

const backendOriginUrl = backendConfig.base;

const apiClient = axios.create({
  baseURL: backendOriginUrl, // e.g., "http://localhost:5000/api"
  // For file uploads, we generally don't set 'Content-Type' header to 'application/json'
  // directly when sending FormData. Axios handles it automatically.
});

/**
 * @typedef {Object} UploadedMediaItem
 * @property {string} url - The URL of the uploaded file.
 * @property {'image'|'video'|'other'} type - The type of media (image, video, or other).
 * @property {string} key - The unique key of the file in Uploadthing (needed for deletion).
 */

/**
 * @desc Uploads files to the backend, which then forwards them to Uploadthing.
 * @param {File[]} files - An array of File objects to upload (e.g., from an <input type="file"> event).
 * @returns {Promise<UploadedMediaItem[]>} A promise that resolves to an array of uploaded media details.
 * @throws {Error} Throws an error if the upload fails.
 */
export const uploadFiles = async (files) => {
  if (!files || files.length === 0) {
    throw new Error("No files provided for upload.");
  }
console.log("chal rha hai ")
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file); // 'files' must match the Multer field name in your backend
  });

  try {
    const response = await apiClient.post("/uploadFiles/upload", formData, {
      headers: {
        // When sending FormData, let Axios set the 'Content-Type' to 'multipart/form-data'
        // and include the correct boundary automatically.
        // 'Content-Type': 'multipart/form-data', // This header is often best left unset for FormData
      },
      // You can add onUploadProgress if you want to show a progress bar
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        // console.log(`Upload progress: ${percentCompleted}%`);
        // You could use a state update here to show progress in your UI
      },
    });
    console.log(response ,"upload file API")
    return response.data; // Array of UploadedMediaItem
  } catch (error) {
    console.error(
      "Error uploading files:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * @typedef {Object} DeleteFilesResponse
 * @property {string} message - A success or failure message.
 * @property {string[]} deletedKeys - Array of keys that were successfully deleted.
 * @property {string[]} [failedKeys] - Array of keys that failed to be deleted (if applicable).
 * @property {number} [deletedCount] - The number of files successfully deleted (from backend response).
 */

/**
 * @desc Deletes files from Uploadthing via the backend.
 * @param {string[]} fileKeys - An array of unique keys of the files to delete (obtained during upload).
 * @returns {Promise<DeleteFilesResponse>} A promise that resolves to a confirmation object.
 * @throws {Error} Throws an error if the deletion fails.
 */
export const deleteFiles = async (fileKeys) => {
  console.log(fileKeys);
  if (!fileKeys || fileKeys.length === 0) {
    throw new Error("No file keys provided for deletion.");
  }

  try {
    // Axios DELETE requests with a body use the 'data' property
    const response = await apiClient.post("/uploadFiles/delete", {
      fileKeys, // Send fileKeys in the request body
    });
    return response.data; // Confirmation object from the backend
  } catch (error) {
    console.error(
      "Error deleting files:",
      error.response?.data || error.message
    );
    throw error;
  }
};
