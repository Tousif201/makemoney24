// index.js
import express from "express";
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from "dotenv";
import cors from "cors";
import cron from "node-cron";
import { beyonderLogger } from "./utils/logger.js";
import apiRoutes from "./routes/index.js";
import { connectDB } from "./config/database.js";
import startScoreUpdaterCron from "./cron-jobs/profileScoreUpdater.cron.js";
import startMilestoneRewarderCron from "./cron-jobs/milestoneRewarder.cron.js";
import startProfileScoreRewarderCron from "./cron-jobs/profileScoreRewarder.cron.js";
import setupTicketSocketEvents from './sockets/tickets.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Create HTTP server ---
const httpServer = createServer(app);

// --- Configure Socket.IO ---
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allows all origins (Note: If using credentials, configure properly below)
    methods: ["GET", "POST"],
    credentials: true
  }
});

// --- Setup Socket Events ---
setupTicketSocketEvents(io);

// --- Middleware: CORS ---
app.use(cors({
  origin: (origin, callback) => callback(null, true), // Allow all origins dynamically
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// --- Middleware: JSON Parser ---
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// --- API Routes ---
app.use("/api", apiRoutes);

// --- Root Route ---
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

// --- Connect to DB and Start Server ---
connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      beyonderLogger();
      console.log(`✅ Server listening on http://localhost:${PORT}`);
      console.log(`✅ Socket.IO server running on ws://localhost:${PORT}`);
    });
  })
  .then(() => {
    // --- Start Cron Jobs ---
    startScoreUpdaterCron();
    startProfileScoreRewarderCron();
    startMilestoneRewarderCron();
    console.log('All cron jobs initialized.');
  })
  .catch((err) => {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  });
