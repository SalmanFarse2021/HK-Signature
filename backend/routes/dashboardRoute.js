import express from 'express';
import { requireAdmin } from '../middleware/adminAuth.js';
import { getDashboard } from '../controller/dashboardController.js';

const router = express.Router();

router.get('/admin/dashboard', requireAdmin, getDashboard);

export default router;

