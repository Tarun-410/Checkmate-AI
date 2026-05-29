'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Brain,
  Swords,
  TrendingUp,
  Zap,
  Target,
  ChevronRight,
  Crown,
  BarChart2,
  MessageSquare,
  BookOpen,
  ArrowRight,
  Play,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

// ============================================================
// Hero Section
// ============================================================
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-bg animated-grid pt-20">
      {/* Ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[rgba(124,58,237,0.08)] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[rgba(6,182,212,0.06)] blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(124,58,237,0.3)] bg-[rgba(124,58,237,0.08)] text-[#a855f7] text-sm font-medium mb-8"
        >
          <Sparkles className="w-4 h-4" />
          AI-Powered Chess Coaching · Now Available
          <ChevronRight className="w-4 h-4" />
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6"
        >
          Stop losing.{' '}
          <span className="bg-gradient-to-r from-[#a855f7] via-[#7c3aed] to-[#06b6d4] bg-clip-text text-transparent">
            Start understanding.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg sm:text-xl text-[#94a3b8] max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Checkmate AI analyzes your chess games with Stockfish and explains every mistake
          in plain English — like having a grandmaster coach who actually speaks your language.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link
            href="/analysis"
            className="group flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white text-base font-bold rounded-xl shadow-[0_4px_24px_rgba(124,58,237,0.4)] hover:shadow-[0_8px_40px_rgba(124,58,237,0.5)] hover:-translate-y-1 transition-all duration-200"
          >
            <Swords className="w-5 h-5" />
            Analyze My Game
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-8 py-4 bg-[rgba(255,255,255,0.04)] text-[#f1f5f9] text-base font-semibold rounded-xl border border-[rgba(148,163,184,0.15)] hover:bg-[rgba(255,255,255,0.07)] hover:border-[rgba(148,163,184,0.25)] transition-all duration-200"
          >
            <Play className="w-4 h-4" />
            View Dashboard
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex items-center justify-center gap-6 text-sm text-[#64748b]"
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-[#22c55e]" />
            Free to start
          </div>
          <div className="w-1 h-1 rounded-full bg-[#334155]" />
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-[#22c55e]" />
            Stockfish powered
          </div>
          <div className="w-1 h-1 rounded-full bg-[#334155]" />
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-[#22c55e]" />
            GPT-4 explanations
          </div>
        </motion.div>

        {/* Demo screenshot / visual */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 relative"
        >
          {/* Mock analysis card */}
          <div className="max-w-4xl mx-auto rounded-2xl border border-[rgba(124,58,237,0.2)] bg-[rgba(15,15,26,0.9)] backdrop-blur-xl shadow-[0_0_100px_rgba(124,58,237,0.15)] overflow-hidden">
            {/* Card header bar */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-[rgba(148,163,184,0.08)] bg-[rgba(20,20,42,0.8)]">
              <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
              <div className="w-3 h-3 rounded-full bg-[#eab308]" />
              <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
              <span className="ml-3 text-xs text-[#475569] font-medium">Checkmate AI — Game Analysis</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 p-6 text-left">
              {/* Mock moves */}
              <div className="space-y-2">
                <p className="text-xs text-[#475569] font-medium uppercase tracking-wide mb-3">Move History</p>
                {[
                  { move: '1. e4', color: 'good' },
                  { move: 'e5', color: 'good' },
                  { move: '2. Nf3', color: 'good' },
                  { move: 'Nc6', color: 'good' },
                  { move: '3. Bb5', color: 'good' },
                  { move: 'a6', color: 'good' },
                  { move: '4. Ba4', color: 'good' },
                  { move: 'Nf6', color: 'good' },
                  { move: '5. 0-0', color: 'good' },
                  { move: 'Nxe4??', color: 'blunder' },
                ].map((item, i) => (
                  <div key={i} className={`move-item ${item.color === 'blunder' ? 'text-[#ef4444] font-bold' : 'text-[#94a3b8]'}`}>
                    {item.move}
                    {item.color === 'blunder' && <span className="ml-1 text-[10px] bg-[rgba(239,68,68,0.2)] text-[#ef4444] px-1.5 py-0.5 rounded">blunder</span>}
                  </div>
                ))}
              </div>

              {/* Mock mistake card */}
              <div className="md:col-span-2 pl-0 md:pl-6 md:border-l border-[rgba(148,163,184,0.08)] mt-4 md:mt-0">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)]">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(239,68,68,0.2)] flex items-center justify-center flex-shrink-0">
                    <span className="text-[#ef4444] font-black text-sm">??</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-[#f1f5f9]">Move 5... Nxe4</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(239,68,68,0.15)] text-[#ef4444] border border-[rgba(239,68,68,0.3)] font-semibold">BLUNDER</span>
                    </div>
                    <p className="text-sm text-[#94a3b8] leading-relaxed">
                      This is the classic "Noah's Ark Trap" — capturing on e4 loses material immediately because after{' '}
                      <code className="text-[#06b6d4] bg-[rgba(6,182,212,0.1)] px-1 rounded">Re1</code>, your knight is pinned and you lose a piece.
                      Always check if your moves create tactical vulnerabilities before taking pawns!
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-[#64748b]">
                      <span>Eval: <span className="text-[#ef4444]">-2.8 → +0.4</span></span>
                      <span>Best: <code className="text-[#22c55e]">Bc5</code></span>
                    </div>
                  </div>
                </div>

                {/* AI Coach badge */}
                <div className="mt-4 flex items-center gap-2 text-xs text-[#475569]">
                  <Brain className="w-3.5 h-3.5 text-[#7c3aed]" />
                  <span className="text-[#7c3aed]">AI Coach</span>
                  · Generated personalized explanation for your rating
                </div>
              </div>
            </div>
          </div>

          {/* Glow beneath card */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-[rgba(124,58,237,0.12)] blur-[60px] rounded-full pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// Features Section
// ============================================================
const features = [
  {
    icon: Brain,
    color: '#7c3aed',
    title: 'AI-Powered Explanations',
    description:
      'GPT-4 translates Stockfish analysis into clear, personalized coaching — no jargon, just insight tailored to your skill level.',
  },
  {
    icon: Target,
    color: '#06b6d4',
    title: 'Mistake Detection',
    description:
      'Every blunder, mistake, and inaccuracy is automatically identified with the exact evaluation swing — so you know exactly where things went wrong.',
  },
  {
    icon: MessageSquare,
    color: '#f59e0b',
    title: 'Interactive Coaching Chat',
    description:
      'Ask your AI coach anything — about why a move was bad or what opening suits you — and get instant, context-aware answers.',
  },
  {
    icon: BarChart2,
    color: '#22c55e',
    title: 'Weakness Tracking',
    description:
      'Track your blunder rate, accuracy trends, and opening performance across all your games to see exactly what to work on.',
  },
  {
    icon: BookOpen,
    color: '#a855f7',
    title: 'Opening Recommendations',
    description:
      'Get personalized opening suggestions based on your style, rating, and common mistakes — stop playing openings that don\'t suit you.',
  },
  {
    icon: TrendingUp,
    color: '#ef4444',
    title: 'Progress Analytics',
    description:
      'Watch your accuracy improve over time with beautiful charts and stats that keep you motivated and on track.',
  },
];

function FeaturesSection() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-[#7c3aed] uppercase tracking-widest mb-3">
            Features
          </p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-[#a855f7] to-[#06b6d4] bg-clip-text text-transparent">
              master chess
            </span>
          </h2>
          <p className="text-lg text-[#94a3b8] max-w-2xl mx-auto">
            A complete AI coaching platform — from game analysis to personalized training,
            all in one beautiful interface.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              className="group p-6 rounded-2xl border border-[rgba(148,163,184,0.08)] bg-[rgba(15,15,26,0.6)] backdrop-blur-xl hover:border-[rgba(124,58,237,0.2)] hover:bg-[rgba(20,20,42,0.7)] transition-all duration-300 hover:-translate-y-1 cursor-default"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                style={{ background: `${feature.color}20`, border: `1px solid ${feature.color}40` }}
              >
                <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
              </div>
              <h3 className="text-lg font-bold text-[#f1f5f9] mb-2 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-[#94a3b8] leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// How It Works Section
// ============================================================
const steps = [
  {
    number: '01',
    title: 'Paste Your PGN',
    description:
      'Copy your game from Chess.com, Lichess, or anywhere else and paste the PGN notation into our analyzer.',
    icon: BookOpen,
  },
  {
    number: '02',
    title: 'Stockfish Analyzes',
    description:
      'Our engine evaluates every position at depth 18+, identifying blunders, mistakes, and missed tactical opportunities.',
    icon: Zap,
  },
  {
    number: '03',
    title: 'AI Explains',
    description:
      'GPT-4 converts the raw analysis into coaching insights tailored to your skill level — clear, actionable, and human.',
    icon: Brain,
  },
  {
    number: '04',
    title: 'You Improve',
    description:
      'Review your games, chat with your AI coach, track your weaknesses, and watch your rating climb.',
    icon: TrendingUp,
  },
];

function HowItWorksSection() {
  return (
    <section className="py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(124,58,237,0.03)] to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-[#7c3aed] uppercase tracking-widest mb-3">
            How It Works
          </p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            From game to insight{' '}
            <span className="bg-gradient-to-r from-[#a855f7] to-[#06b6d4] bg-clip-text text-transparent">
              in seconds
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="text-center relative"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] right-0 h-px bg-gradient-to-r from-[rgba(124,58,237,0.4)] to-transparent" />
              )}

              <div className="w-20 h-20 rounded-2xl bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.2)] flex items-center justify-center mx-auto mb-5 relative">
                <step.icon className="w-8 h-8 text-[#a855f7]" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#7c3aed] text-white text-[10px] font-black flex items-center justify-center">
                  {step.number.slice(1)}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#f1f5f9] mb-2">{step.title}</h3>
              <p className="text-sm text-[#94a3b8] leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// CTA Section
// ============================================================
function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeUp}
          className="relative rounded-3xl border border-[rgba(124,58,237,0.25)] bg-gradient-to-br from-[rgba(124,58,237,0.12)] via-[rgba(20,20,42,0.8)] to-[rgba(6,182,212,0.08)] backdrop-blur-xl p-12 sm:p-16 overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[rgba(124,58,237,0.2)] blur-[80px] rounded-full" />

          <Crown className="w-14 h-14 text-[#f59e0b] mx-auto mb-6 animate-float" />

          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Ready to become a better{' '}
            <span className="bg-gradient-to-r from-[#f59e0b] to-[#f97316] bg-clip-text text-transparent">
              chess player?
            </span>
          </h2>
          <p className="text-lg text-[#94a3b8] mb-10 max-w-xl mx-auto">
            Analyze your first game free. No credit card required. Just paste your PGN and watch
            Checkmate AI transform how you learn chess.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/analysis"
              className="group flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white text-base font-bold rounded-xl shadow-[0_4px_24px_rgba(124,58,237,0.4)] hover:shadow-[0_8px_40px_rgba(124,58,237,0.5)] hover:-translate-y-1 transition-all duration-200"
            >
              <Swords className="w-5 h-5" />
              Start Analyzing Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-2 px-8 py-4 text-base font-semibold text-[#f1f5f9] border border-[rgba(148,163,184,0.2)] rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition-all"
            >
              Create Free Account
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-12 pt-8 border-t border-[rgba(148,163,184,0.1)] grid grid-cols-3 gap-4">
            {[
              { label: 'Games Analyzed', value: '10,000+' },
              { label: 'Avg. Accuracy Gain', value: '+12%' },
              { label: 'Player Rating', value: '800–2400' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-black text-[#f1f5f9] mb-1">{stat.value}</div>
                <div className="text-xs text-[#64748b] font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// Footer
// ============================================================
function Footer() {
  return (
    <footer className="py-12 border-t border-[rgba(148,163,184,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] flex items-center justify-center">
              <Crown className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-[15px]">
              Checkmate{' '}
              <span className="bg-gradient-to-r from-[#a855f7] to-[#06b6d4] bg-clip-text text-transparent">
                AI
              </span>
            </span>
          </div>
          <p className="text-sm text-[#475569]">
            © 2026 Checkmate AI. Built with Next.js, Stockfish, and OpenAI.
          </p>
          <div className="flex items-center gap-6 text-sm text-[#475569]">
            <Link href="/analysis" className="hover:text-[#94a3b8] transition-colors">Analysis</Link>
            <Link href="/dashboard" className="hover:text-[#94a3b8] transition-colors">Dashboard</Link>
            <Link href="/signup" className="hover:text-[#94a3b8] transition-colors">Sign Up</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// Landing Page — main export
// ============================================================
export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </>
  );
}
