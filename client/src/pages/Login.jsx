import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Newspaper, Mail, Lock, User, AlertCircle } from 'lucide-react';

const Login = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isStaffRole = (role) => {
    return ['Super Admin', 'Admin', 'Editor', 'Reporter', 'Moderator', 'SEO Manager'].includes(role);
  };

  // Automatically redirect if already logged in or profile resolved
  React.useEffect(() => {
    if (user) {
      const target = location.state?.from?.pathname || (isStaffRole(user.role) ? '/admin' : '/');
      navigate(target, { replace: true });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isLoginMode) {
        const res = await login(email, password);
        if (res.success) {
          const target = location.state?.from?.pathname || (isStaffRole(res.user?.role) ? '/admin' : '/');
          navigate(target, { replace: true });
        } else {
          setError(res.message || 'Login details incorrect.');
        }
      } else {
        const res = await register(name, email, password);
        if (res.success) {
          const target = isStaffRole(res.user?.role) ? '/admin' : '/';
          navigate(target, { replace: true });
        } else {
          setError(res.message || 'Registration failed.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-[#121212] border border-gray-200 dark:border-neutral-800 p-8 rounded-2xl shadow-xs">
        
        {/* Brand logo header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 mb-4">
            <Newspaper className="h-10 w-10 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-black text-gray-950 dark:text-white">
            {isLoginMode ? 'দৈনিক দর্পণ অ্যাকাউন্টে লগইন' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
          </h2>
          <p className="mt-2 text-xs text-gray-500 dark:text-neutral-400">
            {isLoginMode ? 'প্যানেল অ্যাক্সেস করতে আপনার পরিচয় দিন' : 'আমাদের নিউজ পরিবারের অংশ হোন'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 p-3 rounded-lg text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginMode && (
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-neutral-300 block mb-1">পূর্ণ নাম *</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="আপনার নাম..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full text-sm border border-gray-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#18181b] text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-neutral-300 block mb-1">ইমেইল ঠিকানা *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 pr-4 py-2 w-full text-sm border border-gray-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#18181b] text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-gray-700 dark:text-neutral-300">পাসওয়ার্ড *</label>
              {isLoginMode && (
                <a href="#" className="text-[10px] font-bold text-red-600 dark:text-red-400 hover:underline">
                  পাসওয়ার্ড ভুলে গেছেন?
                </a>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-4 py-2 w-full text-sm border border-gray-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#18181b] text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-red-600 text-white hover:bg-red-700 font-bold text-sm rounded-xl shadow transition-colors"
          >
            {submitting ? '...' : (isLoginMode ? 'লগইন করুন' : 'নিবন্ধন করুন')}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-gray-200 dark:border-neutral-800 text-xs">
          <button
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="font-bold text-red-600 dark:text-red-400 hover:underline"
          >
            {isLoginMode ? 'নতুন অ্যাকাউন্ট তৈরি করতে চান?' : 'ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন'}
          </button>
        </div>
        
        {/* Hint for readers / testers */}
        <div className="p-4 bg-gray-50 dark:bg-[#18181b] rounded-xl border border-gray-200 dark:border-neutral-800 text-[10px] text-gray-600 dark:text-neutral-400 leading-normal">
          <p className="font-extrabold uppercase mb-1 text-gray-800 dark:text-neutral-200">Tester Credentials (Seeded):</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li><strong>Super Admin:</strong> superadmin@news.com (password123)</li>
            <li><strong>Editor:</strong> editor@news.com (password123)</li>
            <li><strong>Reporter:</strong> reporter@news.com (password123)</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default Login;
