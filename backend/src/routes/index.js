import express from "express";
import helloRouter from "./hello.route.js";
import authRouter from "./auth.routes.js";
import vendorsRouter from "./vendor.routes.js";
import vendorAvailablityRouter from "./vendorAvailability.routes.js";
const router = express.Router();

// Mount the routers
router.use("/hello", helloRouter);
router.use("/auth", authRouter);
router.use("/vendors", vendorsRouter);
router.use("/vendor-availability", vendorAvailablityRouter);

// router.use("/users", userRouter);

export default router;
