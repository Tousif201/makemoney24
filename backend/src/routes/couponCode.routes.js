// routes/coupon.routes.js
import express from "express";
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponCode.controller.js";

const router = express.Router();

router.post("/", createCoupon);
router.get("/", getAllCoupons);
router.get("/:id", getCouponById);
router.put("/update/:id", updateCoupon);
router.delete("/delete/:id", deleteCoupon);

export default router;
