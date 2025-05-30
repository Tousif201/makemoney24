import express from "express";
import {
  createFranchise,
  getAllFranchises,
  getFranchisesBySalesRep,
} from "../controllers/franchise.controller.js";

const router = express.Router();

// GET /api/hello - Example route with middleware
router.post("/", createFranchise);
router.get("/", getFranchisesBySalesRep);
router.get("/getAll", getAllFranchises);

export default router;
