// ===================================
// File: controllers/vendor.controller.js
// ===================================

import { Vendor } from "../models/Vendor.model.js";
import { User } from "../models/User.model.js"; // Import User model to update roles
import { getHashPassword } from "../utils/getPassword.js";
import { generateUniqueReferralCode } from "../utils/referralGenerator.js";
import { SalesRep } from "../models/SalesRep.model.js";
import mongoose from "mongoose";

/**
 * @desc Create a new user (with 'vendor' role) and a corresponding vendor profile
 * @route POST /api/vendors
 * @access Private/Admin, Franchise-Admin
 */
export const createVendor = async (req, res) => {
  const {
    name,
    email,
    phone,
    password,
    pincode,
    commissionRate,
    referredByCode,

    kycDocumentImage,
  } = req.body;
console.log(req.body,"req.body create vendor")
  const salesRepId = req.user._id;
  try {
    // Step 1: Validation
    if (!name || !email || !password || !pincode) {
      return res.status(400).json({
        message: "Name, email, password, and pincode are required.",
      });
    }

    // Step 2: Duplicate email check
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "A user with this email already exists.",
      });
    }

    // Step 3: Hash password and generate referral code
    const hashedPassword = await getHashPassword(password);
    const referralCode = await generateUniqueReferralCode();

    // Step 4: Create User
    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      pincode,
      isMember: false,
      referralCode,
      referredByCode: referredByCode || null,
      roles: ["vendor"],
      kycDocumentImage: kycDocumentImage || [],
    });

    // Step 5: Handle referral if provided
    if (referredByCode) {
      const parentUser = await User.findOne({ referralCode: referredByCode });
      if (parentUser) {
        user.parent = parentUser._id;
        parentUser.profileScore = (parentUser.profileScore || 0) + 10;
        await parentUser.save();
      } else {
        console.warn(`Referral code ${referredByCode} not found.`);
      }
    }

    await user.save();

    // Step 6: Sales Rep check
    let salesRepUser = null;
    if (salesRepId) {
      salesRepUser = await User.findById(salesRepId);
      if (!salesRepUser || !salesRepUser.roles.includes("sales-rep")|| salesRepUser.roles.includes("admin")) {
        salesRepUser = null;
      }
    }
    const SalesRepresentive = await SalesRep.findOne({userId:salesRepId} );
console.log(SalesRepresentive,"salesRepresentive before save")
    // Step 7: Vendor creation
    const existingVendor = await Vendor.findOne({ userId: user._id });
    if (existingVendor) {
      return res.status(400).json({
        message: "Vendor profile already exists for this user.",
      });
    }

    const vendor = new Vendor({
      name,
      userId: user._id,
      pincode,
      commissionRate: commissionRate || 10,
      salesRep: salesRepUser?salesRepUser._id: null,
    });

    await vendor.save();

    // Step 8: Link vendor to sales rep
    if (SalesRepresentive) {
      SalesRepresentive.assignedVendors = SalesRepresentive.assignedVendors || [];
      SalesRepresentive.assignedVendors.push(vendor._id);
      await SalesRepresentive.save();
    }
console.log(SalesRepresentive,"salesRepresentive after save")
    // Step 9: Response
    return res.status(201).json({
      message: "Vendor and user created successfully.",
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        userId: vendor.userId,
        pincode: vendor.pincode,
        commissionRate: vendor.commissionRate,
        salesRep: vendor.salesRep,
      },
      user: {
        _id: user._id,
        email: user.email,
        roles: user.roles,
        referralCode: user.referralCode,
        kycDocumentImage: user.kycDocumentImage,
      },
    });

  } catch (error) {
    console.error("Error creating vendor and user:", error);
    return res.status(500).json({
      message: "Server error during vendor and user creation",
      error: error.message,
    });
  }
};

/**
 * @desc Get all vendors
 * @route GET /api/vendors
 * @access Private/Admin, Franchise-Admin
 */
export const getVendors = async (req, res) => {
    try {
        const { sortByRevenue } = req.query; // 'highToLow' or 'lowToHigh'

        let pipeline = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: {
                    path: '$userDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'salesRep',
                    foreignField: '_id',
                    as: 'salesRepDetails'
                }
            },
            {
                $unwind: {
                    path: '$salesRepDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    pincode: 1,
                    commissionRate: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    userId: '$userDetails._id',
                    userName: '$userDetails.name',
                    userEmail: '$userDetails.email',
                    userPhone: '$userDetails.phone',
                    salesRep: '$salesRepDetails._id',
                    salesRepName: '$salesRepDetails.name',
                    salesRepEmail: '$salesRepDetails.email',
                }
            },
            {
                $lookup: {
                    from: 'orders',
                    localField: '_id',
                    foreignField: 'vendorId',
                    as: 'orders'
                }
            },
            {
                $unwind: {
                    path: '$orders',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$_id',
                    name: { $first: '$name' },
                    pincode: { $first: '$pincode' },
                    commissionRate: { $first: '$commissionRate' },
                    createdAt: { $first: '$createdAt' },
                    updatedAt: { $first: '$updatedAt' },
                    userId: { $first: '$userId' },
                    userName: { $first: '$userName' },
                    userEmail: { $first: '$userEmail' },
                    userPhone: { $first: '$userPhone' },
                    salesRep: { $first: '$salesRep' },
                    salesRepName: { $first: '$salesRepName' },
                    salesRepEmail: { $first: '$salesRepEmail' },
                    totalRevenue: {
                        $sum: {
                            $cond: {
                                if: { $eq: ['$orders.orderStatus', 'delivered'] },
                                then: '$orders.totalAmount',
                                else: 0
                            }
                        }
                    },
                    totalOrders: {
                        $sum: {
                            $cond: {
                                if: { $eq: ['$orders.orderStatus', 'placed'] },
                                then: 1,
                                else: 0
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    pincode: 1,
                    commissionRate: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    userId: 1,
                    userName: 1,
                    userEmail: 1,
                    userPhone: 1,
                    salesRep: 1,
                    salesRepName: 1,
                    salesRepEmail:1,
                    totalRevenue: 1,
                    totalOrders: 1
                }
            }
        ];

        if (sortByRevenue === 'lowToHigh') {
            pipeline.push({ $sort: { totalRevenue: 1 } });
        } else {
            pipeline.push({ $sort: { totalRevenue: -1 } });
        }

        const vendorsWithStats = await Vendor.aggregate(pipeline);
        res.status(200).json(vendorsWithStats);
    } catch (error) {
        console.error("Error fetching vendors with analytics:", error);
        res.status(500).json({ message: "Server error fetching vendors with analytics" });
    }
};


/**
 * @desc Get single vendor by ID
 * @route GET /api/vendors/:id
 * @access Private/Admin, Franchise-Admin, Vendor (self)
 */
export const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate(
      "userId",
      "name email phone"
    );

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Authorization check: Only admin/franchise-admin or the vendor themselves can view
    if (
      req.user.roles.includes("admin") ||
      req.user.roles.includes("franchise-admin") ||
      vendor.userId.toString() === req.user.id
    ) {
      res.status(200).json(vendor);
    } else {
      res
        .status(403)
        .json({ message: "Not authorized to view this vendor profile" });
    }
  } catch (error) {
    console.error("Error fetching vendor by ID:", error);
    // Handle CastError for invalid IDs
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid vendor ID" });
    }
    res.status(500).json({ message: "Server error fetching vendor" });
  }
};

/**
 * @desc Update vendor details
 * @route PUT /api/vendors/:id
 * @access Private/Admin, Franchise-Admin, Vendor (self)
 */
export const updateVendor = async (req, res) => {
  const { name, pincode, commissionRate } = req.body; // userId should not be updated via this route

  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Authorization check: Only admin/franchise-admin or the vendor themselves can update
    if (
      req.user.roles.includes("admin") ||
      req.user.roles.includes("franchise-admin") ||
      vendor.userId.toString() === req.user.id
    ) {
      vendor.name = name || vendor.name;
      vendor.pincode = pincode || vendor.pincode;
      vendor.commissionRate = commissionRate || vendor.commissionRate;

      const updatedVendor = await vendor.save();

      res.status(200).json({
        message: "Vendor updated successfully",
        vendor: {
          _id: updatedVendor._id,
          name: updatedVendor.name,
          userId: updatedVendor.userId,
          pincode: updatedVendor.pincode,
          commissionRate: updatedVendor.commissionRate,
        },
      });
    } else {
      res
        .status(403)
        .json({ message: "Not authorized to update this vendor profile" });
    }
  } catch (error) {
    console.error("Error updating vendor:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid vendor ID" });
    }
    res.status(500).json({ message: "Server error updating vendor" });
  }
};

/**
 * @desc Delete a vendor
 * @route DELETE /api/vendors/:id
 * @access Private/Admin, Franchise-Admin
 */
export const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Find the associated user and remove 'vendor' role
    const user = await User.findById(vendor.userId);
    if (user) {
      user.roles = user.roles.filter((role) => role !== "vendor");
      await user.save();
    }

    await vendor.deleteOne(); // Use deleteOne() for Mongoose 6+

    res.status(200).json({ message: "Vendor removed successfully" });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid vendor ID" });
    }
    res.status(500).json({ message: "Server error deleting vendor" });
  }
};

/**
 * @desc Get vendors assigned to a specific Sales Rep (ID provided in body)
 * @route POST /api/vendors/assigned-to-salesrep
 * @access Private/Admin, Franchise-Admin, Sales Rep (self-query only)
 */
export const getVendorsForSalesRep = async (req, res) => {
  const { salesRepId } = req.body; // Take salesRepId from request body

  try {
    // 1. Validate salesRepId
    if (!salesRepId) {
      return res
        .status(400)
        .json({ message: "salesRepId is required in the request body." });
    }
    if (!mongoose.Types.ObjectId.isValid(salesRepId)) {
      return res.status(400).json({ message: "Invalid salesRepId format." });
    }

    // 2. Fetch Vendors
    const vendors = await Vendor.find({ salesRep: salesRepId })
      .populate("userId", "name email phone")
      .populate("salesRep", "name email"); // Populate salesRep details for clarity

    if (vendors.length === 0) {
      return res
        .status(404)
        .json({
          message: `No vendors found assigned to sales representative with ID: ${salesRepId}.`,
        });
    }

    res.status(200).json(vendors);
  } catch (error) {
    console.error("Error fetching vendors for sales rep:", error);
    res
      .status(500)
      .json({ message: "Server error fetching assigned vendors." });
  }
};
