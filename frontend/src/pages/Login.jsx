import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BASE_URL, loginUser, registerUser } from '../api/client.js';

const Login = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/profile';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login'); // explicit UI-driven mode
  const mail = email.trim().toLowerCase();
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('auth:user')); } catch { return null; }
  });

  useEffect(() => {
    // Handle SSO callback: token in query, fetch profile and persist
    (async () => {
      const token = params.get('token');
      if (token && !user) {
        try {
          localStorage.setItem('auth:token', token);
          const res = await fetch(new URL('/api/auth/me', BASE_URL), {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
          });
          if (res.ok) {
            const data = await res.json();
            const u = data.user || data?.data?.user || null;
            if (u) {
              localStorage.setItem('auth:user', JSON.stringify(u));
              setUser(u);
              navigate(redirect, { replace: true });
              return;
            }
          }
        } catch {
          // fall through to normal flow
        }
      }
    })();
  }, [params, user, navigate, redirect]);

  useEffect(() => {
    // If we already have a token but no user loaded (e.g., returning tab), fetch profile
    (async () => {
      if (user) return;
      const token = localStorage.getItem('auth:token');
      if (!token) return;
      try {
        const res = await fetch(new URL('/api/auth/me', BASE_URL), {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          const u = data.user || data?.data?.user || null;
          if (u) {
            localStorage.setItem('auth:user', JSON.stringify(u));
            setUser(u);
            navigate(redirect, { replace: true });
          }
        }
      } catch {
        // ignore
      }
    })();
  }, [user, navigate, redirect]);

  useEffect(() => {
    if (user) {
      // Already logged in: redirect to requested page
      navigate(redirect, { replace: true });
    }
  }, [user, redirect, navigate]);

  const persistSession = (token, u) => {
    if (token) {
      try { localStorage.setItem('auth:token', token); } catch { }
    }
    if (u) {
      try { localStorage.setItem('auth:user', JSON.stringify(u)); } catch { }
      setUser(u);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!mail || !password) { setError('Please enter email and password.'); return; }
    setError('');
    setLoading(true);
    try {
      const data = await loginUser({ email: mail, password });
      if (!data?.token || !data?.user) throw new Error('Login failed');
      persistSession(data.token, data.user);
      navigate(redirect || '/profile', { replace: true });
    } catch (err) {
      setError(err?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!mail) { setError('Please enter a valid email.'); return; }
    if (!password) { setError('Please choose a password.'); return; }
    setError('');
    setLoading(true);
    try {
      const data = await registerUser({ name: name.trim(), email: mail, password });
      if (!data?.token || !data?.user) throw new Error('Registration failed');
      persistSession(data.token, data.user);
      navigate(redirect || '/profile', { replace: true });
    } catch (err) {
      setError(err?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const onSubmit = (e) => {
    if (mode === 'login') {
      return handleLogin(e);
    }
    return handleRegister(e);
  };

  const logout = () => {
    try { localStorage.removeItem('auth:user'); } catch { }
    try { localStorage.removeItem('auth:token'); } catch { }
    setUser(null);
    setMode('login');
  };

  if (user) {
    return (
      <main className="bg-white">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">You’re signed in</h1>
          <p className="mt-2 text-sm text-gray-700">Welcome, {user.name || user.email}.</p>
          <div className="mt-6 flex gap-3">
            <button onClick={() => navigate('/profile')} className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900">Profile</button>
            <button onClick={logout} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Sign out</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {mode === 'login' ? (
          <>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Sign in</h1>
            <p className="mt-2 text-sm text-gray-600">Welcome back. Enter your email and password.</p>
            <form onSubmit={(e) => { setMode('login'); onSubmit(e); }} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30" />
              </div>
              {error && <div className="mt-1 text-sm text-red-600">{error}</div>}
              <button type="submit" disabled={loading} className="w-full rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50">
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
            <a
              href={`${BASE_URL}/api/auth/google?redirect=${encodeURIComponent(redirect)}`}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                <path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.7-2.6-5.7-5.7S8.9 6 12 6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.9 3.8 14.7 3 12 3 6.9 3 2.7 7.2 2.7 12.3S6.9 21.6 12 21.6c6.9 0 9.3-4.8 9.3-7.2 0-.5-.1-.9-.1-1.2H12z" />
              </svg>
              Continue with Google
            </a>
            <p className="mt-3 text-xs text-gray-600">
              Don’t have an account?{' '}
              <button type="button" onClick={() => { setError(''); setName(''); setPassword(''); }} className="underline" aria-label="Register" onMouseDown={() => setMode('register')}>
                Register
              </button>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Register</h1>
            <p className="mt-2 text-sm text-gray-600">Create your account to continue.</p>
            <form onSubmit={(e) => { setMode('register'); onSubmit(e); }} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30" />
              </div>
              {error && <div className="mt-1 text-sm text-red-600">{error}</div>}
              <button type="submit" disabled={loading} className="w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">
                {loading ? 'Signing up…' : 'Sign up'}
              </button>
            </form>
            <a
              href={`${BASE_URL}/api/auth/google?redirect=${encodeURIComponent(redirect)}`}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                <path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.7-2.6-5.7-5.7S8.9 6 12 6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.9 3.8 14.7 3 12 3 6.9 3 2.7 7.2 2.7 12.3S6.9 21.6 12 21.6c6.9 0 9.3-4.8 9.3-7.2 0-.5-.1-.9-.1-1.2H12z" />
              </svg>
              Continue with Google
            </a>
            <p className="mt-3 text-xs text-gray-600">
              Already have an account?{' '}
              <button type="button" onClick={() => { setError(''); setPassword(''); }} className="underline" aria-label="Sign in" onMouseDown={() => setMode('login')}>
                Sign in
              </button>
            </p>
          </>
        )}
      </div>
    </main>
  );
};

export default Login;
