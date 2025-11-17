import express from 'express';
import { generateTextHandler } from '../controller/aiController.js';

const router = express.Router();

router.post('/ai/generate', express.json(), generateTextHandler);

export default router;

