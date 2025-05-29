import express from "express";
import { adminMembershipReport } from "../controllers/membership.contoroller.js";

const router = express.Router();

router.get("/adminMembershipReport", adminMembershipReport);

export default router;
