import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables relative to backend dir
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const uri = (process.env.MONGODB_URI || '').replace(/^['"]|['"]$/g, '');
const dbName = process.env.DB_NAME && process.env.DB_NAME.trim();

if (!uri) {
  console.error('Missing MONGODB_URI in environment. Please set it in backend/.env');
  process.exit(1);
}

export async function connectDB() {
  try {
    const options = { serverSelectionTimeoutMS: 10000 };
    if (dbName) options.dbName = dbName;
    await mongoose.connect(uri, options);
    const { host, name } = mongoose.connection;
    console.log(`MongoDB connected: ${host}/${name}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  } catch (err) {
    const details = err?.message || String(err);
    console.error('MongoDB connection error:', details);
    if (err?.reason || err?.code || err?.name) {
      console.error('Details:', {
        name: err.name,
        code: err.code,
        reason: err.reason?.message || err.reason,
      });
    }
    throw err;
  }
}
