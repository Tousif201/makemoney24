import express from "express";
import {
  createFranchise,
  getFranchisesBySalesRep,
} from "../controllers/franchise.controller.js";

const router = express.Router();

// GET /api/hello - Example route with middleware
router.post("/", createFranchise);
router.get("/", getFranchisesBySalesRep);

export default router;
