import { Coupon } from "../models/CouponCode.model.js";

// ==============================
// ✅ Create Coupon
// ==============================
export const createCoupon = async (req, res) => {
  try {
    const { name, couponCode, discountPercent, expiryDate,isActive } = req.body;

    // Basic validation
    if (!couponCode || !discountPercent) {
      return res.status(400).json({
        success: false,
        message: "Coupon code and discount percent are required.",
      });
    }

    const existing = await Coupon.findOne({ couponCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists.",
      });
    }

    const coupon = await Coupon.create({
      name,
      couponCode,
      discountPercent,
      expiryDate,
      isActive: isActive || "active", // Default to "active" if not provided   
    });

    res.status(201).json({ success: true, message: "Coupon created.", coupon });
  } catch (error) {
    console.error("Error creating coupon:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create coupon: " + error.message,
    });
  }
};

// ==============================
// ✅ Get All Coupons
// ==============================
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ expiryDate: 1 });

    res.status(200).json({ success: true, coupons });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupons: " + error.message,
    });
  }
};

// ==============================
// ✅ Get Single Coupon by ID
// ==============================
export const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found." });
    }

    res.status(200).json({ success: true, coupon });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupon: " + error.message,
    });
  }
};

// ==============================
// ✅ Update Coupon
// ==============================
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedCoupon = await Coupon.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCoupon) {
      return res.status(404).json({ success: false, message: "Coupon not found." });
    }

    res.status(200).json({ success: true, message: "Coupon updated.", coupon: updatedCoupon });
  } catch (error) {
    console.error("Error updating coupon:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update coupon: " + error.message,
    });
  }
};

// ==============================
// ✅ Delete Coupon
// ==============================
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Coupon.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Coupon not found." });
    }

    res.status(200).json({ success: true, message: "Coupon deleted." });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete coupon: " + error.message,
    });
  }
};
