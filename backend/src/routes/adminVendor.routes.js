import { vendorDetailsAnalytics,processSettlement,updateProductStatus } from "../controllers/adminVendor.controller.js";
import express from "express";
 const router = express.Router();


 router.get(
  "/vendor-analytics/:vendorId",
  vendorDetailsAnalytics);
//Only authenticated admins should be able to process settlements
router.post('/settlements/vendor/:vendorId',  processSettlement);

// Only authenticated admins should be able to change product approval status
router.patch('/products/:productId/status', updateProductStatus);

  export default router;