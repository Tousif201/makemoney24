// cronjobs/profileScoreRewarder.cron.js
import { User } from '../models/User.model.js';       // Adjust path as needed
import { RewardLog } from '../models/RewardLog.model.js'; // Import the RewardLog model
import cron from 'node-cron';
import mongoose from 'mongoose'; // Import mongoose for session/transaction

const REWARD_AMOUNT = 1000;
const MILESTONE_INTERVAL = 3500; // Reward every 3500 points

const awardProfileScoreRewards = async () => {
    console.log('Cron job: Starting recurring profile score reward check...');

    // We'll iterate through users and determine their next eligible milestone.
    // Fetch users with profileScore > 0, as only users with scores can hit milestones.
    const eligibleUsers = await User.find({ profileScore: { $gt: 0 } });

    if (eligibleUsers.length === 0) {
        console.log('Cron job: No eligible users with profile scores found today.');
        return;
    }

    console.log(`Cron job: Found ${eligibleUsers.length} users to check for rewards.`);

    for (const user of eligibleUsers) {
        let session;
        try {
            session = await mongoose.startSession();
            session.startTransaction();

            const currentScore = user.profileScore;

            // Find the highest 'ProfileScoreAchievementReward' already awarded to this user
            const lastRewardLog = await RewardLog.findOne(
                { userId: user._id, type: "ProfileScoreAchievementReward" },
                null,
                { sort: { createdAt: -1 }, session } // Sort to get the most recent, use session
            );

            let lastAwardedMilestone = 0;
            if (lastRewardLog) {
                // Calculate the milestone from the amount rewarded.
                // Assuming amount is always REWARD_AMOUNT (1000) for these rewards.
                // If amount could vary, you'd need to store the milestone itself in RewardLog.
                // A safer approach: store 'milestoneAchieved: Number' in RewardLog schema.
                // For now, assuming fixed REWARD_AMOUNT and milestone calculation from it.
                // Let's deduce the milestone from `lastRewardLog.amount` if that were the actual milestone
                // However, given it's a fixed amount, it's safer to just track the *number of times* awarded
                // or the *actual score* at which it was awarded.

                // Alternative: If you want to log *which milestone* was achieved,
                // you'd add a `milestoneValue: Number` field to your RewardLog schema.
                // For now, we'll determine it dynamically.

                // If a reward was given, assume the user reached at least MILESTONE_INTERVAL points
                // to get that reward. The 'lastAwardedMilestone' should represent the *highest score*
                // at which they last received this type of reward.
                // This requires a more direct tracking of the achieved milestone.

                // Let's assume a simpler check: how many times have they received this specific reward?
                const rewardsCount = await RewardLog.countDocuments({
                    userId: user._id,
                    type: "ProfileScoreAchievementReward"
                }, { session });

                lastAwardedMilestone = rewardsCount * MILESTONE_INTERVAL;
            }

            // Calculate the next target milestone
            let nextMilestone = lastAwardedMilestone + MILESTONE_INTERVAL;
            if (nextMilestone === 0) { // Special case for first milestone if lastAwardedMilestone is 0 initially
                nextMilestone = MILESTONE_INTERVAL;
            }

            // Check if the user has reached or surpassed the next eligible milestone
            if (currentScore >= nextMilestone) {
                // Determine how many milestones the user has passed in this run
                // E.g., if last was 3500, and current is 9000, they passed 7000.
                let milestonesToAward = 0;
                while (currentScore >= nextMilestone) {
                    milestonesToAward++;
                    nextMilestone += MILESTONE_INTERVAL;
                }
                // Subtract the last added MILESTONE_INTERVAL to get the actual next target for the loop
                nextMilestone -= MILESTONE_INTERVAL; // This is the milestone they just crossed (e.g., 7000 if current was 9000)

                const totalAmountToAward = milestonesToAward * REWARD_AMOUNT;

                // 1. Update user's withdrawable wallet
                user.withdrawableWallet += totalAmountToAward;
                await user.save({ session }); // Pass session to save

                // 2. Create a RewardLog entry for each milestone crossed
                for (let i = 0; i < milestonesToAward; i++) {
                    const rewardedMilestone = lastAwardedMilestone + (i + 1) * MILESTONE_INTERVAL;
                    const rewardLog = new RewardLog({
                        userId: user._id,
                        type: "ProfileScoreAchievementReward",
                        amount: REWARD_AMOUNT,
                        // Optionally add a field to RewardLog: `milestoneAchieved: rewardedMilestone`
                    });
                    await rewardLog.save({ session }); // Pass session to save
                    console.log(`Awarded ₹${REWARD_AMOUNT} to user ${user.email} for hitting profile score milestone ${rewardedMilestone}.`);
                }
            } else {
                console.log(`User ${user.email} (score: ${currentScore}) not yet at next milestone (${nextMilestone}). Skipping.`);
            }

            await session.commitTransaction(); // Commit the transaction
        } catch (error) {
            if (session) await session.abortTransaction(); // Abort on error
            console.error(`Cron job error processing user ${user.email}:`, error);
        } finally {
            if (session) session.endSession(); // End the session
        }
    }
    console.log('Cron job: Recurring profile score reward check completed.');
};

// Schedule the cron job to run daily at a specific time (e.g., 3 AM IST)
// Consider running this *after* the score updater cron job.
const startProfileScoreRewarderCron = () => {
    cron.schedule('0 3 * * *', () => { // At 03:00 AM every day
        console.log('Running the daily profile score rewarder cron job...');
        awardProfileScoreRewards();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata" // Set your timezone here
    });
    console.log('Profile score rewarder cron job scheduled.');
};

export default startProfileScoreRewarderCron;