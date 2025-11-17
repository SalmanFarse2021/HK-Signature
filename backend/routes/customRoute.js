import express from 'express';
import { generateCustomImage } from '../controller/customController.js';

const router = express.Router();

router.post('/custom/generate-image', express.json(), generateCustomImage);

export default router;

