import express from 'express';
import {
  addProduct,
  listProducts,
  getSingleProduct,
  removeProduct,
  updateProduct,
  uploadProductImages,
  exportProductsCsv,
  importProductsCsv,
} from '../controller/productController.js';
import { upload } from '../middleware/multer.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import uploadCsv from '../middleware/uploadCsv.js';
import { Router } from 'express';
import multer from 'multer';

const router = express.Router();

// Products
router.post('/products', requireAdmin, upload.array('images', 4), addProduct);
router.get('/products', listProducts);
router.get('/products/:id', getSingleProduct);
router.delete('/products/:id', requireAdmin, removeProduct);
router.put('/products/:id', requireAdmin, upload.array('images', 4), updateProduct);
router.post('/products/upload', requireAdmin, upload.array('images', 4), uploadProductImages);

// CSV import/export
router.get('/products/export', requireAdmin, exportProductsCsv);
router.post('/products/import', requireAdmin, uploadCsv.single('file'), importProductsCsv);

export default router;
