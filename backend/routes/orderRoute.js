import express from 'express';
import { createOrder, listOrders, getOrder, updateOrderStatus, exportOrdersCsv, invoicePdf, labelPdf, markRefund, markReturn } from '../controller/orderController.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// Public: create order (frontend checkout)
router.post('/orders', createOrder);

// Admin: list, view, update status
router.get('/orders', requireAdmin, listOrders);
router.get('/orders/:id', requireAdmin, getOrder);
router.put('/orders/:id/status', requireAdmin, updateOrderStatus);
router.put('/orders/:id/refund', requireAdmin, markRefund);
router.put('/orders/:id/return', requireAdmin, markReturn);
router.get('/orders/export', requireAdmin, exportOrdersCsv);
router.get('/orders/:id/invoice', requireAdmin, invoicePdf);
router.get('/orders/:id/label', requireAdmin, labelPdf);

export default router;
