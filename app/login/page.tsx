'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Crown, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[rgba(124,58,237,0.06)] blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.3)]">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              Checkmate <span className="bg-gradient-to-r from-[#a855f7] to-[#06b6d4] bg-clip-text text-transparent">AI</span>
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#f1f5f9] mb-2">Welcome back</h1>
          <p className="text-[#94a3b8]">Sign in to continue your chess journey</p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-[rgba(148,163,184,0.1)] bg-[rgba(15,15,26,0.8)] backdrop-blur-xl p-8 shadow-[0_8px_48px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[rgba(8,8,16,0.8)] border border-[rgba(148,163,184,0.1)] rounded-xl text-[#f1f5f9] text-sm placeholder-[#475569] focus:outline-none focus:border-[rgba(124,58,237,0.5)] focus:ring-1 focus:ring-[rgba(124,58,237,0.3)] transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-[rgba(8,8,16,0.8)] border border-[rgba(148,163,184,0.1)] rounded-xl text-[#f1f5f9] text-sm placeholder-[#475569] focus:outline-none focus:border-[rgba(124,58,237,0.5)] focus:ring-1 focus:ring-[rgba(124,58,237,0.3)] transition-all"
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#94a3b8] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-sm text-[#ef4444]">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-5 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white font-semibold rounded-xl shadow-[0_4px_16px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_24px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-[#64748b] mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#a855f7] hover:text-[#c084fc] font-medium transition-colors">
            Create one free
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
