import { User } from "../models/User.model.js";
import { sendEmail } from "../utils/nodeMailerOtp.js";
// import { v4 as uuidv4 } from "uuid";

export const createSalesRep = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      pincode,
      kycDocuments = [],
    } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already exists.",
      });
    }

    // Validate KYC document structure
    const validDocuments = Array.isArray(kycDocuments)
      ? kycDocuments.filter(
          (doc) =>
            doc.url &&
            doc.key &&
           
            typeof doc.url === "string" &&
            typeof doc.key === "string" 
            )
      : [];

    // Generate unique referral code
    const referralCode = `SR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newUser = await User.create({
      name,
      email,
      phone,
      password, // ⚠️ hash before save in production
      pincode,
      roles: ["sales-rep"],
      accountStatus: "active",
      referralCode,
      kycDocumentImage: validDocuments,
    });

    res.status(201).json({
      success: true,
      message: "Sales rep created successfully.",
      user: newUser,
    });
  } catch (error) {
    console.error("Error creating sales-rep:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};


export const getAllSalesReps = async (req, res) => {
  try {
    const salesReps = await User.find({ roles: "sales-rep" }).select("-password -otp");

    res.status(200).json({
      success: true,
      data: salesReps,
    });
  } catch (error) {
    console.error("Error fetching sales reps:", error);
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};


export const deleteSalesRep = async (req, res) => {
  try {
    const { id } = req.params;

    const salesRep = await User.findOne({ _id: id, roles: "sales-rep" });
    if (!salesRep) {
      return res.status(404).json({
        success: false,
        message: "Sales rep not found",
      });
    }

    await User.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: "Sales rep deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting sales rep:", error);
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};
