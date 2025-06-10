import express from "express";
import {
  createMembershipPackage,
  updateMembershipPackage,
//   deleteMembershipPackage,
  getMembershipPackagesWithStats
} from "../controllers/membership.packages.controller.js";

const router = express.Router();

/**
 * @route POST /api/membership-packages/create
 * @desc  Create a new membership package
 */
router.post("/create", createMembershipPackage);

/**
 * @route PUT /api/membership-packages/update/:id
 * @desc  Update an existing membership package
 */
router.put("/update/:packageId", updateMembershipPackage);

/**
 * @route DELETE /api/membership-packages/delete/:id
 * @desc  Delete a membership package
 */
// router.delete("/delete/:id", deleteMembershipPackage);


router.get("/stats", getMembershipPackagesWithStats);

export default router;
