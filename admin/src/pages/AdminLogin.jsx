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
      setTimeout(() => (window.location.href = '/'), 400);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      <ToastContainer position="top-right" />

      {/* Left Side - Form */}
      <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 xl:px-24">
        <div className="w-full max-w-sm mx-auto space-y-8">
          <div className="space-y-2">
            <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center text-white font-bold text-xl mb-6">
              H
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h1>
            <p className="text-gray-500">Enter your credentials to access the admin panel.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <a href="#" className="text-xs font-medium text-gray-600 hover:text-black">Forgot password?</a>
              </div>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white rounded-lg py-3 text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-xs text-center text-gray-500">
            &copy; {new Date().getFullYear()} HK Signature. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:block relative bg-gray-50">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2700&auto=format&fit=crop")' }}>
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
        </div>
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <blockquote className="text-2xl font-medium leading-relaxed">
            "Design is not just what it looks like and feels like. Design is how it works."
          </blockquote>
          <div className="mt-4 font-bold">— Steve Jobs</div>
        </div>
      </div>
    </div>
  );
}
