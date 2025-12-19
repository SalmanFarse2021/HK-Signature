const RAW_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
// If the site is served over HTTPS and the API base is HTTP, prefer same-origin + dev proxy
const API_BASE = (typeof window !== 'undefined' && window.location?.protocol === 'https:' && RAW_BASE.startsWith('http:'))
  ? ''
  : RAW_BASE;

function baseOrigin() {
  if (API_BASE) {
    // Smart replacement for mobile testing:
    // If we are on a LAN IP (not localhost), and the base is localhost, try to use the window's hostname with the base's port.
    if (typeof window !== 'undefined' && window.location?.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      try {
        const u = new URL(API_BASE);
        if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
          u.hostname = window.location.hostname;
          return u.toString().replace(/\/$/, '');
        }
      } catch { }
    }
    return API_BASE;
  }
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
  return 'http://localhost:4000';
}

export function apiUrl(path) {
  try {
    const base = baseOrigin();
    return new URL(path, base).toString();
  } catch (e) {
    // Fallback to relative path if URL construction fails (e.g. invalid base)
    return path;
  }
}
export const BASE_URL = API_BASE || baseOrigin();

export async function listProducts(params = {}) {
  const url = new URL('/api/products', baseOrigin());
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`Products fetch failed: ${res.status}`);
  return res.json();
}

export async function createOrder(payload) {
  const url = new URL('/api/orders', baseOrigin());
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Order create failed: ${res.status}`);
  return res.json();
}

export async function fetchPromotions() {
  const url = new URL('/api/promotions', baseOrigin());
  const res = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`Promotions fetch failed: ${res.status}`);
  return res.json();
}

// Authenticated user APIs (uses localStorage auth:token)
function authHeaders() {
  const t = localStorage.getItem('auth:token');
  const h = { Accept: 'application/json' };
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

export async function getMe() {
  const url = new URL('/api/users/me', baseOrigin());
  const res = await fetch(url.toString(), { headers: authHeaders() });
  if (!res.ok) throw new Error(`Me fetch failed: ${res.status}`);
  return res.json();
}

export async function loginUser({ email, password }) {
  const url = new URL('/api/users/login', baseOrigin());
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Login failed: ${res.status}`);
  return data;
}

export async function registerUser({ name, email, password }) {
  const url = new URL('/api/users/register', baseOrigin());
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Register failed: ${res.status}`);
  return data;
}

export async function updateMe(payload) {
  const url = new URL('/api/users/me', baseOrigin());
  const res = await fetch(url.toString(), {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Me update failed: ${res.status}`);
  return res.json();
}

export async function uploadAvatar(file) {
  const fd = new FormData();
  fd.append('avatar', file);
  const url = new URL('/api/users/me/avatar', baseOrigin());
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: authHeaders(),
    body: fd,
  });
  if (!res.ok) throw new Error(`Avatar upload failed: ${res.status}`);
  return res.json();
}

export async function changePasswordApi(payload) {
  const url = new URL('/api/users/me/password', baseOrigin());
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Password change failed: ${res.status}`);
  return res.json();
}

export async function listMyOrdersApi(params = {}) {
  const url = new URL('/api/users/me/orders', baseOrigin());
  Object.entries(params).forEach(([k, v]) => { if (v != null && v !== '') url.searchParams.set(k, v); });
  const res = await fetch(url.toString(), { headers: authHeaders() });
  if (!res.ok) throw new Error(`Orders fetch failed: ${res.status}`);
  return res.json();
}
