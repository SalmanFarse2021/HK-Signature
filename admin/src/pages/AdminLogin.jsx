import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminLogin() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Welcome back');
      setTimeout(() => (window.location.href = '/products'), 400);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-dvh grid place-items-center overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-100 via-sky-50 to-emerald-100" />
      <div className="absolute -z-10 blur-3xl opacity-40 bg-gradient-to-br from-indigo-400 to-emerald-400 h-64 w-64 rounded-full top-10 left-10" />
      <div className="absolute -z-10 blur-3xl opacity-40 bg-gradient-to-tr from-sky-400 to-purple-400 h-64 w-64 rounded-full bottom-10 right-10" />
      <ToastContainer position="top-right" />
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white/80 backdrop-blur rounded-xl border p-6 shadow-lg space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in to Admin</h1>
        <p className="text-sm text-gray-600">Use your admin credentials to continue.</p>
        <div className="space-y-1">
          <label className="label">Email</label>
          <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <label className="label">Password</label>
          <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading} className="w-full btn-primary">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
