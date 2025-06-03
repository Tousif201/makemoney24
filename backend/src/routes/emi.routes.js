import { getUserEmiHistory } from "../controllers/emi.controller.js";
import express from "express";
const router = express.Router();


router.get("history/user/:userId",getUserEmiHistory);

export default router;
