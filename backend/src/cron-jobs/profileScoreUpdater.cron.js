// cronjobs/scoreUpdater.cron.js
import { User } from '../models/User.model.js';       // Adjust path as needed
import { Membership } from '../models/Membership.model.js'; // Import the Membership model
import cron from 'node-cron';

// Function to update profile scores
const updateMemberProfileScores = async () => {
    try {
        console.log('Cron job: Starting profile score update for members...');

        // Calculate the date 4 days ago from today
        const fourDaysAgo = new Date();
        fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

        // Find users who are members and whose profileScore is less than 500
        // We'll then check their membership purchase date
        const membersToUpdate = await User.find({
            isMember: true,
            profileScore: { $lt: 500 }
        });

        if (membersToUpdate.length === 0) {
            console.log('Cron job: No members found to update today.');
            return;
        }

        console.log(`Cron job: Found ${membersToUpdate.length} potential members to update.`);

        for (const user of membersToUpdate) {
            // Find the membership record for this user
            const membership = await Membership.findOne({
                userId: user._id,
                purchasedAt: { $gte: fourDaysAgo } // Membership purchased within the last 4 days
            });

            // If no recent membership found, or membership is older than 4 days, skip
            if (!membership) {
                console.log(`User ${user.email} is a member but no recent membership purchase found or it's older than 4 days. Skipping.`);
                continue;
            }

            let newScore = user.profileScore;
            const remainingScore = 500 - user.profileScore;

            // Calculate how many days have passed since the membership purchase
            const becameMemberAt = membership.purchasedAt;
            const daysSinceMember = Math.floor((new Date() - becameMemberAt) / (1000 * 60 * 60 * 24));

            // Determine a target increase for today, ensuring it doesn't exceed 500
            let increment = 0;
            if (remainingScore > 0) {
                if (daysSinceMember <= 1) { // 0-1 day passed since purchase
                    increment = Math.floor(Math.random() * (200 - 100 + 1)) + 100;
                } else if (daysSinceMember <= 2) { // 2-3 days passed
                    increment = Math.floor(Math.random() * (150 - 50 + 1)) + 50;
                } else { // 3-4 days passed, aim to finish
                    increment = Math.floor(Math.random() * (100 - 20 + 1)) + 20;
                }

                newScore = Math.min(user.profileScore + increment, 500);
            }

            if (newScore !== user.profileScore) {
                user.profileScore = newScore;
                await user.save();
                console.log(`Updated user ${user.email} profileScore to: ${user.profileScore}`);
            } else {
                console.log(`User ${user.email} profileScore already at 500 or no change needed.`);
            }
        }
        console.log('Cron job: Profile score update completed.');

    } catch (error) {
        console.error('Cron job error updating profile scores:', error);
    }
};

// Schedule the cron job to run daily at a specific time (e.g., 2 AM)
// The cron string '0 2 * * *' means:
// 0   -> Minute (at minute 0)
// 2   -> Hour (at hour 2 - 2 AM)
// * -> Day of month (every day)
// * -> Month (every month)
// * -> Day of week (every day of the week)
const startScoreUpdaterCron = () => {
    cron.schedule('0 2 * * *', () => {
        console.log('Running the daily member profile score update cron job...');
        updateMemberProfileScores();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata" // Set your timezone here (e.g., "Asia/Kolkata" for India)
    });
    console.log('Member profile score update cron job scheduled.');
};

export default startScoreUpdaterCron;