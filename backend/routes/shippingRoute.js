import express from 'express';
import { requireAdmin } from '../middleware/adminAuth.js';
import { getSettings, saveSettings, quoteShipping } from '../controller/shippingController.js';

const router = express.Router();

router.get('/admin/shipping', requireAdmin, getSettings);
router.put('/admin/shipping', requireAdmin, saveSettings);

// Public quote endpoint
router.get('/shipping/quote', quoteShipping);

export default router;

