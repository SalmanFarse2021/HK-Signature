import express from 'express';
import { startGoogleAuth, handleGoogleCallback, getMe, requireAuth } from '../controller/authController.js';

const router = express.Router();

// Google OAuth
router.get('/auth/google', startGoogleAuth);
router.get('/auth/google/callback', handleGoogleCallback);

// Current user from JWT
router.get('/auth/me', requireAuth, getMe);

export default router;

