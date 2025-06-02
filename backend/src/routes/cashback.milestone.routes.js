import express from "express";
import { createCashbackMilestone , deleteCashbackMilestone, getAllCashbackMilestones, updateCashbackMilestone,getCashbackMilestoneStats} from "../controllers/cashback.milestone.controller.js"
// import { getCashbackMilestoneStats } from "../models/CashbackMilestone.model.js";

const router = express.Router();


router.post("/",createCashbackMilestone)
router.get("/",getAllCashbackMilestones)
router.delete("/delete/:milestoneId",deleteCashbackMilestone)
router.put("/update-cashback-milestone/:id",updateCashbackMilestone)
router.get("/cashback-milestone-home",getCashbackMilestoneStats)

export default router

