// ===================================
// File: controllers/order.controller.js
// ===================================
import { Order } from "../models/Order.model.js";
import { ProductService } from "../models/ProductService.model.js"; // To validate productServiceId and get price
import mongoose from "mongoose";
import { Vendor } from "../models/Vendor.model.js"; // Adjust path as per your project structure

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * @desc Create a new order
 * @route POST /api/orders
 * @access Public (or Private, e.g., User role)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createOrder = async (req, res) => {
  try {
    const { userId, vendorId, items, address } = req.body;

    // Basic validation for required fields
    if (
      !userId ||
      !vendorId ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message: "User ID, Vendor ID, and at least one item are required.",
      });
    }
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid User ID format." });
    }
    if (!isValidObjectId(vendorId)) {
      return res.status(400).json({ message: "Invalid Vendor ID format." });
    }

    let calculatedTotalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      if (!item.productServiceId || !item.quantity || item.quantity < 1) {
        return res.status(400).json({
          message:
            "Each item must have a valid productServiceId and quantity (min 1).",
        });
      }
      if (!isValidObjectId(item.productServiceId)) {
        return res.status(400).json({
          message: `Invalid Product/Service ID format for item: ${item.productServiceId}`,
        });
      }

      // Fetch product/service to get its current price (snapshot)
      const productService = await ProductService.findById(
        item.productServiceId
      );
      if (!productService) {
        return res.status(404).json({
          message: `Product or Service with ID ${item.productServiceId} not found.`,
        });
      }

      // If it's a product, check quantity and isInStock
      if (productService.type === "product") {
        if (!productService.isInStock) {
          return res.status(400).json({
            message: `Product ${productService.title} is out of stock.`,
          });
        }
        // If variants exist, you would need to check variant-specific quantity here
        // For simplicity, assuming top-level quantity or no variants for now.
        // If variants are used, `item.price` should come from the variant's price if applicable.
      }

      const itemPrice = productService.price; // Use the current price from the database
      const itemTotal = itemPrice * item.quantity;
      const itemCourierCharges = productService.courierCharges || 0; // Default to 0 if not set
      const itemTotalWithCourier = itemTotal + itemCourierCharges;
      calculatedTotalAmount += itemTotalWithCourier;

      orderItems.push({
        productServiceId: item.productServiceId,
        quantity: item.quantity,
        price: itemPrice, // Store the price at the time of order
      });
    }

    const newOrder = new Order({
      userId,
      vendorId,
      items: orderItems,
      totalAmount: calculatedTotalAmount,
      address,
      // paymentStatus and orderStatus default to 'pending' and 'placed' respectively
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get all orders or filter by various criteria
 * @route GET /api/orders
 * @access Public (or Private, e.g., User/Vendor/Admin role)
 * @param {Object} req - Express request object (query parameters: userId, vendorId, paymentStatus, orderStatus, startDate, endDate)
 * @param {Object} res - Express response object
 */
export const getOrders = async (req, res) => {
  try {
    const { userId, vendorId, paymentStatus, orderStatus, startDate, endDate } =
      req.query;
    const filter = {};

    if (userId) {
      if (!isValidObjectId(userId))
        return res.status(400).json({ message: "Invalid User ID format." });
      filter.userId = userId;
    }
    if (vendorId) {
      if (!isValidObjectId(vendorId))
        return res.status(400).json({ message: "Invalid Vendor ID format." });
      filter.vendorId = vendorId;
    }
    if (paymentStatus) {
      if (!["pending", "completed", "failed"].includes(paymentStatus)) {
        return res
          .status(400)
          .json({ message: "Invalid paymentStatus value." });
      }
      filter.paymentStatus = paymentStatus;
    }
    if (orderStatus) {
      if (
        ![
          "placed",
          "confirmed",
          "in-progress",
          "delivered",
          "cancelled",
        ].includes(orderStatus)
      ) {
        return res.status(400).json({ message: "Invalid orderStatus value." });
      }
      filter.orderStatus = orderStatus;
    }

    if (startDate || endDate) {
      filter.placedAt = {};
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime()))
          return res.status(400).json({ message: "Invalid startDate format." });
        filter.placedAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime()))
          return res.status(400).json({ message: "Invalid endDate format." });
        // Set end of day to include all orders on endDate
        end.setHours(23, 59, 59, 999);
        filter.placedAt.$lte = end;
      }
    }

    const orders = await Order.find(filter)
      .sort({ placedAt: -1 })
      .populate("userId", "name email phone") // Populate user details (assuming User model has name, email)
      .populate("items.productServiceId", "title type price") // Populate product/service details
      .populate("vendorId") 

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get a single order by ID
 * @route GET /api/orders/:id
 * @access Public (or Private, e.g., User/Vendor/Admin role)
 * @param {Object} req - Express request object (params: id)
 * @param {Object} res - Express response object
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid Order ID format." });
    }

    const order = await Order.findById(id)
      .populate("userId", "name email")
      .populate("vendorId", "name")
      .populate("items.productServiceId", "title type price");

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Update an existing order (typically only status)
 * @route PUT /api/orders/:id
 * @access Public (or Private, e.g., Vendor/Admin role)
 * @param {Object} req - Express request object (params: id, body: fields to update)
 * @param {Object} res - Express response object
 */
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, orderStatus } = req.body; // Typically only these are updated

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid Order ID format." });
    }

    const updateFields = {};
    if (paymentStatus !== undefined) {
      if (!["pending", "completed", "failed"].includes(paymentStatus)) {
        return res
          .status(400)
          .json({ message: "Invalid paymentStatus value." });
      }
      updateFields.paymentStatus = paymentStatus;
    }
    if (orderStatus !== undefined) {
      if (
        ![
          "placed",
          "confirmed",
          "in-progress",
          "delivered",
          "cancelled",
        ].includes(orderStatus)
      ) {
        return res.status(400).json({ message: "Invalid orderStatus value." });
      }
      // Optional: Add logic for order status transitions (e.g., cannot go from 'delivered' to 'placed')
      // const existingOrder = await Order.findById(id);
      // if (existingOrder && existingOrder.orderStatus === 'delivered' && orderStatus === 'placed') {
      //   return res.status(400).json({ message: 'Cannot change status from delivered to placed.' });
      // }
      updateFields.orderStatus = orderStatus;
    }

    // Set updatedAt field automatically via schema middleware
    updateFields.updatedAt = Date.now();

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found." });
    }
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Delete an order
 * @route DELETE /api/orders/:id
 * @access Public (or Private, e.g., Admin role)
 * @param {Object} req - Express request object (params: id)
 * @param {Object} res - Express response object
 */
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid Order ID format." });
    }

    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found." });
    }
    res.status(200).json({ message: "Order deleted successfully." });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get Admin Sales Report
 * @route GET /api/orders/getAdminSalesReport
 * @access Private (e.g., Admin role)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAdminSalesReport = async (req, res) => {
  try {
    const now = new Date();

    // Calculate current month's start date
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Calculate previous month's start and end dates
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = currentMonthStart; // The day before current month starts

    // Helper function to calculate percentage change
    const calculateRate = (current, previous) => {
      if (previous === 0) {
        return current > 0 ? "100 %" : "0 %"; // If previous is 0 and current is >0, it's a 100% increase (or simply 0% if both are 0)
      }
      const change = ((current - previous) / previous) * 100;
      return `${change.toFixed(2)} %`;
    };

    // --- Overall Stats for Current Month ---
    const totalOrdersCurrentMonth = await Order.countDocuments({
      placedAt: { $gte: currentMonthStart },
    });
    const deliveredOrdersCurrentMonth = await Order.countDocuments({
      orderStatus: "delivered",
      placedAt: { $gte: currentMonthStart },
    });
    const totalRevenueResultCurrentMonth = await Order.aggregate([
      { $match: { placedAt: { $gte: currentMonthStart } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenueCurrentMonth =
      totalRevenueResultCurrentMonth.length > 0
        ? totalRevenueResultCurrentMonth[0].total
        : 0;

    // --- Overall Stats for Previous Month ---
    const totalOrdersPrevMonth = await Order.countDocuments({
      placedAt: { $gte: prevMonthStart, $lt: prevMonthEnd },
    });
    const deliveredOrdersPrevMonth = await Order.countDocuments({
      orderStatus: "delivered",
      placedAt: { $gte: prevMonthStart, $lt: prevMonthEnd },
    });
    const totalRevenueResultPrevMonth = await Order.aggregate([
      { $match: { placedAt: { $gte: prevMonthStart, $lt: prevMonthEnd } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenuePrevMonth =
      totalRevenueResultPrevMonth.length > 0
        ? totalRevenueResultPrevMonth[0].total
        : 0;

    // --- Calculate Rates ---
    const totalOrdersRate = calculateRate(
      totalOrdersCurrentMonth,
      totalOrdersPrevMonth
    );
    const deliveredOrdersRate = calculateRate(
      deliveredOrdersCurrentMonth,
      deliveredOrdersPrevMonth
    );
    const totalRevenueRate = calculateRate(
      totalRevenueCurrentMonth,
      totalRevenuePrevMonth
    );

    // --- Vendor-Specific Stats (Current Month) using Aggregation ---
    const allOrdersData = await Order.aggregate([
      {
        $match: {
          placedAt: { $gte: currentMonthStart }, // Filter for current month's orders
        },
      },
      {
        $group: {
          _id: "$vendorId",
          ordersPlaced: { $sum: 1 },
          ordersDelivered: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, 1, 0] },
          },
          pending: {
            $sum: {
              $cond: [
                {
                  $in: ["$orderStatus", ["placed", "confirmed", "in-progress"]],
                },
                1,
                0,
              ],
            },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "cancelled"] }, 1, 0] },
          },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ["$orderStatus", "delivered"] },
                "$totalAmount",
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "vendors", // Collection name for the Vendor model
          localField: "_id",
          foreignField: "_id",
          as: "vendorDetails",
        },
      },
      {
        $unwind: "$vendorDetails", // Deconstruct the vendorDetails array
      },
      {
        $project: {
          _id: 0,
          vendor: "$vendorDetails.name",
          ordersPlaced: "$ordersPlaced",
          ordersDelivered: "$ordersDelivered",
          pending: "$pending",
          cancelled: "$cancelled",
          deliveryRate: {
            $cond: {
              if: { $gt: ["$ordersPlaced", 0] },
              then: {
                $multiply: [
                  { $divide: ["$ordersDelivered", "$ordersPlaced"] },
                  100,
                ],
              },
              else: 0,
            },
          },
          revenue: "$revenue",
        },
      },
    ]);

    // Format deliveryRate to fixed 2 decimal places
    const formattedAllOrdersData = allOrdersData.map((data) => ({
      ...data,
      deliveryRate: parseFloat(data.deliveryRate).toFixed(2),
    }));

    res.status(200).json({
      totalOrders: {
        noOfOrders: totalOrdersCurrentMonth,
        rate: totalOrdersRate,
      },
      deliveredOrders: {
        noOfOrders: deliveredOrdersCurrentMonth,
        rate: deliveredOrdersRate,
      },
      totalRevenue: {
        revenue: totalRevenueCurrentMonth.toFixed(2), // Format revenue to 2 decimal places
        rate: totalRevenueRate,
      },
      allOrders: formattedAllOrdersData,
    });
  } catch (error) {
    console.error("Error fetching admin sales report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get all orders placed today
 * @route   GET /api/orders/today
 * @access  Public (or protected)
 */
export const getTodaysOrders = async (req, res) => {
  try {
    // Set the start and end of the current day
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Beginning of the day

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Beginning of the next day

    // Find orders placed within the calculated date range
    const todaysOrders = await Order.find({
      placedAt: {
        $gte: today,
        $lt: tomorrow,
      },
    })
      .populate({
        path: 'userId',
        select: 'name', // Assumes 'name' field in User model
      })
      .populate({
        path: 'vendorId',
        select: 'name', // Assumes 'name' field in Vendor model
      })
      .populate({
        path: 'items.productServiceId', // Populate productServiceId within the items array
        select: 'title', // Assumes 'title' field in ProductService model
      })
      .sort({ placedAt: -1 }); // Optional: sort by most recent

    if (!todaysOrders || todaysOrders.length === 0) {
      return res.status(200).json({ success: true, data: [], message: 'No orders found for today.' });
    }

    // Format the response to send only the required fields
    const formattedOrders = todaysOrders.map((order) => ({
      orderId: order._id,
      vendorName: order.vendorId ? order.vendorId.name : 'N/A',
      userName: order.userId ? order.userId.name : 'N/A',
      orderDate: order.placedAt,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      isAdminApproved: order.isAdminApproved,
      products: order.items.map(item => ({
        productTitle: item.productServiceId ? item.productServiceId.title : 'N/A',
        quantity: item.quantity,
        price: item.price,
      })),
    }));

    // Send the successful response (the "View")
    res.status(200).json(formattedOrders);

  } catch (error) {
    console.error("Error fetching today's orders:", error);
    res.status(500).json({ message: 'Server error while fetching orders.' });
  }
};


/**
 * @desc    Reject an order by admin
 * @route   PATCH /api/orders/:id/reject
 * @access  Private/Admin
 */
export const rejectOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate if the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Order ID format.' });
    }

    // 2. Find the order by its ID and update the isAdminApproved status
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { isAdminApproved: 'rejected' },
      { new: true } // This option returns the modified document
    );

    // 3. Check if an order was found and updated
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // 4. Send the successful response with the updated order
    res.status(200).json({
      message: 'Order has been rejected successfully.',
      order: updatedOrder,
    });

  } catch (error) {
    console.error("Error rejecting order:", error);
    res.status(500).json({ message: 'Server error while rejecting the order.' });
  }
};
