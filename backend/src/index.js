// index.js
import express from "express";
import { createServer } from 'http'; // Import createServer
import { Server } from 'socket.io'; // Import Server from socket.io
import dotenv from "dotenv";
import cors from "cors";
import cron from "node-cron";
import { beyonderLogger } from "./utils/logger.js";
import apiRoutes from "./routes/index.js";
import { connectDB } from "./config/database.js";
import startScoreUpdaterCron from "./cron-jobs/profileScoreUpdater.cron.js";
import startMilestoneRewarderCron from "./cron-jobs/milestoneRewarder.cron.js";
import startProfileScoreRewarderCron from "./cron-jobs/profileScoreRewarder.cron.js";

// Import your new socket handler
import setupTicketSocketEvents from './sockets/tickets.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Create an HTTP server from your Express app
const httpServer = createServer(app);

// Configure Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*", // Adjust this to your frontend URL in production
    methods: ["GET", "POST"],
    credentials: true // Allow sending cookies/auth headers if needed
  }
});

// Setup Socket.IO event handlers for tickets
setupTicketSocketEvents(io);

// --- Essential Middlewares ---
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*", // Ensure this matches your frontend URL for REST API
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// --- API Routes ---
app.use("/api", apiRoutes);

// --- Root Endpoint ---
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the makeMoney24 API! ✨" });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Error:", err.stack || err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
});

// --- Connect DB and Start Server ---
connectDB()
  .then(() => {
    // Listen with httpServer, not app, so Socket.IO can use the same server
    httpServer.listen(PORT, () => {
      beyonderLogger();
      console.log(`✅ Server listening on http://localhost:${PORT}`);
      console.log(`✅ Socket.IO server running on ws://localhost:${PORT}`);
    });
  }).then(() => {
    // --- Start Cron Jobs ---
    startScoreUpdaterCron();
    startProfileScoreRewarderCron();
    startMilestoneRewarderCron();
    console.log('All cron jobs initialized.')
  })
  .catch((err) => {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  });
