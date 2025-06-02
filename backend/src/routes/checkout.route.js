import express from "express";
import { handleCheckout } from "../controllers/checkout.controller.js";

const router = express.Router();

router.post("/handle-checkout", handleCheckout);

export default router;
