import express from "express";
import {
  createSalesRep,
  getAllSalesReps,
  deleteSalesRep,
} from "../controllers/salesRep.controller.js";

const router = express.Router();

router.post("/create", createSalesRep);
router.get("/get", getAllSalesReps);
router.delete("/delete/:id", deleteSalesRep);

export default router;
