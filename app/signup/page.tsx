'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Crown, Mail, Lock, Eye, EyeOff, Loader2, User, ArrowRight, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const perks = [
  'Full game analysis with Stockfish',
  'GPT-4 coaching explanations',
  'Progress tracking & analytics',
  'Chat with your AI coach',
];

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          data: { username },
        },
      });

      if (authError) {
        setError(authError.message);
      } else if (data.user && !data.session) {
        // Email confirmation required
        setSuccess(true);
      } else {
        // Auto-confirmed (e.g. during development)
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center p-8 rounded-2xl border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)]"
        >
          <CheckCircle className="w-14 h-14 text-[#22c55e] mx-auto mb-4" />
          <h2 className="text-2xl font-black mb-2">Check your email!</h2>
          <p className="text-[#94a3b8] mb-6">
            We sent a confirmation link to <strong className="text-[#f1f5f9]">{email}</strong>.
            Click the link to activate your account and start improving your chess.
          </p>
          <Link href="/login" className="text-[#a855f7] hover:underline text-sm font-medium">
            Back to sign in
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[rgba(124,58,237,0.06)] blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: Perks */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block"
        >
          <div className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">
              Checkmate <span className="bg-gradient-to-r from-[#a855f7] to-[#06b6d4] bg-clip-text text-transparent">AI</span>
            </span>
          </div>
          <h2 className="text-4xl font-black tracking-tight mb-4">
            Improve faster with{' '}
            <span className="bg-gradient-to-r from-[#a855f7] to-[#06b6d4] bg-clip-text text-transparent">
              AI coaching
            </span>
          </h2>
          <p className="text-[#94a3b8] mb-8 leading-relaxed">
            Join thousands of players who use Checkmate AI to understand their games and climb the rating ladder.
          </p>
          <div className="space-y-3">
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[rgba(124,58,237,0.2)] border border-[rgba(124,58,237,0.4)] flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3 h-3 text-[#a855f7]" />
                </div>
                <span className="text-sm text-[#94a3b8]">{perk}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">Checkmate AI</span>
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#f1f5f9] mb-1">Create your account</h1>
          <p className="text-[#94a3b8] text-sm mb-6">Free forever · No credit card required</p>

          <div className="rounded-2xl border border-[rgba(148,163,184,0.1)] bg-[rgba(15,15,26,0.8)] backdrop-blur-xl p-7 shadow-[0_8px_48px_rgba(0,0,0,0.5)]">
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[rgba(8,8,16,0.8)] border border-[rgba(148,163,184,0.1)] rounded-xl text-[#f1f5f9] text-sm placeholder-[#475569] focus:outline-none focus:border-[rgba(124,58,237,0.5)] focus:ring-1 focus:ring-[rgba(124,58,237,0.3)] transition-all"
                    placeholder="ChessKnight2024"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">Email</label>
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
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full pl-10 pr-12 py-3 bg-[rgba(8,8,16,0.8)] border border-[rgba(148,163,184,0.1)] rounded-xl text-[#f1f5f9] text-sm placeholder-[#475569] focus:outline-none focus:border-[rgba(124,58,237,0.5)] focus:ring-1 focus:ring-[rgba(124,58,237,0.3)] transition-all"
                    placeholder="At least 8 characters"
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

              {error && (
                <div className="p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-sm text-[#ef4444]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-5 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white font-semibold rounded-xl shadow-[0_4px_16px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_24px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Create Free Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-[#64748b] mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-[#a855f7] hover:text-[#c084fc] font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
