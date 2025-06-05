// ============================
// File: routes/banner.routes.js
// ============================
import express from 'express';
import {
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
  updateBannerOrder // Import the new controller function
} from '../controllers/banner.controller.js';

const router = express.Router();

router.put('/order', updateBannerOrder); // Update the order of multiple banners
// Banner CRUD routes
router.post('/', createBanner);       // Create a new banner
router.get('/', getBanners);         // Get all banners, now sorted by sNo
router.get('/:id', getBannerById);   // Get a single banner by ID
router.put('/:id', updateBanner);     // Update an existing banner (excluding sNo)
router.delete('/:id', deleteBanner); // Delete a banner


export default router;
