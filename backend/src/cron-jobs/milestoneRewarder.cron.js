// cronjobs/milestoneRewarder.cron.js
import { User } from '../models/User.model.js';
import { CashbackMilestone } from '../models/CashbackMilestone.model.js';
import { membershipMilestone } from '../models/membershipMilestone.model.js';
import { FranchiseMilestone } from '../models/FranchiseMilestone.model.js';
import { Franchise } from '../models/Franchise.model.js'; // Import Franchise model to get user list
import { Order } from '../models/Order.model.js';
import { Membership } from '../models/Membership.model.js'; // Import Membership model
import { RewardLog } from '../models/RewardLog.model.js';
import { UserMilestoneProgress } from '../models/userMilestoneProgress.model.js';
import cron from 'node-cron';
import mongoose from 'mongoose';

const checkAndAwardMilestones = async () => {
    console.log('Cron job: Starting generalized milestone check...');
    let session;

    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const milestoneTypeDefinitions = [
            {
                name: "CashbackMilestone",
                model: CashbackMilestone,
                rewardLogType: "CashbackMilestone",
                targetWallet: "purchaseWallet", // Specify target wallet for this milestone type
                getData: async (userId, periodStart, periodEnd, lastProcessedDate, session) => {
                    const queryConditions = {
                        userId: userId,
                        orderStatus: 'delivered',
                        paymentStatus: 'completed',
                        createdAt: {
                            $gte: lastProcessedDate || periodStart,
                            $lte: periodEnd
                        }
                    };
                    const result = await Order.aggregate([
                        { $match: queryConditions },
                        { $group: { _id: null, totalAmount: { $sum: '$totalAmount' } } }
                    ]).session(session);
                    return result.length > 0 ? { value: result[0].totalAmount, latestDate: queryConditions.createdAt.$lte } : { value: 0, latestDate: null };
                },
            },
            {
                name: "membershipMilestone",
                model: membershipMilestone,
                rewardLogType: "membershipMilestone",
                targetWallet: "withdrawableWallet", // Specify target wallet for this milestone type
                getData: async (userId, periodStart, periodEnd, lastProcessedDate, session) => {
                    const newMemberships = await Membership.aggregate([
                        {
                            $match: {
                                purchasedAt: {
                                    $gte: lastProcessedDate || periodStart,
                                    $lte: periodEnd
                                },
                                paymentStatus: 'completed'
                            }
                        },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'userId',
                                foreignField: '_id',
                                as: 'referredUser'
                            }
                        },
                        { $unwind: '$referredUser' },
                        {
                            $match: {
                                'referredUser.parent': userId,
                                'referredUser.isMember': true
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                count: { $sum: 1 },
                                latestDate: { $max: '$purchasedAt' }
                            }
                        }
                    ]).session(session);
                    return newMemberships.length > 0 ? { value: newMemberships[0].count, latestDate: newMemberships[0].latestDate } : { value: 0, latestDate: null };
                },
            },
            {
                name: "FranchiseMilestone",
                model: FranchiseMilestone,
                rewardLogType: "FranchiseMilestone",
                targetWallet: "withdrawableWallet", // Specify target wallet for this milestone type
                getData: async (franchiseAdminId, periodStart, periodEnd, lastProcessedDate, session) => {
                    const franchise = await Franchise.findOne({ ownerId: franchiseAdminId }).select('users').session(session);
                    if (!franchise || franchise.users.length === 0) {
                        return { value: 0, latestDate: null };
                    }
                    const franchiseUserIds = franchise.users;

                    let totalAccumulatedAmount = 0;
                    let latestDateAcrossAllData = null;

                    const orderQueryConditions = {
                        userId: { $in: franchiseUserIds },
                        orderStatus: 'delivered',
                        paymentStatus: 'completed',
                        createdAt: {
                            $gte: lastProcessedDate || periodStart,
                            $lte: periodEnd
                        }
                    };
                    const ordersResult = await Order.aggregate([
                        { $match: orderQueryConditions },
                        { $group: { _id: null, totalOrdersAmount: { $sum: '$totalAmount' }, latestOrderDate: { $max: '$createdAt' } } }
                    ]).session(session);

                    if (ordersResult.length > 0) {
                        totalAccumulatedAmount += ordersResult[0].totalOrdersAmount;
                        if (ordersResult[0].latestOrderDate && (!latestDateAcrossAllData || ordersResult[0].latestOrderDate > latestDateAcrossAllData)) {
                            latestDateAcrossAllData = ordersResult[0].latestOrderDate;
                        }
                    }

                    const membershipQueryConditions = {
                        userId: { $in: franchiseUserIds },
                        paymentStatus: 'completed',
                        purchasedAt: {
                            $gte: lastProcessedDate || periodStart,
                            $lte: periodEnd
                        }
                    };
                    const membershipsResult = await Membership.aggregate([
                        { $match: membershipQueryConditions },
                        { $group: { _id: null, totalMembershipAmount: { $sum: '$amount' }, latestMembershipDate: { $max: '$purchasedAt' } } }
                    ]).session(session);

                    if (membershipsResult.length > 0) {
                        totalAccumulatedAmount += membershipsResult[0].totalMembershipAmount;
                        if (membershipsResult[0].latestMembershipDate && (!latestDateAcrossAllData || membershipsResult[0].latestMembershipDate > latestDateAcrossAllData)) {
                            latestDateAcrossAllData = membershipsResult[0].latestMembershipDate;
                        }
                    }
                    return { value: totalAccumulatedAmount, latestDate: latestDateAcrossAllData };
                },
            },
        ];

        const allUsers = await User.find({}).select('_id email purchaseWallet withdrawableWallet joinedAt');

        for (const user of allUsers) {
            for (const milestoneTypeDef of milestoneTypeDefinitions) {
                const MilestoneDefModel = milestoneTypeDef.model;
                const rewardLogType = milestoneTypeDef.rewardLogType;
                const targetWalletField = milestoneTypeDef.targetWallet; // Get the target wallet field
                const getDataFunction = milestoneTypeDef.getData;

                let targetUserId = user._id;

                if (milestoneTypeDef.name === "FranchiseMilestone") {
                    const isFranchiseAdmin = await Franchise.exists({ ownerId: user._id }).session(session);
                    if (!isFranchiseAdmin) {
                        continue;
                    }
                }

                const activeMilestones = await MilestoneDefModel.find({ status: 'active' }).sort({ milestone: 1 });

                for (const milestoneDef of activeMilestones) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    let userProgress = await UserMilestoneProgress.findOne(
                        {
                            userId: targetUserId,
                            milestoneDefinitionId: milestoneDef._id,
                            milestoneType: milestoneTypeDef.name,
                            isCompleted: false,
                        },
                        null,
                        { sort: { trackingPeriodEndDate: -1 }, session }
                    );

                    let currentPeriodStartDate;
                    let currentPeriodEndDate;

                    if (userProgress) {
                        currentPeriodStartDate = userProgress.trackingPeriodStartDate;
                        currentPeriodEndDate = userProgress.trackingPeriodEndDate;
                        console.log(`User ${user.email} (${milestoneTypeDef.name} ID: ${milestoneDef.milestoneId}): Continuing existing progress period.`);
                    } else {
                        const lastCompletedProgress = await UserMilestoneProgress.findOne(
                            {
                                userId: targetUserId,
                                milestoneDefinitionId: milestoneDef._id,
                                milestoneType: milestoneTypeDef.name,
                                isCompleted: true,
                            },
                            null,
                            { sort: { trackingPeriodEndDate: -1 }, session }
                        );

                        if (milestoneDef.timeLimitDays === 0) {
                            currentPeriodStartDate = new Date('2000-01-01T00:00:00.000Z');
                            currentPeriodEndDate = new Date('2099-12-31T23:59:59.999Z');
                        } else {
                            if (lastCompletedProgress) {
                                currentPeriodStartDate = new Date(lastCompletedProgress.trackingPeriodEndDate);
                                currentPeriodStartDate.setDate(currentPeriodStartDate.getDate() + 1);
                                currentPeriodStartDate.setHours(0, 0, 0, 0);
                            } else {
                                currentPeriodStartDate = new Date(user.joinedAt || today);
                                currentPeriodStartDate.setHours(0, 0, 0, 0);
                            }
                            currentPeriodEndDate = new Date(currentPeriodStartDate);
                            currentPeriodEndDate.setDate(currentPeriodEndDate.getDate() + milestoneDef.timeLimitDays);
                            currentPeriodEndDate.setHours(23, 59, 59, 999);
                        }

                        userProgress = new UserMilestoneProgress({
                            userId: targetUserId,
                            milestoneDefinitionId: milestoneDef._id,
                            milestoneType: milestoneTypeDef.name,
                            milestoneTargetValue: milestoneDef.milestone,
                            rewardAmountValue: milestoneDef.rewardAmount,
                            timeLimitDaysValue: milestoneDef.timeLimitDays,
                            trackingPeriodStartDate: currentPeriodStartDate,
                            trackingPeriodEndDate: currentPeriodEndDate,
                            currentAccumulatedValue: 0,
                            lastDataPointDateProcessed: null,
                            isCompleted: false,
                        });
                        await userProgress.save({ session });
                        console.log(`User ${user.email} (${milestoneTypeDef.name} ID: ${milestoneDef.milestoneId}): Created new progress record for period starting ${currentPeriodStartDate.toISOString().split('T')[0]}.`);
                    }

                    if (today > userProgress.trackingPeriodEndDate && !userProgress.isCompleted) {
                        console.log(`User ${user.email} (${milestoneTypeDef.name} ID: ${milestoneDef.milestoneId}): Period has ended (${userProgress.trackingPeriodEndDate.toISOString().split('T')[0]}) and milestone not completed. Skipping.`);
                        continue;
                    }
                    if (userProgress.trackingPeriodStartDate > today && userProgress.timeLimitDaysValue > 0) {
                         console.log(`User ${user.email} (${milestoneTypeDef.name} ID: ${milestoneDef.milestoneId}): Period starts in future (${userProgress.trackingPeriodStartDate.toISOString().split('T')[0]}). Skipping.`);
                         continue;
                    }

                    const { value: newAccumulatedValue, latestDate: newLatestDate } = await getDataFunction(
                        targetUserId,
                        userProgress.trackingPeriodStartDate,
                        today,
                        userProgress.lastDataPointDateProcessed,
                        session
                    );

                    if (newAccumulatedValue > 0 || newLatestDate) {
                        userProgress.currentAccumulatedValue += newAccumulatedValue;
                        if (newLatestDate) {
                           userProgress.lastDataPointDateProcessed = newLatestDate;
                        }
                        await userProgress.save({ session });
                        console.log(`User ${user.email} (${milestoneTypeDef.name} ID: ${milestoneDef.milestoneId}): Current accumulated value: ${userProgress.currentAccumulatedValue}.`);
                    } else {
                        console.log(`User ${user.email} (${milestoneTypeDef.name} ID: ${milestoneDef.milestoneId}): No new data points since last check. Current value: ${userProgress.currentAccumulatedValue}.`);
                    }

                    if (userProgress.currentAccumulatedValue >= userProgress.milestoneTargetValue && !userProgress.isCompleted) {
                        // Deposit reward into the specified wallet
                        user[targetWalletField] += userProgress.rewardAmountValue;
                        await user.save({ session });

                        // Create RewardLog entry
                        const rewardLog = new RewardLog({
                            userId: targetUserId,
                            type: rewardLogType,
                            amount: userProgress.rewardAmountValue,
                        });
                        await rewardLog.save({ session });

                        userProgress.isCompleted = true;
                        await userProgress.save({ session });

                        console.log(`Awarded ₹${userProgress.rewardAmountValue} to user ${user.email}'s ${targetWalletField} for completing ${milestoneTypeDef.name} "${milestoneDef.name}" (Target: ${userProgress.milestoneTargetValue}) in period starting ${userProgress.trackingPeriodStartDate.toISOString().split('T')[0]}.`);
                    }
                }
            }
        }

        await session.commitTransaction();
        console.log('Cron job: Generalized milestone check completed.');

    } catch (error) {
        if (session) await session.abortTransaction();
        console.error('Cron job error checking generalized milestones:', error);
    } finally {
        if (session) session.endSession();
    }
};

const startMilestoneRewarderCron = () => {
    cron.schedule('0 4 * * *', () => {
        console.log('Running the daily generalized milestone rewarder cron job...');
        checkAndAwardMilestones();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
    console.log('Generalized milestone rewarder cron job scheduled.');
};

export default startMilestoneRewarderCron;