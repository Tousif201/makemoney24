import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // Import cors
import { beyonderLogger } from "./utils/logger.js";
import apiRoutes from "./routes/index.js"; // Renamed for clarity
import { connectDB } from "./config/database.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Essential Middlewares ---
// Enable All CORS Requests (configure specific origins in production)
app.use(cors());
// Parse JSON request bodies
app.use(express.json());
// Optional: Parse URL-encoded request bodies
// app.use(express.urlencoded({ extended: true }));

// --- API Routes ---
app.use("/api", apiRoutes);

// --- Root Endpoint ---
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the makeMoney24 API! ✨" });
});

// --- Global Error Handler (Example - Implement properly based on needs) ---
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Error:", err.stack || err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
      // Optionally include stack trace in development
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
});

// --- Connect DB and Start Server ---
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      beyonderLogger(); // Log startup message
      console.log(`✅ Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to start server:", err);
    process.exit(1); // Exit if database connection fails
  });
