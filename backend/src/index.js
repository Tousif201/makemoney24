import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // Import cors
import cron from "node-cron";
import { beyonderLogger } from "./utils/logger.js";
import apiRoutes from "./routes/index.js"; // Renamed or clarity
import { connectDB } from "./config/database.js";
import startScoreUpdaterCron from "./cron-jobs/profileScoreUpdater.cron.js";
import startMilestoneRewarderCron from "./cron-jobs/milestoneRewarder.cron.js";
import startProfileScoreRewarderCron from "./cron-jobs/profileScoreRewarder.cron.js";
// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Essential Middlewares ---
// Enable All CORS Requests (configure specific origins in production)
app.use(cors({
  origin: "*", // Allows all origins
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
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
  }).then(() => {
    // --- Start Cron Jobs ---
    startScoreUpdaterCron();
    startProfileScoreRewarderCron();
    startMilestoneRewarderCron(); // Start the new generalized cron job
    console.log('All cron jobs initialized.')})
  .catch((err) => {
    console.error("❌ Failed to start server:", err);
    process.exit(1); // Exit if database connection fails
  });
