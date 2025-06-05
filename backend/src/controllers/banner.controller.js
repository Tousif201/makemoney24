// ===================================
// File: controllers/banner.controller.js
// ===================================
import { Banner } from '../models/Banner.model.js';
import mongoose from 'mongoose';

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * @desc Create a new banner
 * @route POST /api/banners
 * @access Public (or Private, e.g., Admin role)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createBanner = async (req, res) => {
  try {
    const { image, redirectTo } = req.body;

    // Basic validation
    if (!image || !image.url || !image.key) {
      return res.status(400).json({ message: 'Image URL and Key are required for a banner.' });
    }

    // Find the current highest sNo and increment for the new banner
    const latestBanner = await Banner.findOne().sort({ sNo: -1 }).limit(1);
    const nextSNo = latestBanner ? latestBanner.sNo + 1 : 1; // Start from 1 if no banners exist

    const newBanner = new Banner({
      image: {
        url: image.url,
        key: image.key
      },
      redirectTo,
      sNo: nextSNo, // Assign the calculated serial number
    });

    const savedBanner = await newBanner.save();
    res.status(201).json(savedBanner);
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Get all banners
 * @route GET /api/banners
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getBanners = async (req, res) => {
  try {
    // Sort by sNo in ascending order for correct display order
    const banners = await Banner.find().sort({ sNo: 1 });
    res.status(200).json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Get a single banner by ID
 * @route GET /api/banners/:id
 * @access Public
 * @param {Object} req - Express request object (params: id)
 * @param {Object} res - Express response object
 */
export const getBannerById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid Banner ID format.' });
    }

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found.' });
    }
    res.status(200).json(banner);
  } catch (error) {
    console.error('Error fetching banner by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Update an existing banner (excluding sNo here, handled by updateBannerOrder)
 * @route PUT /api/banners/:id
 * @access Public (or Private, e.g., Admin role)
 * @param {Object} req - Express request object (params: id, body: fields to update)
 * @param {Object} res - Express response object
 */
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { image, redirectTo } = req.body; // sNo is intentionally excluded here

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid Banner ID format.' });
    }

    const updateFields = {};
    if (image !== undefined) {
      if (!image || !image.url || !image.key) {
        return res.status(400).json({ message: 'Image URL and Key are required if updating image.' });
      }
      updateFields.image = {
        url: image.url,
        key: image.key
      };
    }
    if (redirectTo !== undefined) {
      updateFields.redirectTo = redirectTo;
    }

    // Prevent direct sNo update through this route
    // if (sNo !== undefined) {
    //   return res.status(400).json({ message: 'sNo cannot be updated via this route. Use /api/banners/order instead.' });
    // }

    const updatedBanner = await Banner.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedBanner) {
      return res.status(404).json({ message: 'Banner not found.' });
    }
    res.status(200).json(updatedBanner);
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Delete a banner
 * @route DELETE /api/banners/:id
 * @access Public (or Private, e.g., Admin role)
 * @param {Object} req - Express request object (params: id)
 * @param {Object} res - Express response object
 */
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid Banner ID format.' });
    }

    const deletedBanner = await Banner.findByIdAndDelete(id);

    if (!deletedBanner) {
      return res.status(404).json({ message: 'Banner not found.' });
    }

    // After deleting a banner, you might want to re-index the sNo values
    // of the remaining banners to maintain sequential order without gaps.
    // This is optional but can keep your sNo values tidy.
    await reindexBannerSNos();

    res.status(200).json({ message: 'Banner deleted successfully.' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Update the order of banners (for Drag and Drop)
 * @route PUT /api/banners/order
 * @access Public (or Private, e.g., Admin role)
 * @param {Object} req - Express request object (body: [{_id: String, sNo: Number}, ...])
 * @param {Object} res - Express response object
 */
export const updateBannerOrder = async (req, res) => {
  try {
    const { newOrder } = req.body; // Expects an array of { _id: 'bannerId', sNo: newSerialNo }

    if (!Array.isArray(newOrder) || newOrder.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty array for newOrder.' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const bulkOperations = newOrder.map(item => {
        if (!isValidObjectId(item._id) || typeof item.sNo !== 'number') {
          throw new Error('Invalid item format in newOrder array.');
        }
        return {
          updateOne: {
            filter: { _id: item._id },
            update: { $set: { sNo: item.sNo } }
          }
        };
      });

      await Banner.bulkWrite(bulkOperations, { session });

      await session.commitTransaction();
      res.status(200).json({ message: 'Banner order updated successfully.' });
    } catch (error) {
      await session.abortTransaction();
      console.error('Error updating banner order during transaction:', error);
      res.status(500).json({ message: 'Failed to update banner order. Transaction aborted.', error: error.message });
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Error updating banner order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


/**
 * Helper function to re-index sNo values after a deletion to maintain sequential order.
 * This is an optional step but can prevent gaps in sNo values.
 * Called internally after a banner is deleted.
 */
const reindexBannerSNos = async () => {
  try {
    const banners = await Banner.find().sort({ sNo: 1 }); // Get all banners sorted by current sNo
    const bulkOperations = banners.map((banner, index) => ({
      updateOne: {
        filter: { _id: banner._id },
        update: { $set: { sNo: index + 1 } } // Assign new sequential sNo starting from 1
      }
    }));

    if (bulkOperations.length > 0) {
      await Banner.bulkWrite(bulkOperations);
      console.log('Banner sNos re-indexed successfully.');
    }
  } catch (error) {
    console.error('Error re-indexing banner sNos:', error);
    // You might want to log this but not necessarily return an error
    // to the client, as it's a background maintenance task.
  }
};
