import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not set. Using a dev fallback secret. Do NOT use in production.');
}

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: '7d',
  });
}

function sanitizeUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user);
    return res.status(201).json({ success: true, message: 'User registered', token, user: sanitizeUser(user) });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(user);
    return res.json({ success: true, message: 'Login successful', token, user: sanitizeUser(user) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const rawEmail = (req.body?.email ?? '').toString();
    const rawPassword = (req.body?.password ?? '').toString();
    const email = rawEmail.trim();
    const password = rawPassword.trim();
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').replace(/^['"]|['"]$/g, '').trim();
    const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || '').replace(/^['"]|['"]$/g, '');
    const ADMIN_PASSWORD_HASH = (process.env.ADMIN_PASSWORD_HASH || '').replace(/^['"]|['"]$/g, '');

    // Prefer .env admin if email matches ADMIN_EMAIL
    if (ADMIN_EMAIL && email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      let ok = false;
      if (ADMIN_PASSWORD_HASH) {
        try {
          ok = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
        } catch (_) {
          ok = false;
        }
      } else if (ADMIN_PASSWORD) {
        ok = password === ADMIN_PASSWORD;
      }

      if (!ok) {
        return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
      }

      const pseudoAdmin = {
        _id: 'env-admin',
        name: process.env.ADMIN_NAME || 'Admin',
        email: ADMIN_EMAIL,
        role: 'admin',
        avatar: undefined,
        createdAt: undefined,
        updatedAt: undefined,
      };
      const token = signToken(pseudoAdmin);
      return res.json({ success: true, message: 'Admin login successful', token, user: pseudoAdmin });
    }

    // Fallback: check database admin
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const token = signToken(user);
    return res.json({ success: true, message: 'Admin login successful', token, user: sanitizeUser(user) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
};
