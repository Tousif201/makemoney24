// ============================
// File: controllers/user.controller.js
// ============================
import { User } from "../models/User.model.js";
import { RewardLog } from "../models/RewardLog.model.js";
import { Order } from "../models/Order.model.js";
import { Membership } from "../models/Membership.model.js"; // Import Membership model
import { Transaction } from "../models/Transaction.model.js"; // Import Transaction model
import { MembershipPackages } from "../models/MembershipPackages.model.js";
import mongoose from "mongoose"; // Import mongoose for ObjectId conversion

/**
 * @desc Get comprehensive admin dashboard data with user details, pagination, and search,
 * filtered to only include users with the "user" role.import mongoose from "mongoose"; // Import mongoose for ObjectId conversion

 * @route GET /api/users/admin
 * @access Private (assuming authentication middleware is applied for admin role)
 */
export const getAdminDashboardData = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // --- Global Dashboard Metrics ---

    // Total Users (only counting those with the 'user' role)
    const totalUsers = await User.countDocuments({ roles: "user" });

    // Total Referrals (users who have a referredByCode AND have the 'user' role)
    const totalReferrals = await User.countDocuments({
      referredByCode: { $exists: true, $ne: null },
      roles: "user", // Apply role filter here too
    });

    // Total Referral Earnings (from RewardLog model - this remains global for all users who earned them)
    // If you need earnings *only* for users with the 'user' role, it would require
    // a more complex aggregation involving a $lookup from RewardLog to User.
    // For now, this calculates total referral earnings for *all* users who received them.
    const totalReferralEarningsResult = await RewardLog.aggregate([
      { $match: { type: "ReferralLevelReward" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalReferralEarnings =
      totalReferralEarningsResult.length > 0
        ? totalReferralEarningsResult[0].total
        : 0;

    // --- User List with Details, Pagination, and Search ---

    const userQuery = {
      roles: "user", // <--- ADDED: Filter to include only users with the 'user' role
    };

    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: "i" } }, // Case-insensitive search
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { referralCode: { $regex: search, $options: "i" } },
      ];
      // When combining with $or, if roles needs to be ANDed, structure like this:
      // userQuery.$and = [
      //   { roles: "user" },
      //   {
      //     $or: [
      //       { name: { $regex: search, $options: "i" } },
      //       { email: { $regex: search, $options: "i" } },
      //       { phone: { $regex: search, $options: "i" } },
      //       { referralCode: { $regex: search, $options: "i" } },
      //     ],
      //   },
      // ];
      // However, for single role, Mongoose handles direct property addition well.
      // The current simple `userQuery.roles = "user"` will work correctly with `$or`.
    }

    // Get total count of users matching the search query for pagination
    const totalFilteredUsers = await User.countDocuments(userQuery);

    // Fetch users based on search, with pagination
    const users = await User.find(userQuery)
      .select(
        "name email phone isMember referralCode joinedAt _id accountStatus"
      )
      .sort({ joinedAt: -1 }) // Sort by join date, newest first
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // Use .lean() for performance

    // Process each user to add aggregated data
    const usersWithAggregatedDetails = await Promise.all(
      users.map(async (user) => {
        // Calculate total direct referrals made by this user (these referred users
        // might not necessarily have the 'user' role themselves, unless you apply
        // that filter here too)
        const userTotalReferrals = await User.countDocuments({
          referredByCode: user.referralCode,
          // If you only want to count referrals who are also 'user' role:
          // roles: "user"
        });

        // Calculate total referral earnings for the current user
        const userReferralEarningsResult = await RewardLog.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(user._id),
              type: "ReferralLevelReward",
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        const userReferralEarnings =
          userReferralEarningsResult.length > 0
            ? userReferralEarningsResult[0].total
            : 0;

        // Calculate total amount spent by the current user from completed orders
        const totalSpentResult = await Order.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(user._id),
              paymentStatus: "completed",
            },
          },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]);
        const totalSpent =
          totalSpentResult.length > 0 ? totalSpentResult[0].total : 0;

        return {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          referralCode: user.referralCode,
          membershipStatus: user.isMember ? "Member" : "Non-Member",
          totalReferrals: userTotalReferrals,
          totalReferralEarnings: userReferralEarnings,
          joiningDate: user.joinedAt,
          totalSpent: totalSpent,
          accountStatus: user?.accountStatus,
        };
      })
    );

    res.status(200).json({
      success: true,
      globalMetrics: {
        totalUsers,
        totalReferrals,
        totalReferralEarnings,
      },
      pagination: {
        currentPage: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalFilteredUsers / parseInt(limit)),
        totalResults: totalFilteredUsers,
      },
      users: usersWithAggregatedDetails,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching dashboard data.",
      error: error.message,
    });
  }
};

/**
 * @desc Upgrade a user's status to member and record the membership and transaction.
 * @route POST /api/users/upgrade/:userId
 * @access Private (e.g., Admin or system process after payment confirmation)
 */



/**
 * @desc    Upgrade a user to membership, record transaction & membership,
 *          and distribute referral commissions up to 4 levels.
 * @route   POST /api/users/upgrade/:userId
 * @access  Admin / Private
 */
export const upgradeUser = async (req, res) => {
  const { userId } = req.params;
  const { membershipAmount, cashFreeOrderId, membershipPackageId } = req.body;

  // --- 1. Basic validations ---
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ success: false, message: "Invalid user ID." });
  }
  if (!membershipPackageId || !mongoose.Types.ObjectId.isValid(membershipPackageId)) {
    return res.status(400).json({ success: false, message: "Invalid membershipPackageId." });
  }
  if (typeof membershipAmount !== "number" || membershipAmount <= 0) {
    return res.status(400).json({ success: false, message: "Invalid membership amount." });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // --- 2. Fetch user & package ---
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error("User not found.");
    if (user.isMember) throw new Error("User is already a member.");

    const membershipPackage = await MembershipPackages
      .findById(membershipPackageId)
      .session(session);
    if (!membershipPackage) throw new Error("Membership package not found.");

    // --- 2.a Validate total amount matches package + misc ---
    const expectedTotal = membershipPackage.packageAmount + membershipPackage.miscellaneousAmount;
    if (membershipAmount !== expectedTotal) {
      return res
        .status(400)
        .json({ success: false, message: "membershipAmount must equal packageAmount + miscellaneousAmount." });
    }

    // --- 3. Upgrade user flag ---
    user.isMember = true;
    await user.save({ session });

    // --- 4. Record transaction ---
    const newTransaction = new Transaction({
      userId:            user._id,
      transactionType:   "purchase",
      amount:            membershipAmount,
      description:       `Membership purchase for ${user.email}`,
      status:            "success",
      cashFreeOrderId:   cashFreeOrderId || "Manual_Enrollment",
    });
    await newTransaction.save({ session });

    // --- 5. Create membership with expiry ---
    const purchasedAt = new Date();
    const expiredAt = membershipPackage.validityInDays
      ? new Date(purchasedAt.getTime() + membershipPackage.validityInDays * 24 * 60 * 60 * 1000)
      : null;

    const newMembership = new Membership({
      userId:              user._id,
      amountPaid:          membershipPackage.packageAmount,  // only packageAmount
      transactionId:       newTransaction._id,
      membershipPackageId: membershipPackage._id,
      purchasedAt,
      expiredAt,
    });
    await newMembership.save({ session });

    // --- 6. Distribute referral commissions on packageAmount ---
    const levels = [
      { pct: 0.30 }, // Level 1: 30%
      { pct: 0.10 }, // Level 2: 10%
      { pct: 0.025 },// Level 3: 2.5%
      { pct: 0.025 } // Level 4: 2.5%
    ];
    let currentParentId = user.parent;

    for (let i = 0; i < levels.length && currentParentId; i++) {
      const parentUser = await User.findById(currentParentId).session(session);
      if (!parentUser) break;

      const commission = membershipPackage.packageAmount * levels[i].pct;
      parentUser.withdrawableWallet = (parentUser.withdrawableWallet || 0) + commission;
      parentUser.profileScore  += 20
      await parentUser.save({ session });

      currentParentId = parentUser.parent;
    }

    // --- 7. Commit & respond ---
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "User upgraded and commissions distributed.",
      user: {
        id:       user._id,
        name:     user.name,
        email:    user.email,
        isMember: user.isMember,
      },
      transactionId: newTransaction._id,
      membershipId:  newMembership._id,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("UpgradeUser Error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Membership upgrade failed.",
    });
  }
};


/**
 * @desc Updates a user's account status to a specified value ("active" or "suspended").
 * @route PUT /api/users/update-status/:userId
 * @access Private (Admin only)
 * @param {string} req.params.userId - The ID of the user to update.
 * @param {object} req.body - The request body.
 * @param {string} req.body.status - The desired account status ("active" or "suspended").
 */
export const updateAccountStatus = async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body; // Extract status from request body

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid user ID provided." });
  }

  // Validate the provided status
  if (!status || !["active", "suspended"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status provided. Must be 'active' or 'suspended'.",
    });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Update the account status directly
    user.accountStatus = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account status updated to ${user.accountStatus}.`,
      user: {
        id: user._id,
        email: user.email,
        accountStatus: user.accountStatus,
      },
    });
  } catch (error) {
    console.error("Error updating user account status:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating account status.",
      error: error.message,
    });
  }
};


export const uploadProfileImage = async (req,res)=>{
  try {
    
const {userId, profileImage} = req.body;
const user = await User.findById(userId);
if(!user){
  return res.status(404).json({message:"User not fount",success :false})
}
user.profileImage.key = profileImage.key;
user.profileImage.url = profileImage.url;
await user.save();

res.status(200).json({
  success: true,
  message: "Profile image uploaded successfully.",
  profileImage: user.profileImage
})
  } catch (error) {
    console.error("Error uploading profile imaage :",error);
    res.status(500).json({
      success:false,
      message :`An error occured while uploading profile image :${error.message}`
    })
  }
}
