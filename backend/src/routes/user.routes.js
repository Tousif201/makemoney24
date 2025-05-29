import express from "express";
import { getAdminDashboardData } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/admin", getAdminDashboardData);

export default router;
