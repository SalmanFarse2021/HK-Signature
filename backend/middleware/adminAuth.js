import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function extractToken(req) {
  const auth = req.headers?.authorization || req.headers?.Authorization || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
  if (auth && !auth.includes(' ')) return auth.trim();
  const x = req.headers?.['x-auth-token'];
  if (typeof x === 'string' && x) return x.trim();
  return null;
}

export function authenticate(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, role, iat, exp }
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

export function requireAdmin(req, res, next) {
  authenticate(req, res, function onAuthDone(err) {
    if (err) return; // authenticate already handled the response
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    return next();
  });
}

export default requireAdmin;

