import mongoose from "mongoose";
import { Vendor } from '../models/Vendor.model.js'; // Adjust path as needed
import { ProductService } from '../models/ProductService.model.js'; // Assuming this is your product model
import { Order } from '../models/Order.model.js'; // Adjust path as needed
import { Settlement } from '../models/settlement.model.js'; // Import your Settlement model

export const vendorDetailsAnalytics = async (req, res) => {
    let { vendorId } = req.params;
    const { filter } = req.query; // 'today', 'weekly', 'monthly'
    const { productStatusFilter } = req.query; // 'pending', 'approved', 'rejected'

    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
        return res.status(400).json({ message: "Invalid vendor ID." });
    }

    try {
        // 1. Fetch Vendor and associated User for KYC documents
        const vendor = await Vendor.findById(vendorId).populate({
            path: "userId",
            select: "name kycDocumentImage",
        });

        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found." });
        }

        // 2. Define date ranges for filters
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let dateFilter = {};
        if (filter === "today") {
            dateFilter = { createdAt: { $gte: today } };
        } else if (filter === "weekly") {
            dateFilter = { createdAt: { $gte: startOfWeek } };
        } else if (filter === "monthly") {
            dateFilter = { createdAt: { $gte: startOfMonth } };
        }

        // 3. Product and Order Filtering
        const productFilter = { vendorId };
        if (productStatusFilter) {
            productFilter.isAdminApproved = productStatusFilter;
        }

        const orderFilter = { vendorId, ...dateFilter };

        const [
            pendingProducts,
            filteredApprovedProducts,
            productsByStatus,
            filteredOrders,
            totalSalesResult,
            totalReplacedProducts,
            settlementResult,
            totalSettlementAmountResult,
            lastSettlement,
            salesByMonth,
            replacementsByMonth
        ] = await Promise.all([
            ProductService.find({ vendorId, isAdminApproved: "pending" }).select("title description price createdAt"),
            ProductService.find({ vendorId, isAdminApproved: "approved", ...dateFilter }),
            ProductService.find(productFilter).select("title description price createdAt isAdminApproved"),
            Order.find(orderFilter),
            Order.aggregate([
                { $match: { vendorId: new mongoose.Types.ObjectId(vendorId), paymentStatus: "completed" } },
                { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } },
            ]),
            Order.countDocuments({ vendorId, orderStatus: "replaced" }),
            Order.aggregate([
                { $match: { vendorId: new mongoose.Types.ObjectId(vendorId), paymentStatus: "completed", createdAt: { $gte: new Date(now.setDate(now.getDate() - 7)) } } },
                { $group: { _id: null, totalWeeklySales: { $sum: "$totalAmount" } } }
            ]),
            Settlement.aggregate([
                { $match: { toUser: new mongoose.Types.ObjectId(vendor.userId._id) } },
                { $group: { _id: null, totalSettledAmount: { $sum: '$ammountSettle' } } }
            ]),
            Settlement.findOne({ toUser: new mongoose.Types.ObjectId(vendor.userId._id) }).sort({ createdAt: -1 }).select('ammountSettle createdAt').limit(1),
            Order.aggregate([
                { $match: { vendorId: new mongoose.Types.ObjectId(vendorId), paymentStatus: "completed", createdAt: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) } } },
                { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, totalSales: { $sum: "$totalAmount" } } },
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ]),
            Order.aggregate([
                { $match: { vendorId: new mongoose.Types.ObjectId(vendorId), orderStatus: "replaced", createdAt: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) } } },
                { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, totalReplacements: { $sum: 1 } } },
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ])
        ]);

        const totalSales = totalSalesResult.length > 0 ? totalSalesResult[0].totalSales : 0;
        const totalWeeklySales = settlementResult.length > 0 ? settlementResult[0].totalWeeklySales : 0;
        const commissionRate = vendor.commissionRate || 0;
        const totalCommission = (totalWeeklySales * commissionRate) / 100;
        const netSettlement = totalWeeklySales - totalCommission;
        const totalSettledAmount = totalSettlementAmountResult.length > 0 ? totalSettlementAmountResult[0].totalSettledAmount : 0;
        const lastSettlementAmount = lastSettlement ? lastSettlement.ammountSettle : 0;
        const lastSettlementDate = lastSettlement ? lastSettlement.createdAt : null;

        // Final Response
        res.status(200).json({
            success: true,
            data: {
                vendorDetails: {
                    name: vendor.name,
                    pincode: vendor.pincode,
                    commissionRate: vendor.commissionRate
                },
                kycDocuments: vendor.userId ? vendor.userId.kycDocumentImage : [],
                analytics: {
                    totalSales,
                    totalReplacedProducts,
                    ordersCount: {
                        filter: filter || 'all_time',
                        count: filteredOrders.length,
                    },
                    approvedProductsCount: {
                        filter: filter || 'all_time',
                        count: filteredApprovedProducts.length,
                    },
                    totalSettledAmount,
                    lastSettlement: {
                        amount: lastSettlementAmount,
                        date: lastSettlementDate
                    }
                },
                weeklySettlement: {
                    totalSalesLast7Days: totalWeeklySales,
                    commissionDeducted: totalCommission,
                    netPayableAmount: netSettlement
                },
                filteredData: {
                    approvedProducts: filteredApprovedProducts,
                    orders: filteredOrders,
                },
                pendingApprovalProducts: {
                    count: pendingProducts.length,
                    products: pendingProducts,
                },
                productsByStatus: {
                    filter: productStatusFilter || 'all',
                    count: productsByStatus.length,
                    products: productsByStatus
                },
                graphs: {
                    salesByMonth,
                    replacementsByMonth,
                },
            },
        });

    } catch (error) {
        console.error("Error fetching vendor analytics:", error);
        res.status(500).json({ success: false, message: "Server error while fetching analytics." });
    }
};
/**
 * Processes a settlement for a vendor.
 * An admin records a payment to the vendor's associated user account.
 * Expects 'vendorId' in params and 'amountSettle' in the request body.
 */
export const processSettlement = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const { amountSettle } = req.body;
        // Assuming 'req.user._id' contains the ID of the authenticated admin user
        // This relies on your authentication middleware (e.g., 'protect')
        const adminId = req.user._id; 

        if (!mongoose.Types.ObjectId.isValid(vendorId) || !amountSettle || amountSettle <= 0) {
            return res.status(400).json({ message: "Invalid vendor ID or settlement amount." });
        }
        if (!adminId) {
             return res.status(401).json({ message: "Admin user not authenticated. Cannot record settlement." });
        }


        // Find the vendor to get their associated userId
        const vendor = await Vendor.findById(vendorId).select('userId');
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found." });
        }
        if (!vendor.userId) {
            return res.status(400).json({ message: "Vendor is not linked to a user account. Cannot process settlement." });
        }

        // Create the new settlement record
        const newSettlement = new Settlement({
            byAdmin: adminId,         // The admin who initiated this settlement
            toUser: vendor.userId,    // The user (vendor's linked account) who receives the settlement
            ammountSettle: amountSettle
        });

        await newSettlement.save();

        res.status(201).json({
            message: "Settlement processed successfully.",
            settlement: newSettlement
        });

    } catch (error) {
        console.error("Error processing settlement:", error);
        res.status(500).json({ message: "Server error during settlement processing.", error: error.message });
    }
};


/**
 * Updates the approval status of a product by an admin.
 * Expects 'productId' in params and 'isAdminApproved' (status: 'approved' or 'rejected') in the request body.
 */
export const updateProductStatus = async (req, res) => {
    try {
        const { productId } = req.params;
        const { isAdminApproved } = req.body; // Expects 'pending', 'approved', or 'rejected'

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid product ID." });
        }

        // Validate the status input
        const validStatuses = ['pending', 'approved', 'rejected'];
        if (!isAdminApproved || !validStatuses.includes(isAdminApproved)) {
            return res.status(400).json({ message: "Invalid or missing status. Must be 'pending', 'approved', or 'rejected'." });
        }

        const updatedProduct = await ProductService.findByIdAndUpdate(
            productId,
            { isAdminApproved: isAdminApproved },
            { new: true, runValidators: true } // `new: true` returns the updated document, `runValidators: true` ensures enum validation
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found." });
        }

        res.status(200).json({
            message: `Product status updated to '${isAdminApproved}' successfully.`,
            product: updatedProduct
        });

    } catch (error) {
        console.error("Error updating product status:", error);
        res.status(500).json({ message: "Server error during product status update.", error: error.message });
    }
};