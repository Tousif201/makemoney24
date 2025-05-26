// ===================================
// File: controllers/banner.controller.js
// ===================================
import { Banner } from '../models/Banner.model.js';
import mongoose from 'mongoose';

// Helper function to validate ObjectId (though not directly used for Banner ID, good practice for related IDs if any)
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

    const newBanner = new Banner({
      image: {
        url: image.url,
        key: image.key
      },
      redirectTo,
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
    const banners = await Banner.find().sort({ createdAt: -1 }); // Sort by newest first
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
 * @desc Update an existing banner
 * @route PUT /api/banners/:id
 * @access Public (or Private, e.g., Admin role)
 * @param {Object} req - Express request object (params: id, body: fields to update)
 * @param {Object} res - Express response object
 */
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { image, redirectTo } = req.body;

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

    const updatedBanner = await Banner.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true } // `new: true` returns the updated document, `runValidators` ensures schema validators run
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
    res.status(200).json({ message: 'Banner deleted successfully.' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
