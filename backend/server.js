import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/mongodb.js';
import { connectCloudinary } from './config/cloudinary.js';
import userRoutes from './routes/userRoute.js';
import productRoutes from './routes/productRoute.js';
import orderRoutes from './routes/orderRoute.js';
import dashboardRoutes from './routes/dashboardRoute.js';
import customerRoutes from './routes/customerRoute.js';
import shippingRoutes from './routes/shippingRoute.js';
import discountRoutes from './routes/discountRoute.js';
import cmsRoutes from './routes/cmsRoute.js';
import authRoutes from './routes/authRoute.js';
import customRoutes from './routes/customRoute.js';
import aiRoutes from './routes/aiRoute.js';

// Load env (for PORT, etc.) relative to backend dir
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', async (req, res) => {
  res.json({ status: 'ok', service: 'e-commerce-api' });
});

// Routes
app.use('/api', userRoutes);
app.use('/api', authRoutes);
app.use('/api', productRoutes);
app.use('/api', orderRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', customerRoutes);
app.use('/api', shippingRoutes);
app.use('/api', discountRoutes);
app.use('/api', cmsRoutes);
app.use('/api', customRoutes);
app.use('/api', aiRoutes);

const PORT = process.env.PORT || 5000;

// Start server with async/await
async function start() {
  try {
    await connectCloudinary();

    // Start HTTP server first so health routes work even if DB is slow
    await new Promise((resolve) => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        resolve();
      });
    });

    // Connect to MongoDB with retry (non-blocking)
    const RETRY_MS = 10000;
    const connectWithRetry = async () => {
      try {
        await connectDB();
      } catch (err) {
        console.error(`DB connect failed: ${err?.message || err}. Retrying in ${RETRY_MS / 1000}s...`);
        setTimeout(connectWithRetry, RETRY_MS);
      }
    };
    connectWithRetry();
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

// Basic unhandled rejection handler
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
