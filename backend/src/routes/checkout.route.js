import express from "express";
import { handleEmiCheckout,handleOnlinePaymentCheckout } from "../controllers/checkout.controller.js";

const router = express.Router();

router.post("/handle-online-checkout", handleOnlinePaymentCheckout);
router.post("/handle-emi-checkout", handleEmiCheckout);

export default router;
