import express from "express";
import { adminMembershipReport, getUserMembershipDetails } from "../controllers/membership.contoroller.js";
import { protect} from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/adminMembershipReport", adminMembershipReport);
router.get("/user-membership-details",protect ,getUserMembershipDetails);

export default router;
