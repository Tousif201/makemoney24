import express from "express";
import helloRouter from "./hello.route.js";
import authRouter from "./auth.routes.js";
import vendorsRouter from "./vendor.routes.js";
import vendorAvailablityRouter from "./vendorAvailability.routes.js";
import reviewRoutes from "./review.routes.js";
import uploadRoutes from "./upload.routes.js";
import categoriesRoutes from "./category.routes.js";
import productServicesRoutes from "./productService.routes.js";
import bannerRoutes from "./banner.routes.js";
import bookingRouter from "./booking.routes.js";
import ordersRouter from "./order.routes.js";
import franchiseRoutes from "./Franchise.routes.js";
import analyticsRouter from "./analytics.routes.js";
import transactionRouter from "./transaction.routes.js";
import userRouter from "./user.routes.js";
const router = express.Router();

// Mount the routers
router.use("/hello", helloRouter);
router.use("/auth", authRouter);
router.use("/vendors", vendorsRouter);
router.use("/vendor-availability", vendorAvailablityRouter);
router.use("/reviews", reviewRoutes);
router.use("/uploadFiles", uploadRoutes);
router.use("/categories", categoriesRoutes);
router.use("/product-services", productServicesRoutes);
router.use("/banners", bannerRoutes);
router.use("/bookings", bookingRouter);
router.use("/orders", ordersRouter);
router.use("/franchises", franchiseRoutes);
router.use("/analytics", analyticsRouter);
router.use("/transactions", transactionRouter);
router.use("/users", userRouter);

export default router;
