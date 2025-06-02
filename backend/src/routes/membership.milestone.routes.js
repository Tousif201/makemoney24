import express from "express";
import { createMembershipMilestone , deleteMembershipMilestone, getAllMembershipMilestones, updateMembershipMilestone,getMembershipMilestoneStats} from "../controllers/membership.milestone.controller.js"
// import { getmembershipMilestoneStats } from "../models/membershipMilestone.model.js";

const router = express.Router()


router.post("/",createMembershipMilestone)
router.get("/",getAllMembershipMilestones)
router.delete("/delete/:id",deleteMembershipMilestone)
router.put("/update-membership-milestone/:id",updateMembershipMilestone)
router.get("/membership-milestone-home",getMembershipMilestoneStats)

export default router

