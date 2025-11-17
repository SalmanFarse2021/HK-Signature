import express from 'express';
import { registerUser, loginUser, adminLogin } from '../controller/userController.js';
import { requireAuth } from '../controller/authController.js';
import { getSelfProfile, updateSelfProfile, changePassword, listMyOrders, uploadAvatar } from '../controller/profileController.js';
import { upload } from '../middleware/multer.js';

const router = express.Router();

// User auth
router.post('/users/register', registerUser);
router.post('/users/login', loginUser);

// Admin auth
router.post('/admin/login', adminLogin);

// Self profile
router.get('/users/me', requireAuth, getSelfProfile);
router.put('/users/me', requireAuth, updateSelfProfile);
router.post('/users/me/password', requireAuth, changePassword);
router.get('/users/me/orders', requireAuth, listMyOrders);
router.post('/users/me/avatar', requireAuth, upload.single('avatar'), uploadAvatar);

export default router;
