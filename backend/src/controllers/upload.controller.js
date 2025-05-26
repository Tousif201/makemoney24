// ===================================
// File: controllers/upload.controller.js
// ===================================
import { utapi } from "../utils/uploadthing.js"; // Import the UTApi instance

/**
 * @desc Upload files to Uploadthing from Multer memory buffers
 * @route POST /api/upload
 * @access Public (or Private, depending on auth middleware)
 * @param {Object} req - Express request object (expects files from Multer in req.files)
 * @param {Object} res - Express response object
 */
export const uploadFiles = async (req, res) => {
  try {
    // Multer stores files in req.files when using array() or fields()
    // or in req.file when using single().
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files provided for upload." });
    }

    // Prepare files for Uploadthing's UTApi.uploadFiles method.
    // UTApi.uploadFiles expects an array of File objects or Blobs.
    // In Node.js, you can create a File object from a buffer.
    const filesToUpload = files.map((file) => {
      // The File constructor in Node.js (from 'node:buffer' or global in newer versions)
      // can be used to create a File-like object from a buffer.
      // Ensure your Node.js version supports this (v15.x and later).
      // The 'type' option is crucial for Uploadthing to correctly identify the file type.
      return new File([file.buffer], file.originalname, {
        type: file.mimetype,
      });
    });

    // Log the files being sent to Uploadthing for debugging
    console.log(
      "Files prepared for Uploadthing:",
      filesToUpload.map((f) => ({ name: f.name, type: f.type, size: f.size }))
    );

    const response = await utapi.uploadFiles(filesToUpload);

    // Log the full response from Uploadthing for debugging
    console.log("Response from Uploadthing:", response);

    // Basic validation of the Uploadthing response
    // Now checking for file.data and file.data.ufsUrl
    if (
      !response ||
      !Array.isArray(response) ||
      response.some((f) => !f || !f.data || !f.data.ufsUrl)
    ) {
      console.error(
        "Uploadthing response malformed or missing ufsUrl:",
        response
      );
      return res
        .status(500)
        .json({
          message:
            "Uploadthing returned an invalid response or missing file URLs.",
        });
    }

    const uploadedMedia = response.map((file) => {
      // Access the data object first, then its properties
      const fileData = file.data;

      // Use fileData.ufsUrl as recommended by deprecation warning
      const url = fileData.ufsUrl;

      // Ensure fileData.type is a string before calling startsWith.
      // Provide a fallback or default if fileData.type is undefined or not a string.
      const mediaType =
        fileData.type && typeof fileData.type === "string"
          ? fileData.type.startsWith("image/")
            ? "image"
            : fileData.type.startsWith("video/")
              ? "video"
              : "other"
          : "other"; // Default to 'other' if type is missing or not a string

      return {
        url: url,
        type: mediaType,
        key: fileData.key, // Include the file key for deletion later
      };
    });

    res.status(200).json(uploadedMedia);
  } catch (error) {
    console.error("Error uploading files to Uploadthing:", error);
    res
      .status(500)
      .json({ message: "Failed to upload files", error: error.message });
  }
};

/**
 * @desc Delete files from Uploadthing
 * @route DELETE /api/upload
 * @access Public (or Private, depending on auth middleware)
 * @param {Object} req - Express request object (expects an array of file keys in req.body.fileKeys)
 * @param {Object} res - Express response object
 */
export const deleteFiles = async (req, res) => {
  try {
    const { fileKeys } = req.body;

    if (!fileKeys || !Array.isArray(fileKeys) || fileKeys.length === 0) {
      return res
        .status(400)
        .json({ message: "No file keys provided for deletion." });
    }

    // Call Uploadthing's deleteFiles method with the provided keys
    const response = await utapi.deleteFiles(fileKeys);

    // Log the full response from Uploadthing for debugging
    console.log("Response from Uploadthing delete:", response);

    // Check if the deletion was successful for all files
    // Uploadthing's deleteFiles returns an array of { key: string, status: "success" | "failed" }
    const deletedKeys = response
      .filter((item) => item.status === "success")
      .map((item) => item.key);

    const failedKeys = response
      .filter((item) => item.status === "failed")
      .map((item) => item.key);

    if (deletedKeys.length > 0) {
      res.status(200).json({
        message: `Successfully deleted ${deletedKeys.length} file(s).`,
        deletedKeys: deletedKeys,
        failedKeys: failedKeys.length > 0 ? failedKeys : undefined, // Only include if there were failures
      });
    } else {
      res.status(400).json({
        message: "No files were deleted successfully.",
        failedKeys: failedKeys,
      });
    }
  } catch (error) {
    console.error("Error deleting files from Uploadthing:", error);
    res
      .status(500)
      .json({ message: "Failed to delete files", error: error.message });
  }
};
