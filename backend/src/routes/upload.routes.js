// ============================
// File: routes/upload.routes.js
// ============================
import express from "express";
import multer from "multer";
import { deleteFiles, uploadFiles } from "../controllers/upload.controller.js"; // Import the new upload controller

const router = express.Router();

// Configure Multer for memory storage
const storage = multer.memoryStorage(); // Files will be stored in memory as buffers
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit (adjust as needed)
    files: 5, // Max 5 files per upload request
  },
  fileFilter: (req, file, cb) => {
    // Accept images and videos only
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed!"), false);
    }
  },
});

router.post("/upload", upload.array("files"), uploadFiles);
router.post("/delete", deleteFiles);
export default router;
