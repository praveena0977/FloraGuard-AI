import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User as UserIcon, ArrowRight, ArrowLeft, Leaf, AlertCircle, CheckCircle, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthPageProps {
  onLogin: (email: string, password: string) => Promise<string | null>;
  onRegister: (name: string, email: string, password: string) => Promise<string | null>;
}

type ViewMode = 'login' | 'register' | 'forgot';

export function AuthPage({ onLogin, onRegister }: AuthPageProps) {
  const [view, setView] = useState<ViewMode>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const clearMessages = () => { setError(''); setSuccess(''); };

  const switchView = (v: ViewMode) => {
    setView(v);
    clearMessages();
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setSubmitting(true);

    let err: string | null;
    if (view === 'login') {
      err = await onLogin(email, password);
    } else {
      err = await onRegister(name, email, password);
    }

    setSubmitting(false);
    if (err) {
      setError(err);
    } else {
      navigate('/dashboard');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Reset failed');
      } else {
        setSuccess(data.message || 'Password reset successfully!');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setError('Network error. Is the server running?');
    }
    setSubmitting(false);
  };

  const heading = view === 'login' ? 'Welcome Back' : view === 'register' ? 'Join FloraGuard' : 'Reset Password';
  const subtitle = view === 'login'
    ? 'Enter your details to access your garden.'
    : view === 'register'
      ? 'Start protecting your plants today.'
      : 'Enter your email and choose a new password.';

  return (
    <div className="min-h-screen flex items-center justify-center p-6 pt-20 leaf-gradient">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl mx-auto mb-4">
            {view === 'forgot' ? <KeyRound size={32} /> : <Leaf size={32} />}
          </div>
          <h1 className="font-serif text-3xl font-bold text-emerald-950">{heading}</h1>
          <p className="text-gray-500 mt-2">{subtitle}</p>
        </div>

        <div className="glass p-8 rounded-[2.5rem] shadow-2xl">
          <AnimatePresence mode="wait">
            {/* ---------- Error banner ---------- */}
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3"
              >
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* ---------- Success banner ---------- */}
            {success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3"
              >
                <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-emerald-700">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===== LOGIN / REGISTER FORM ===== */}
          {view !== 'forgot' ? (
            <form onSubmit={handleAuthSubmit} className="space-y-5">
              {view === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-white/50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hello@example.com"
                    className="w-full bg-white/50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    className="w-full bg-white/50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>

              {view === 'login' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => switchView('forgot')}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xl hover:shadow-emerald-200 active:scale-[0.98] mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {view === 'login' ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  <>
                    {view === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-500">
                  {view === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                  <button
                    type="button"
                    onClick={() => switchView(view === 'login' ? 'register' : 'login')}
                    className="font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    {view === 'login' ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* ===== FORGOT PASSWORD FORM ===== */
            <form onSubmit={handleResetSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hello@example.com"
                    className="w-full bg-white/50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    className="w-full bg-white/50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    className="w-full bg-white/50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xl hover:shadow-emerald-200 active:scale-[0.98] mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700"
                >
                  <ArrowLeft size={16} />
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
