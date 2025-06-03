import { getUserEmiHistory, getUserEmiHistoryByUser } from "../controllers/emi.controller.js";
import express from "express";
const router = express.Router();


router.get("history/user/:userId",getUserEmiHistory);
router.get("details/user/:userId",getUserEmiHistoryByUser);

export default router;
