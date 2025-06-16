// controllers/referral.controller.js (or a new file for referral logic)

import { User } from "../models/User.model.js";
import { Membership } from "../models/Membership.model.js";
import mongoose from "mongoose";

export const getReferralLevelData = async (req, res) => {
  const { userId } = req.query; // The main user whose referral levels we want to fetch

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required as a query parameter.",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid User ID format.",
    });
  }

  try {
    const parentUserId = new mongoose.Types.ObjectId(userId);
    const levelData = {};
    const maxLevels = 4; // As per your dummy data
    const commissionRates = {
      // Static commission rates as per your dummy data
      level1: "30%",
      level2: "10%",
      level3: "2.5%",
      level4: "2.5%",
    };

    // To store users at each level, mapped by their _id for efficient lookup
    const usersAtEachLevel = {
      0: [parentUserId.toString()], // Start with the main user at level 0 (for internal tracking)
    };
    // To store users at each level in the format required for output
    const outputLevelUsers = {};

    for (let level = 1; level <= maxLevels; level++) {
      const currentLevelParents = usersAtEachLevel[level - 1];
      if (currentLevelParents.length === 0) {
        // No users at the previous level, so no more referrals to find
        break;
      }

      // Find users whose parent is in the currentLevelParents list
      const nextLevelUsers = await User.find({
        parent: {
          $in: currentLevelParents.map((id) => new mongoose.Types.ObjectId(id)),
        },
        // Optionally, add a filter for active users if you have an 'isActive' field
        // isActive: true
      })
        .select("name joinedAt _id") // Select only necessary fields
        .lean();

      if (nextLevelUsers.length === 0) {
        break; // No users found for this level, stop
      }

      // Store users for the next iteration
      usersAtEachLevel[level] = nextLevelUsers.map((user) =>
        user._id.toString()
      );

      // Fetch membership data for these users to calculate their revenue
      const nextLevelUserIds = nextLevelUsers.map((user) => user._id);
      const memberships = await Membership.find({
        userId: { $in: nextLevelUserIds },
      }).lean();

      // Create a map for quick membership lookup by userId
      const membershipMap = new Map();
      memberships.forEach((membership) => {
        const userIdStr = membership.userId.toString();
        if (!membershipMap.has(userIdStr)) {
          membershipMap.set(userIdStr, []);
        }
        membershipMap.get(userIdStr).push(membership);
      });

      // Format users for the output
      outputLevelUsers[`level${level}`] = [];
      nextLevelUsers.forEach((user) => {
        const userMemberships = membershipMap.get(user._id.toString()) || [];
        // Sum amountPaid for all memberships of this user
        const totalRevenue = userMemberships.reduce(
          (sum, m) => sum + m.amountPaid,
          0
        );

        outputLevelUsers[`level${level}`].push({
          name: user.name,
          joinDate: user.joinedAt
            ? user.joinedAt.toISOString().split("T")[0]
            : "N/A", // Format date to YYYY-MM-DD
          // If a user has no membership, their revenue is 0
          revenue: `₹${totalRevenue.toLocaleString()}`,
          // Assuming 'Active' if they exist in the referral tree and optionally have membership
          status: totalRevenue > 0 ? "Active" : "Inactive (No Revenue)", // More realistic status based on revenue
        });
      });

      // Assign to levelData
      levelData[`level${level}`] = {
        commission: commissionRates[`level${level}`] || "0%",
        users: outputLevelUsers[`level${level}`],
      };
    }

    return res.status(200).json({
      success: true,
      data: levelData,
    });
  } catch (error) {
    console.error("Error fetching referral level data:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
