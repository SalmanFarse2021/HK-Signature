import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { authenticate } from '../middleware/adminAuth.js';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

const CLIENT_ID = (process.env.GOOGLE_CLIENT_ID || '').trim();
const CLIENT_SECRET = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const SERVER_PORT = process.env.PORT || 5000;
const BACKEND_BASE = process.env.BACKEND_BASE_URL || `http://localhost:${SERVER_PORT}`;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${BACKEND_BASE}/api/auth/google/callback`;
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';

// Simple in-memory state store with TTL (5 minutes)
const stateStore = new Map(); // state -> expiresAt
const STATE_TTL_MS = 5 * 60 * 1000;

function createState(payload) {
  const rand = crypto.randomBytes(16).toString('hex');
  const data = { s: rand, r: payload?.r || '/' };
  const encoded = Buffer.from(JSON.stringify(data)).toString('base64url');
  stateStore.set(rand, Date.now() + STATE_TTL_MS);
  return encoded;
}

function consumeState(encoded) {
  try {
    const data = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (!data || !data.s) return null;
    const exp = stateStore.get(data.s);
    if (!exp || exp < Date.now()) return null;
    stateStore.delete(data.s);
    return data; // { s, r }
  } catch (_) {
    return null;
  }
}

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role || 'user' }, JWT_SECRET, { expiresIn: '7d' });
}

export async function startGoogleAuth(req, res) {
  try {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return res.status(500).json({ success: false, message: 'Google OAuth not configured' });
    }
    const redirect = (req.query.redirect || '/').toString();
    const state = createState({ r: redirect });
    const url = new URL(GOOGLE_AUTH_URL);
    url.searchParams.set('client_id', CLIENT_ID);
    url.searchParams.set('redirect_uri', REDIRECT_URI);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'openid email profile');
    url.searchParams.set('state', state);
    url.searchParams.set('include_granted_scopes', 'true');
    url.searchParams.set('access_type', 'offline');
    // Optional: url.searchParams.set('prompt', 'consent');
    return res.redirect(url.toString());
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Auth error' });
  }
}

export async function handleGoogleCallback(req, res) {
  try {
    const code = (req.query.code || '').toString();
    const stateEncoded = (req.query.state || '').toString();
    const st = consumeState(stateEncoded);
    if (!st) {
      return res.status(400).json({ success: false, message: 'Invalid state' });
    }
    if (!code) {
      return res.status(400).json({ success: false, message: 'Missing code' });
    }

    // Exchange code for tokens
    const body = new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    });
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!tokenRes.ok) {
      const txt = await tokenRes.text();
      return res.status(500).json({ success: false, message: `Token exchange failed: ${tokenRes.status}`, details: txt });
    }
    const tokens = await tokenRes.json();
    const accessToken = tokens.access_token;
    if (!accessToken) return res.status(500).json({ success: false, message: 'No access token' });

    // Fetch profile
    const profileRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!profileRes.ok) {
      const txt = await profileRes.text();
      return res.status(500).json({ success: false, message: `Profile fetch failed: ${profileRes.status}`, details: txt });
    }
    const profile = await profileRes.json();
    const email = (profile.email || '').toLowerCase();
    const name = profile.name || email.split('@')[0];
    const picture = profile.picture;
    if (!email) return res.status(400).json({ success: false, message: 'No email from Google' });

    // Upsert user
    let user = await User.findOne({ email });
    if (!user) {
      const randomPass = crypto.randomBytes(12).toString('hex');
      user = await User.create({ name, email, password: randomPass, avatar: { url: picture } });
    } else {
      // Lightweight avatar/name update
      const changed = {};
      if (!user.name && name) changed.name = name;
      if (picture) changed.avatar = { ...(user.avatar || {}), url: picture };
      if (Object.keys(changed).length) {
        Object.assign(user, changed);
        await user.save();
      }
    }

    const token = signToken(user);
    // Optionally set an httpOnly cookie too
    res.cookie?.('auth_token', token, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7 * 24 * 3600 * 1000 });

    // Redirect back to frontend with token; frontend will fetch /api/auth/me
    const final = new URL('/login', FRONTEND_URL);
    final.searchParams.set('token', token);
    if (st.r) final.searchParams.set('redirect', st.r);
    return res.redirect(final.toString());
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Callback error' });
  }
}

export async function getMe(req, res) {
  try {
    // authenticate middleware has set req.user = { id, role }
    if (!req.user?.id) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      address: user.address,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }});
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}

export const requireAuth = authenticate; // reuse existing middleware
