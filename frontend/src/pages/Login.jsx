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
      <main className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h1 className="text-2xl font-serif font-medium text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-500">Signed in as <span className="font-semibold text-gray-900">{user.name || user.email}</span></p>
          <div className="mt-8 flex flex-col gap-3">
            <button onClick={() => navigate('/profile')} className="w-full rounded-xl bg-black px-4 py-3 text-sm font-bold text-white hover:bg-gray-800 transition-colors">Go to Profile</button>
            <button onClick={logout} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">Sign out</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="p-8 sm:p-10">
          {mode === 'login' ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-serif font-medium text-gray-900">Welcome Back</h1>
                <p className="mt-2 text-sm text-gray-500">Enter your details to access your account.</p>
              </div>

              <form onSubmit={(e) => { setMode('login'); onSubmit(e); }} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-black focus:bg-white focus:ring-0 transition-all"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Password</label>
                    <button type="button" className="text-xs text-gray-400 hover:text-black transition-colors">Forgot?</button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-black focus:bg-white focus:ring-0 transition-all"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-black px-4 py-3.5 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-black/20"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-white px-4 text-gray-400">Or continue with</span></div>
              </div>

              <a
                href={`${BASE_URL}/api/auth/google?redirect=${encodeURIComponent(redirect)}`}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="font-roboto">Sign in with Google</span>
              </a>

              <p className="mt-8 text-center text-sm text-gray-500">
                Don’t have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setError(''); setName(''); setPassword(''); setMode('register'); }}
                  className="font-bold text-black hover:underline"
                >
                  Create account
                </button>
              </p>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-serif font-medium text-gray-900">Create Account</h1>
                <p className="mt-2 text-sm text-gray-500">Join us to start your journey.</p>
              </div>

              <form onSubmit={(e) => { setMode('register'); onSubmit(e); }} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Full Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-black focus:bg-white focus:ring-0 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-black focus:bg-white focus:ring-0 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    required
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-black focus:bg-white focus:ring-0 transition-all"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-black px-4 py-3.5 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-black/20"
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-white px-4 text-gray-400">Or join with</span></div>
              </div>

              <a
                href={`${BASE_URL}/api/auth/google?redirect=${encodeURIComponent(redirect)}`}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="font-roboto">Sign up with Google</span>
              </a>

              <p className="mt-8 text-center text-sm text-gray-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setError(''); setPassword(''); setMode('login'); }}
                  className="font-bold text-black hover:underline"
                >
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default Login;
