import express from 'express';
import { requireAdmin } from '../middleware/adminAuth.js';
import { listCoupons, saveCoupon, deleteCoupon, listPromotions, savePromotion, deletePromotion, applyDiscounts, listActivePromotionsPublic } from '../controller/discountController.js';

const router = express.Router();

// Coupons
router.get('/admin/coupons', requireAdmin, listCoupons);
router.post('/admin/coupons', requireAdmin, saveCoupon);
router.put('/admin/coupons', requireAdmin, saveCoupon);
router.delete('/admin/coupons/:id', requireAdmin, deleteCoupon);

// Promotions
router.get('/admin/promotions', requireAdmin, listPromotions);
router.post('/admin/promotions', requireAdmin, savePromotion);
router.put('/admin/promotions', requireAdmin, savePromotion);
router.delete('/admin/promotions/:id', requireAdmin, deletePromotion);

// Public apply endpoint
router.post('/discounts/apply', applyDiscounts);
router.get('/promotions', listActivePromotionsPublic);

export default router;
