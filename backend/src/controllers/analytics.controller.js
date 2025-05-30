import { User } from "../models/User.model.js"; // Adjust path as needed
import { Vendor } from "../models/Vendor.model.js"; // Adjust path as needed
import { Franchise } from "../models/Franchise.model.js"; // Adjust path as needed
import { Order } from "../models/Order.model.js";
import { RewardLog } from "../models/RewardLog.model.js";
import mongoose from "mongoose";

/**
 * @desc Get dashboard analytics data for a sales representative's home page
 * @route GET /api/salesrep/dashboard/analytics
 * @access Private/Sales-Rep
 */
export const getSalesRepDashHomeAnalytics = async (req, res) => {
  const { salesRepId } = req.query;

  // --- 1. Basic Validation ---
  if (!salesRepId) {
    return res
      .status(400)
      .json({ message: "Sales representative ID is required." });
  }

  try {
    // --- 2. Validate Sales Representative User ---
    const salesRepUser = await User.findById(salesRepId);
    if (!salesRepUser || !salesRepUser.roles.includes("sales-rep")) {
      return res
        .status(404)
        .json({ message: "Sales representative not found or invalid ID." });
    }

    // --- 3. Calculate Monthly Timeframe ---
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month

    const startOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Start of the week (Sunday for consistency)
    const startOfWeek = new Date(now); // Clone current date
    startOfWeek.setDate(now.getDate() - now.getDay()); // Get Sunday of current week
    startOfWeek.setHours(0, 0, 0, 0); // Set to start of day

    // --- 4. Fetch Data ---

    // Total Vendors under this sales rep
    const totalVendors = await Vendor.countDocuments({ salesRep: salesRepId });

    // Vendors created by this sales rep in the current month
    const vendorsCreatedThisMonth = await Vendor.countDocuments({
      salesRep: salesRepId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }, // Assuming createdAt field exists in Vendor model
    });

    // Vendors created by this sales rep in the previous month
    const vendorsCreatedPreviousMonth = await Vendor.countDocuments({
      salesRep: salesRepId,
      createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
    });

    // Total Franchises associated with this sales rep
    const totalFranchises = await Franchise.countDocuments({
      salesRep: salesRepId,
    });

    // Franchises created by this sales rep in the current month
    const franchisesCreatedThisMonth = await Franchise.countDocuments({
      salesRep: salesRepId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }, // Assuming createdAt field exists in Franchise model
    });

    // Franchises created by this sales rep in the previous month
    const franchisesCreatedPreviousMonth = await Franchise.countDocuments({
      salesRep: salesRepId,
      createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
    });

    // Total accounts (User documents) created by this sales rep in the current month
    const newFranchiseOwnerUsersThisMonth = await Franchise.find({
      salesRep: salesRepId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    }).distinct("ownerId");

    const newVendorUsersThisMonth = await Vendor.find({
      salesRep: salesRepId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    }).distinct("userId");

    const accountsCreatedThisMonth = new Set([
      ...newFranchiseOwnerUsersThisMonth,
      ...newVendorUsersThisMonth,
    ]).size;

    // --- 5. Calculate Growth Rate ---
    let growthRate = 0;
    const totalCreatedThisMonth =
      vendorsCreatedThisMonth + franchisesCreatedThisMonth;
    const totalCreatedPreviousMonth =
      vendorsCreatedPreviousMonth + franchisesCreatedPreviousMonth;

    if (totalCreatedPreviousMonth > 0) {
      growthRate =
        ((totalCreatedThisMonth - totalCreatedPreviousMonth) /
          totalCreatedPreviousMonth) *
        100;
    } else if (totalCreatedThisMonth > 0) {
      growthRate = 100; // If previous was 0 but current is > 0, it's 100% growth
    }

    // --- 6. New Accounts Trend for the Last Week (for chart) ---
    const dayNamesForChart = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const newAccountsTrend = dayNamesForChart.map((day) => ({
      day,
      accounts: 0,
    }));

    const weeklyNewAccounts = await Promise.all([
      Vendor.aggregate([
        {
          $match: {
            salesRep: new mongoose.Types.ObjectId(salesRepId),
            createdAt: { $gte: startOfWeek, $lte: new Date() },
          },
        },
        {
          $group: {
            _id: { $dayOfWeek: "$createdAt" }, // 1 for Sunday, 2 for Monday, etc.
            count: { $sum: 1 },
          },
        },
      ]),
      Franchise.aggregate([
        {
          $match: {
            salesRep: new mongoose.Types.ObjectId(salesRepId),
            createdAt: { $gte: startOfWeek, $lte: new Date() },
          },
        },
        {
          $group: {
            _id: { $dayOfWeek: "$createdAt" }, // 1 for Sunday, 2 for Monday, etc.
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const [weeklyNewVendors, weeklyNewFranchises] = weeklyNewAccounts;

    const combinedWeeklyCounts = new Map();
    weeklyNewVendors.forEach((day) =>
      combinedWeeklyCounts.set(
        day._id,
        (combinedWeeklyCounts.get(day._id) || 0) + day.count
      )
    );
    weeklyNewFranchises.forEach((day) =>
      combinedWeeklyCounts.set(
        day._id,
        (combinedWeeklyCounts.get(day._id) || 0) + day.count
      )
    );

    combinedWeeklyCounts.forEach((count, dayOfWeek) => {
      newAccountsTrend[dayOfWeek - 1].accounts = count; // Map 1-based dayOfWeek to 0-based array index
    });

    // --- 7. Fetch Recent Activity (last 5-10 activities for example) ---
    const recentVendors = await Vendor.find({ salesRep: salesRepId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email");

    const recentFranchises = await Franchise.find({ salesRep: salesRepId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("ownerId", "name email");

    let recentActivity = [];

    recentVendors.forEach((vendor) => {
      recentActivity.push({
        activityType: "Vendor Created",
        activityDate: vendor.createdAt?.toISOString().split("T")[0],
        details: `Vendor "${vendor.name}" (${vendor.userId?.email || "N/A"}) was created.`,
        _id: vendor._id,
      });
    });

    recentFranchises.forEach((franchise) => {
      recentActivity.push({
        activityType: "Franchise Enrolled",
        activityDate: franchise.createdAt?.toISOString().split("T")[0],
        details: `Franchise "${franchise.franchiseName}" (Owner: ${franchise.ownerId?.email || "N/A"}) was enrolled.`,
        _id: franchise._id,
      });
    });

    recentActivity.sort(
      (a, b) => new Date(b.activityDate) - new Date(a.activityDate)
    );
    recentActivity = recentActivity.slice(0, 10);

    // --- 8. Send Response ---
    res.status(200).json({
      totalVendors,
      totalFranchises,
      growthRate: parseFloat(growthRate.toFixed(2)),
      accountsCreatedThisMonth,
      newAccountsTrend, // Updated chart data format
      recentActivity,
      salesRepInfo: {
        name: salesRepUser.name,
        email: salesRepUser.email,
      },
    });
  } catch (error) {
    console.error("Error fetching sales rep dashboard analytics:", error);
    res
      .status(500)
      .json({ message: "Server error fetching dashboard analytics." });
  }
};

/**
 * @desc Get dashboard analytics data for a vendor's home page
 * @route GET /api/vendor/dashboard/analytics
 * @access Private/Vendor
 */
export const getVendorDashHomeAnalytics = async (req, res) => {
  const { vendorId } = req.query;

  // --- 1. Basic Validation ---
  if (!vendorId) {
    return res.status(400).json({ message: "Vendor ID is required." });
  }

  try {
    const now = new Date();
    // Start of current month
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // End of current month (last day of current month)
    const endOfCurrentMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    );

    // Start of last month
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    // End of last month (last day of last month)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Start of the week (Sunday for consistency)
    const startOfWeek = new Date(now); // Clone current date
    startOfWeek.setDate(now.getDate() - now.getDay()); // Get Sunday of current week
    startOfWeek.setHours(0, 0, 0, 0); // Set to start of day

    // --- 2. Calculate Total Orders & Revenue ---
    const [currentMonthOrders, lastMonthOrders, totalAllTimeOrders] =
      await Promise.all([
        Order.aggregate([
          {
            $match: {
              vendorId: new mongoose.Types.ObjectId(vendorId),
              createdAt: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
            },
          },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalRevenue: { $sum: "$totalAmount" },
              totalProductsSold: { $sum: { $sum: "$items.quantity" } },
            },
          },
        ]),
        Order.aggregate([
          {
            $match: {
              vendorId: new mongoose.Types.ObjectId(vendorId),
              createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
            },
          },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalRevenue: { $sum: "$totalAmount" },
              totalProductsSold: { $sum: { $sum: "$items.quantity" } },
            },
          },
        ]),
        Order.aggregate([
          { $match: { vendorId: new mongoose.Types.ObjectId(vendorId) } },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalRevenue: { $sum: "$totalAmount" },
              totalProductsSold: { $sum: { $sum: "$items.quantity" } },
            },
          },
        ]),
      ]);

    const currentMonthData = currentMonthOrders[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      totalProductsSold: 0,
    };
    const lastMonthData = lastMonthOrders[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      totalProductsSold: 0,
    };
    const allTimeData = totalAllTimeOrders[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      totalProductsSold: 0,
    };

    // Helper to calculate percentage increment
    const calculateIncrement = (current, previous) => {
      if (previous === 0) {
        return current > 0 ? "100%" : "0%"; // If previous was 0 and current > 0, it's 100% growth
      }
      const increment = ((current - previous) / previous) * 100;
      return `${increment.toFixed(2)}%`;
    };

    const totalOrdersIncrement = calculateIncrement(
      currentMonthData.totalOrders,
      lastMonthData.totalOrders
    );
    const revenueIncrement = calculateIncrement(
      currentMonthData.totalRevenue,
      lastMonthData.totalRevenue
    );
    const productsSoldIncrement = calculateIncrement(
      currentMonthData.totalProductsSold,
      lastMonthData.totalProductsSold
    );

    // --- 3. Orders Trend for the Last Week (for chart) ---
    const dayNamesForChart = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const ordersTrend = dayNamesForChart.map((day) => ({ day, orders: 0 }));

    const weeklyOrders = await Order.aggregate([
      {
        $match: {
          vendorId: new mongoose.Types.ObjectId(vendorId),
          createdAt: { $gte: startOfWeek, $lte: new Date() },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" }, // 1 for Sunday, 2 for Monday, etc.
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    weeklyOrders.forEach((day) => {
      // Map 1-based dayOfWeek to 0-based array index
      ordersTrend[day._id - 1].orders = day.count;
    });

    // --- 4. Recent Orders ---
    const recentOrders = await Order.find({ vendorId: vendorId })
      .sort({ createdAt: -1 })
      .limit(5) // Get the 5 most recent orders
      .populate("userId", "name email") // Populate user details for the customer name
      .select("totalAmount orderStatus createdAt userId items"); // Select only necessary fields

    const formattedRecentOrders = recentOrders.map((order) => ({
      orderId: order._id,
      orderDate: order.createdAt.toISOString().split("T")[0],
      orderAmount: order.totalAmount,
      orderStatus: order.orderStatus,
      userName: order.userId ? order.userId.name : "N/A", // Display user's name
      // Ensure 'items' is included if you plan to display product names from it
      items: order.items || [], // Return items array as is
    }));

    // --- 5. Send Response ---
    res.status(200).json({
      totalOrders: {
        noOfOrders: allTimeData.totalOrders,
        incrementFromLastMonth: totalOrdersIncrement,
      },
      revenue: {
        amount: allTimeData.totalRevenue,
        incrementFromLastMonth: revenueIncrement,
      },
      productsSold: {
        noOfProducts: allTimeData.totalProductsSold,
        incrementFromLastMonth: productsSoldIncrement,
      },
      ordersTrend: ordersTrend, // Updated chart data format
      recentOrders: formattedRecentOrders,
    });
  } catch (error) {
    console.error("Error fetching vendor dashboard analytics:", error);
    res
      .status(500)
      .json({ message: "Server error fetching dashboard analytics." });
  }
};
/**
 * @desc Get dashboard analytics data for the admin home page
 * @route GET /api/admin/dashboard/analytics
 * @access Private/Admin
 */
export const getAdminHomeAnalytics = async (req, res) => {
  try {
    const now = new Date();
    // Helper to get start and end of month
    const getMonthRange = (date) => {
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999); // Set to end of day
      return { start, end };
    };

    const currentMonth = getMonthRange(now);
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonth = getMonthRange(prevMonthDate);

    // Helper to calculate percentage change
    const calculatePercentageChange = (current, previous) => {
      if (previous === 0) {
        return current > 0 ? 100 : 0; // If previous was 0 and current > 0, it's 100% growth
      }
      return parseFloat(((current - previous) / previous) * 100).toFixed(2);
    };

    // --- 1. Overall Platform Metrics ---
    const [
      totalOrdersCurrentMonth,
      totalOrdersPreviousMonth,
      totalRevenueCurrentMonth,
      totalRevenuePreviousMonth,
      totalRewardsCurrentMonth,
      totalRewardsPreviousMonth,
      totalMembershipUsers,
      totalNonMembershipUsers,
      totalOrdersAllTime,
      totalRevenueAllTime,
      totalRewardsAllTime,
    ] = await Promise.all([
      Order.countDocuments({
        createdAt: { $gte: currentMonth.start, $lte: currentMonth.end },
      }),
      Order.countDocuments({
        createdAt: { $gte: previousMonth.start, $lte: previousMonth.end },
      }),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: currentMonth.start, $lte: currentMonth.end },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: previousMonth.start, $lte: previousMonth.end },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      RewardLog.aggregate([
        {
          $match: {
            createdAt: { $gte: currentMonth.start, $lte: currentMonth.end },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      RewardLog.aggregate([
        {
          $match: {
            createdAt: { $gte: previousMonth.start, $lte: previousMonth.end },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      User.countDocuments({ isMember: true }),
      User.countDocuments({ isMember: false }),
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      RewardLog.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const currentMonthRevenue = totalRevenueCurrentMonth[0]?.total || 0;
    const previousMonthRevenue = totalRevenuePreviousMonth[0]?.total || 0;
    const currentMonthRewards = totalRewardsCurrentMonth[0]?.total || 0;
    const previousMonthRewards = totalRewardsPreviousMonth[0]?.total || 0;

    // --- 2. Chart Data ---
    // Sales Overview Data (Last 6 Months)
    const salesOverviewData = [];
    const growthMatricesData = { users: [], vendors: [], franchises: [] };
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const { start, end } = getMonthRange(date);
      const monthLabel = monthNames[date.getMonth()];

      const [monthlyRevenue, monthlyUsers, monthlyVendors, monthlyFranchises] =
        await Promise.all([
          Order.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
          ]),
          User.countDocuments({ createdAt: { $gte: start, $lte: end } }),
          Vendor.countDocuments({ createdAt: { $gte: start, $lte: end } }),
          Franchise.countDocuments({ createdAt: { $gte: start, $lte: end } }),
        ]);

      salesOverviewData.push({
        month: monthLabel,
        revenue: monthlyRevenue[0]?.total || 0,
      });
      growthMatricesData.users.push({
        month: monthLabel,
        count: monthlyUsers,
      });
      growthMatricesData.vendors.push({
        month: monthLabel,
        count: monthlyVendors,
      });
      growthMatricesData.franchises.push({
        month: monthLabel,
        count: monthlyFranchises,
      });
    }

    // Membership Data (Pie Chart)
    const membershipData = [
      { name: "Members", value: totalMembershipUsers },
      { name: "Non-Members", value: totalNonMembershipUsers },
    ];

    // --- 3. Top Performing Vendors (by total amount for the current month) ---
    const topPerformingVendors = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: currentMonth.start, $lte: currentMonth.end },
          paymentStatus: "completed", // Only count completed orders
        },
      },
      {
        $group: {
          _id: "$vendorId",
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { totalRevenue: -1 } }, // Sort by revenue descending
      { $limit: 5 }, // Top 5
      {
        $lookup: {
          from: "vendors", // The collection name for Vendor model
          localField: "_id",
          foreignField: "_id",
          as: "vendorInfo",
        },
      },
      { $unwind: "$vendorInfo" }, // Deconstruct the array
      {
        $project: {
          _id: 0,
          vendorName: "$vendorInfo.name",
          noOfOrders: "$totalOrders",
          revenue: {
            amt: "$totalRevenue",
            rateofGrowth: { $literal: 0 }, // Explicitly include 0 as a literal value
          },
        },
      },
    ]);

    // --- 4. Recent Activity (Global - Users, Vendors, Franchises, Orders) ---
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email roles");
    const recentVendors = await Vendor.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email");
    const recentFranchises = await Franchise.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("ownerId", "name email");
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name")
      .populate("vendorId", "name");

    let recentActivity = [];

    recentUsers.forEach((user) => {
      recentActivity.push({
        activityType: "New User Registered",
        activityDate: user.createdAt?.toISOString().split("T")[0],
        details: `User "${user.name}" (${user.email}) registered with roles: ${user.roles.join(", ")}.`,
        _id: user._id,
      });
    });

    recentVendors.forEach((vendor) => {
      recentActivity.push({
        activityType: "New Vendor Added",
        activityDate: vendor.createdAt?.toISOString().split("T")[0],
        details: `Vendor "${vendor.name}" (Owner: ${vendor.userId?.name || "N/A"}) was added.`,
        _id: vendor._id,
      });
    });

    recentFranchises.forEach((franchise) => {
      recentActivity.push({
        activityType: "New Franchise Enrolled",
        activityDate: franchise.createdAt?.toISOString().split("T")[0],
        details: `Franchise "${franchise.franchiseName}" (Owner: ${franchise.ownerId?.name || "N/A"}) was enrolled.`,
        _id: franchise._id,
      });
    });

    recentOrders.forEach((order) => {
      recentActivity.push({
        activityType: "New Order Placed",
        activityDate: order.createdAt?.toISOString().split("T")[0],
        details: `Order #${order._id.toString().slice(-6)} placed by ${order.userId?.name || "N/A"} for ${order.vendorId?.name || "N/A"} for ₹${order.totalAmount.toFixed(2)}.`,
        _id: order._id,
      });
    });

    recentActivity.sort(
      (a, b) => new Date(b.activityDate) - new Date(a.activityDate)
    );
    recentActivity = recentActivity.slice(0, 5); // Limit to top 5 recent activities

    // --- 5. Send Response ---
    res.status(200).json({
      totalRevenue: {
        amt: (totalRevenueAllTime[0]?.total || 0).toFixed(2),
        incrementFromLastMonth: calculatePercentageChange(
          currentMonthRevenue,
          previousMonthRevenue
        ),
      },
      memberShipUser: {
        amount: totalMembershipUsers,
        incrementFromLastMonth: calculatePercentageChange(
          totalMembershipUsers,
          // For membership users, consider comparing total active members (or new members) over time
          // For simplicity, we'll assume a direct count comparison, but a more complex query for new members
          // in the last month vs. previous month would be more accurate for "increment"
          await User.countDocuments({
            isMember: true,
            createdAt: { $gte: previousMonth.start, $lte: previousMonth.end },
          })
        ),
      },
      totalOrders: {
        amt: totalOrdersAllTime,
        incrementFromLastMonth: calculatePercentageChange(
          totalOrdersCurrentMonth,
          totalOrdersPreviousMonth
        ),
      },
      rewardsDistributed: {
        amt: (totalRewardsAllTime[0]?.total || 0).toFixed(2),
        incrementFromLastMonth: calculatePercentageChange(
          currentMonthRewards,
          previousMonthRewards
        ),
      },
      salesOverviewData: salesOverviewData,
      membershipData: membershipData,
      growthMatrices: growthMatricesData,
      topPerformingVendors: topPerformingVendors,
      recentActivity: recentActivity,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard analytics:", error);
    res
      .status(500)
      .json({ message: "Server error fetching admin dashboard analytics." });
  }
};
