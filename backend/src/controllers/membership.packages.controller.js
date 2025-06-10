import { MembershipPackages } from "../models/MembershipPackages.model.js";
import { Membership} from "../models/Membership.model.js";

/**
 * @desc    Create a new membership package
 * @route   POST /api/membership-packages/create
 * @access  Public / Admin (depends on auth logic)
 */
export const createMembershipPackage = async (req, res) => {
  try {
    const { name, validityInDays, description, packageAmount,miscellaneousAmount } = req.body;

    const existing = await MembershipPackages.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Package with this name already exists" });
    }

    const newPackage = new MembershipPackages({
      name,
      validityInDays,
      description,
      packageAmount,
      miscellaneousAmount
    });

    await newPackage.save();

    res.status(201).json({ message: "Membership Package created", data: newPackage });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



/**
 * @desc    Get all membership packages with total users enrolled & total amount collected
 * @route   GET /api/membership-packages/stats
 * @access  Public / Admin
 */export const getMembershipPackagesWithStats = async (req, res) => {
  try {
    const packages = await MembershipPackages.find();

    // Get stats only for valid package references (non-null)
    const stats = await Membership.aggregate([
      {
        $match: {
          membershipPackageId: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$membershipPackageId",
          totalUsers: { $sum: 1 },
          totalAmount: { $sum: "$amountPaid" },
        },
      },
    ]);

    const statsMap = {};
    stats.forEach(stat => {
      statsMap[stat._id.toString()] = stat;
    });

    // Merge stats into the package data
    const result = packages.map(pkg => {
      const stat = statsMap[pkg._id.toString()] || {
        totalUsers: 0,
        totalAmount: 0,
      };

      return {
        _id: pkg._id,
        name: pkg.name,
        packageAmount: pkg.packageAmount,
        validityInDays: pkg.validityInDays,
        createdAt: pkg.createdAt,
        description:pkg.description,
        miscellaneousAmount: pkg.miscellaneousAmount,
        totalUsersEnrolled: stat.totalUsers,
        totalAmountCollected: stat.totalAmount,
      };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



/**
 * @desc    Update a membership package by ID
 * @route   PUT /api/membership-packages/update/:id
 * @access  Public / Admin
 */
export const updateMembershipPackage = async (req, res) => {
  try {
    const packageId = req.params.packageId;

    const updated = await MembershipPackages.findByIdAndUpdate(packageId, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Package not found" });
    }

    res.json({ message: "Package updated successfully", data: updated });
  } catch (error) {
    console.error("Error updating membership package:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Delete a membership package by ID
 * @route   DELETE /api/membership-packages/delete/:id
 * @access  Public / Admin
 */
// export const deleteMembershipPackage = async (req, res) => {
//   try {
//     const packageId = req.params.id;

//     const deleted = await MembershipPackages.findByIdAndDelete(packageId);

//     if (!deleted) {
//       return res.status(404).json({ message: "Package not found" });
//     }

//     res.json({ message: "Package deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };
