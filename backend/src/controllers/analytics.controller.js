import { User } from "../models/User.model.js"; // Adjust path as needed
import { Vendor } from "../models/Vendor.model.js"; // Adjust path as needed
import { Franchise } from "../models/Franchise.model.js"; // Adjust path as needed
import { Order } from '../models/Order.model.js';
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
    // This assumes the sales rep is 'parent' or 'referredBy' the new user, or maybe you have a direct 'createdBy' field on the User model
    // For simplicity, let's assume 'ownerId' for Franchise and 'userId' for Vendor are considered 'accounts created'
    // This could also be refined if the User model directly tracks who created it.
    const newFranchiseOwnerUsersThisMonth = await Franchise.find({
      salesRep: salesRepId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    }).distinct("ownerId"); // Get unique owner IDs

    const newVendorUsersThisMonth = await Vendor.find({
      salesRep: salesRepId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    }).distinct("userId"); // Get unique user IDs for vendors

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

    // --- 6. Fetch Recent Activity (last 5-10 activities for example) ---
    // Combine recent vendor and franchise creations, sort by date.
    // This assumes `createdAt` field exists on both models.

    const recentVendors = await Vendor.find({ salesRep: salesRepId })
      .sort({ createdAt: -1 })
      .limit(5) // Get latest 5
      .populate("userId", "name email"); // Populate user details for context

    const recentFranchises = await Franchise.find({ salesRep: salesRepId })
      .sort({ createdAt: -1 })
      .limit(5) // Get latest 5
      .populate("ownerId", "name email"); // Populate owner details for context

    let recentActivity = [];

    recentVendors.forEach((vendor) => {
      recentActivity.push({
        activityType: "Vendor Created",
        activityDate: vendor.createdAt?.toISOString().split("T")[0], // Format to YYYY-MM-DD
        details: `Vendor "${vendor.name}" (${vendor.userId?.email || "N/A"}) was created.`,
        _id: vendor._id,
      });
    });

    recentFranchises.forEach((franchise) => {
      recentActivity.push({
        activityType: "Franchise Enrolled",
        activityDate: franchise.createdAt?.toISOString().split("T")[0], // Format to YYYY-MM-DD
        details: `Franchise "${franchise.franchiseName}" (Owner: ${franchise.ownerId?.email || "N/A"}) was enrolled.`,
        _id: franchise._id,
      });
    });

    // Sort all activities by date descending
    recentActivity.sort(
      (a, b) => new Date(b.activityDate) - new Date(a.activityDate)
    );
    // Limit to a reasonable number for dashboard display
    recentActivity = recentActivity.slice(0, 10); // Display top 10 recent activities

    // --- 7. Send Response ---
    res.status(200).json({
      totalVendors,
      totalFranchises,
      growthRate: parseFloat(growthRate.toFixed(2)), // Format to 2 decimal places
      accountsCreatedThisMonth,
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

  // Optional: Validate if the vendorId actually exists in your Vendor model
  // import Vendor from '../models/Vendor.js';
  // const vendor = await Vendor.findById(vendorId);
  // if (!vendor) {
  //   return res.status(404).json({ message: "Vendor not found." });
  // }

  try {
    const now = new Date();
    // Start of current month
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // End of current month (last day of current month)
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Start of last month
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    // End of last month (last day of last month)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Start of the week (Sunday for consistency)
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Get Sunday of current week
    startOfWeek.setHours(0, 0, 0, 0); // Set to start of day


    // --- 2. Calculate Total Orders & Revenue ---
    const [
      currentMonthOrders,
      lastMonthOrders,
      totalAllTimeOrders
    ] = await Promise.all([
      Order.aggregate([
        { $match: { vendorId: new mongoose.Types.ObjectId(vendorId), createdAt: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth } } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$totalAmount" },
            totalProductsSold: { $sum: { $sum: "$items.quantity" } }
          }
        }
      ]),
      Order.aggregate([
        { $match: { vendorId: new mongoose.Types.ObjectId(vendorId), createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$totalAmount" },
            totalProductsSold: { $sum: { $sum: "$items.quantity" } }
          }
        }
      ]),
      Order.aggregate([
        { $match: { vendorId: new mongoose.Types.ObjectId(vendorId) } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$totalAmount" },
            totalProductsSold: { $sum: { $sum: "$items.quantity" } }
          }
        }
      ])
    ]);

    const currentMonthData = currentMonthOrders[0] || { totalOrders: 0, totalRevenue: 0, totalProductsSold: 0 };
    const lastMonthData = lastMonthOrders[0] || { totalOrders: 0, totalRevenue: 0, totalProductsSold: 0 };
    const allTimeData = totalAllTimeOrders[0] || { totalOrders: 0, totalRevenue: 0, totalProductsSold: 0 };


    // Helper to calculate percentage increment
    const calculateIncrement = (current, previous) => {
      if (previous === 0) {
        return current > 0 ? "100%" : "0%"; // If previous was 0 and current > 0, it's 100% growth
      }
      const increment = ((current - previous) / previous) * 100;
      return `${increment.toFixed(2)}%`;
    };

    const totalOrdersIncrement = calculateIncrement(currentMonthData.totalOrders, lastMonthData.totalOrders);
    const revenueIncrement = calculateIncrement(currentMonthData.totalRevenue, lastMonthData.totalRevenue);
    const productsSoldIncrement = calculateIncrement(currentMonthData.totalProductsSold, lastMonthData.totalProductsSold);


    // --- 3. Orders Trend for the Last Week ---
    const ordersTrend = { mon: 0, tue: 0, wed: 0, thus: 0, fri: 0, sat: 0, sun: 0 };
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thus', 'fri', 'sat'];

    const weeklyOrders = await Order.aggregate([
      {
        $match: {
          vendorId: new mongoose.Types.ObjectId(vendorId),
          createdAt: { $gte: startOfWeek, $lte: new Date() }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" }, // 1 for Sunday, 2 for Monday, etc.
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    weeklyOrders.forEach(day => {
      ordersTrend[dayNames[day._id - 1]] = day.count; // Map 1-based dayOfWeek to 0-based array index
    });


    // --- 4. Recent Orders ---
    const recentOrders = await Order.find({ vendorId: vendorId })
      .sort({ createdAt: -1 })
      .limit(5) // Get the 5 most recent orders
      .populate('userId', 'name email') // Populate user details for the customer name
      .select('totalAmount orderStatus createdAt userId items'); // Select only necessary fields

    const formattedRecentOrders = recentOrders.map(order => ({
      orderId: order._id,
      orderDate: order.createdAt.toISOString().split('T')[0],
      orderAmount: order.totalAmount,
      orderStatus: order.orderStatus,
      userName: order.userId ? order.userId.name : 'N/A', // Display user's name
    }));


    // --- 5. Send Response ---
    res.status(200).json({
      totalOrders: {
        noOfOrders: allTimeData.totalOrders,
        incrementFromLastMonth: totalOrdersIncrement
      },
      revenue: {
        amount: allTimeData.totalRevenue,
        incrementFromLastMonth: revenueIncrement
      },
      productsSold: {
        noOfProducts: allTimeData.totalProductsSold,
        incrementFromLastMonth: productsSoldIncrement
      },
      ordersTrend: ordersTrend,
      recentOrders: formattedRecentOrders,
    });

  } catch (error) {
    console.error("Error fetching vendor dashboard analytics:", error);
    res.status(500).json({ message: "Server error fetching dashboard analytics." });
  }
};
