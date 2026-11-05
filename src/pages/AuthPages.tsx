import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Lock, Mail, User as UserIcon, Phone, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, quickLoginAs } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = (location.state as any)?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await login(email, password);
      if (res.success) {
        navigate(redirectPath);
      } else {
        setError(res.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'USER' | 'ADMIN') => {
    setLoading(true);
    setError(null);
    await quickLoginAs(role);
    setLoading(false);
    navigate(role === 'ADMIN' ? '/admin' : redirectPath);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif font-bold text-stone-900">Welcome Back</h1>
        <p className="text-xs text-stone-500">Sign in to your ShopEase profile to continue</p>
      </div>

      {/* Demo Credentials Fast-Fill Box */}
      <div className="p-4 bg-violet-50/70 border border-violet-200 rounded-2xl space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-violet-900">
          <Sparkles className="w-3.5 h-3.5 text-violet-600" />
          <span>Quick Evaluation Demo Access</span>
        </div>
        <p className="text-[11px] text-violet-800 leading-relaxed">
          Pre-configured credentials with BCrypt verification in MongoDB:
        </p>
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleDemoLogin('USER')}
            className="flex-1 py-1.5 px-3 bg-white border border-violet-200 text-violet-900 rounded-lg text-xs font-semibold hover:bg-violet-100/50 transition-colors cursor-pointer text-center"
          >
            Sign in as Customer
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('ADMIN')}
            className="flex-1 py-1.5 px-3 bg-violet-600 text-white rounded-lg text-xs font-semibold hover:bg-violet-700 transition-colors cursor-pointer text-center"
          >
            Sign in as Admin
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-sm">
        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1">Email Address</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full text-xs pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-violet-500"
            />
            <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-stone-700">Password</label>
            <span className="text-[11px] text-stone-400">BCrypt secured</span>
          </div>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-violet-500"
            />
            <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 disabled:opacity-50 transition-colors cursor-pointer shadow"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      <div className="text-center text-xs text-stone-500">
        Don't have an account yet?{' '}
        <Link to="/register" className="font-semibold text-violet-600 hover:text-violet-800 underline">
          Create Account
        </Link>
      </div>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminSecretKey, setAdminSecretKey] = useState('');
  const [showAdminSecretInput, setShowAdminSecretInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Full name, email, and password are required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await register({
        fullName,
        email,
        phone,
        password,
        confirmPassword,
        adminSecretKey: adminSecretKey.trim() || undefined
      });

      if (res.success) {
        navigate('/');
      } else {
        setError(res.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif font-bold text-stone-900">Create Account</h1>
        <p className="text-xs text-stone-500">Register with ShopEase for personalized orders and wishlist sync</p>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-sm">
        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1">Full Name</label>
          <div className="relative">
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="w-full text-xs pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-violet-500"
            />
            <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1">Email Address</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full text-xs pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-violet-500"
            />
            <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1">Phone Number</label>
          <div className="relative">
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full text-xs pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-violet-500"
            />
            <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1">Password (min. 6 characters)</label>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-violet-500"
            />
            <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1">Confirm Password</label>
          <div className="relative">
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-violet-500"
            />
            <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </div>
        </div>

        {/* Secure Admin Provisioning Key */}
        <div className="pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={() => setShowAdminSecretInput(!showAdminSecretInput)}
            className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
            <span>{showAdminSecretInput ? 'Hide Admin Provisioning Key' : 'Create with Admin Privileges?'}</span>
          </button>

          {showAdminSecretInput && (
            <div className="mt-2 space-y-1 animate-in fade-in">
              <label className="block text-[11px] font-medium text-stone-700">Admin Initialization Secret Key</label>
              <input
                type="password"
                value={adminSecretKey}
                onChange={e => setAdminSecretKey(e.target.value)}
                placeholder="Key: SHOPEASE_SUPER_ADMIN_2026"
                className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none font-mono"
              />
              <p className="text-[10px] text-stone-400">
                Default key for college demo evaluation: <code className="text-stone-600">SHOPEASE_SUPER_ADMIN_2026</code>
              </p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 disabled:opacity-50 transition-colors cursor-pointer shadow"
        >
          {loading ? 'Creating Account...' : 'Complete Registration'}
        </button>
      </form>

      <div className="text-center text-xs text-stone-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-violet-600 hover:text-violet-800 underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};
