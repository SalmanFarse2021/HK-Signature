import express from 'express';
import { requireAdmin } from '../middleware/adminAuth.js';
import { listCustomers, getCustomer, updateCustomer, notifyCustomer, blacklistCustomer } from '../controller/customerAdminController.js';

const router = express.Router();

router.get('/admin/customers', requireAdmin, listCustomers);
router.get('/admin/customers/:id', requireAdmin, getCustomer);
router.put('/admin/customers/:id', requireAdmin, updateCustomer);
router.post('/admin/customers/:id/notify', requireAdmin, notifyCustomer);
router.post('/admin/customers/:id/blacklist', requireAdmin, blacklistCustomer);

export default router;

