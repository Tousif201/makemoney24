import express from "express";
import { getUserLocationController } from "../controllers/location.controller.js";

const router = express.Router();

// GET /api/location?lat=xx&lon=yy
router.get("/", getUserLocationController);

export default router;
