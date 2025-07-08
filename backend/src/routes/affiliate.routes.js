import { getAffiliateRequests,affiliateRequest } from "../controllers/affiliateRequest.controller";
import express from "express";
const router = express.Router();
import { protect } from "../middlewares/auth.middleware";



router.post("/create-request", protect, affiliateRequest)
router.post("/get-request",  getAffiliateRequests)