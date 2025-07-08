import { getAffiliateRequests,affiliateRequest } from "../controllers/affiliateRequest.controller.js";
import express from "express";
const router = express.Router();
import { protect } from "../middlewares/auth.middleware.js";



router.post("/create-request", protect, affiliateRequest)
router.get("/get-request",  getAffiliateRequests)

export default router;