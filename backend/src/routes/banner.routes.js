// ============================
// File: routes/banner.routes.js
// ============================
import express from 'express';
import {
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  deleteBanner
} from '../controllers/banner.controller.js';

const router = express.Router();

// Banner CRUD routes
router.post('/', createBanner);       // Create a new banner
router.get('/', getBanners);         // Get all banners
router.get('/:id', getBannerById);   // Get a single banner by ID
router.put('/:id', updateBanner);     // Update an existing banner
router.delete('/:id', deleteBanner); // Delete a banner

export default router;
