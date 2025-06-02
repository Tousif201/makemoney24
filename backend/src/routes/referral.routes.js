import express from "express";
import { getReferralLevelData } from "../controllers/referral.controller.js";

const router = express.Router();

router.get("/getreferralLevelData", getReferralLevelData);

export default router;
