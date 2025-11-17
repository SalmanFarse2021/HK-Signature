import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env variables relative to backend dir
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const CLOUDINARY_CLOUD_NAME = (process.env.CLOUDINARY_CLOUD_NAME || '').replace(/^['"]|['"]$/g, '').trim();
const CLOUDINARY_API_KEY = (process.env.CLOUDINARY_API_KEY || '').replace(/^['"]|['"]$/g, '').trim();
const CLOUDINARY_API_SECRET = (process.env.CLOUDINARY_API_SECRET || '').replace(/^['"]|['"]$/g, '').trim();

function assertEnv() {
  const missing = [
    ['CLOUDINARY_CLOUD_NAME', CLOUDINARY_CLOUD_NAME],
    ['CLOUDINARY_API_KEY', CLOUDINARY_API_KEY],
    ['CLOUDINARY_API_SECRET', CLOUDINARY_API_SECRET],
  ]
    .filter(([_, v]) => !v)
    .map(([k]) => k);

  if (missing.length) {
    console.error(`Missing Cloudinary env vars: ${missing.join(', ')}`);
    process.exit(1);
  }
}

export async function connectCloudinary() {
  assertEnv();

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  // Optional: verify credentials with a lightweight ping.
  try {
    const res = await cloudinary.api.ping();
    if (res?.status === 'ok') {
      console.log(`Cloudinary connected: ${CLOUDINARY_CLOUD_NAME}`);
    } else {
      console.warn('Cloudinary ping returned unexpected result:', res);
    }
  } catch (err) {
    // Not fatal for boot, but useful for visibility.
    console.warn('Cloudinary ping failed (continuing):', err?.message || err);
  }

  return cloudinary;
}

export { cloudinary };
