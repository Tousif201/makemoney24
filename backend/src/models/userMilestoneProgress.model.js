// models/UserMilestoneProgress.js
import mongoose, { Schema, model } from "mongoose";

const userMilestoneProgressSchema = new Schema(
    {
        userId: { // This will be the Franchise Admin's ID for FranchiseMilestones
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        milestoneDefinitionId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        milestoneType: {
            type: String,
            enum: ['CashbackMilestone', 'membershipMilestone', 'FranchiseMilestone'], // ADDED 'FranchiseMilestone'
            required: true,
        },
        milestoneTargetValue: {
            type: Number,
            required: true,
            min: 0,
        },
        rewardAmountValue: {
            type: Number,
            required: true,
            min: 0,
        },
        timeLimitDaysValue: {
            type: Number,
            required: true,
            min: 0,
        },
        currentAccumulatedValue: {
            type: Number,
            default: 0,
            min: 0,
        },
        trackingPeriodStartDate: {
            type: Date,
            required: true,
        },
        trackingPeriodEndDate: {
            type: Date,
            required: true,
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
        lastDataPointDateProcessed: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

userMilestoneProgressSchema.index({ userId: 1, milestoneDefinitionId: 1, trackingPeriodStartDate: 1 }, { unique: true });
userMilestoneProgressSchema.index({ userId: 1, milestoneType: 1, isCompleted: 1 });
userMilestoneProgressSchema.index({ trackingPeriodEndDate: 1 });

export const UserMilestoneProgress = model("UserMilestoneProgress", userMilestoneProgressSchema);