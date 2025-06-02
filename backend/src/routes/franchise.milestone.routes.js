import express from "express";
import { createFranchiseMilestone , deleteFranchiseMilestone, getAllFranchiseMilestones, updateFranchiseMilestone,getFranchiseMilestoneStats} from "../controllers/franchise.milestone.controller.js"
// import { getFranchiseMilestoneStats } from "../models/FranchiseMilestone.model.js";

const router = express.Router();


router.post("/",createFranchiseMilestone)
router.get("/",getAllFranchiseMilestones)
router.delete("/delete/:milestoneId",deleteFranchiseMilestone)
router.post("/update-franchise-milestone/:milestoneId",updateFranchiseMilestone)
router.get("/franchise-milestone-home",getFranchiseMilestoneStats)

export default router

