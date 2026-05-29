'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Crown, TrendingUp, Target, Swords, Brain,
  ChevronRight, Trophy, AlertTriangle,
  BookOpen, Flame, Activity, Calendar
} from 'lucide-react';

// ============================================================
// Mock data for demonstration (replace with Supabase calls)
// ============================================================
const MOCK_GAMES = [
  {
    id: '1',
    title: 'Italian Game vs Knight_King',
    opponentName: 'Knight_King',
    totalMoves: 48,
    blunderCount: 1,
    mistakeCount: 2,
    inaccuracyCount: 3,
    averageAccuracy: 78,
    createdAt: '2026-05-28T10:30:00Z',
  },
  {
    id: '2',
    title: 'Sicilian Defense vs VitaliK',
    opponentName: 'VitaliK',
    totalMoves: 32,
    blunderCount: 3,
    mistakeCount: 1,
    inaccuracyCount: 5,
    averageAccuracy: 63,
    createdAt: '2026-05-27T14:20:00Z',
  },
  {
    id: '3',
    title: 'Queen\'s Gambit vs PawnMaster99',
    opponentName: 'PawnMaster99',
    totalMoves: 55,
    blunderCount: 0,
    mistakeCount: 1,
    inaccuracyCount: 2,
    averageAccuracy: 89,
    createdAt: '2026-05-26T09:00:00Z',
  },
  {
    id: '4',
    title: 'Ruy Lopez vs chessnerd21',
    opponentName: 'chessnerd21',
    totalMoves: 41,
    blunderCount: 2,
    mistakeCount: 3,
    inaccuracyCount: 4,
    averageAccuracy: 71,
    createdAt: '2026-05-25T16:45:00Z',
  },
];

const MOCK_TIPS = [
  {
    category: 'Tactics',
    tip: "Before capturing, ask: 'What can my opponent do next?' One check, one threat — that's all it takes to spot a blunder.",
    icon: Target,
    color: '#06b6d4',
  },
  {
    category: 'Endgame',
    tip: "Activate your king! In endgames, the king is a powerful piece. Centralize it aggressively — it's your secret weapon.",
    icon: Crown,
    color: '#f59e0b',
  },
  {
    category: 'Opening',
    tip: "Control the center with pawns (e4, d4) or pieces. Don't move the same piece twice in the opening without good reason.",
    icon: BookOpen,
    color: '#a855f7',
  },
];

const WEAKNESS_STATS = [
  { label: 'Most Common Mistake', value: 'Tactical Oversight', color: '#ef4444', icon: AlertTriangle },
  { label: 'Blunder Rate', value: '1.5 / game', color: '#f97316', icon: Flame },
  { label: 'Avg. Accuracy', value: '75.2%', color: '#a855f7', icon: Activity },
  { label: 'Best Opening', value: 'Italian Game', color: '#22c55e', icon: Trophy },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function DashboardPage() {
  const [playerRating, setPlayerRating] = useState<number>(1247);
  const [isEditingRating, setIsEditingRating] = useState(false);
  const [ratingInput, setRatingInput] = useState('1247');
  const tipIndex = new Date().getDate() % MOCK_TIPS.length;
  const dailyTip = MOCK_TIPS[tipIndex];

  return (
    <div className="min-h-screen bg-[#080810] pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ============================================
            Header: Welcome + Quick actions
            ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-[#475569]">Welcome back</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-[#f1f5f9]">
              Your Dashboard
            </h1>
          </div>
          <Link
            href="/analysis"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white text-sm font-semibold rounded-xl shadow-[0_4px_16px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_24px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 transition-all"
          >
            <Swords className="w-4 h-4" />
            Analyze New Game
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ============================================
              Left column (2/3 width)
              ============================================ */}
          <div className="lg:col-span-2 space-y-6">

            {/* Weakness stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-sm font-semibold text-[#475569] uppercase tracking-wider mb-3">
                Performance Overview
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {WEAKNESS_STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="p-4 rounded-xl border border-[rgba(148,163,184,0.08)] bg-[rgba(15,15,26,0.6)] backdrop-blur-xl hover:border-[rgba(148,163,184,0.15)] transition-all"
                  >
                    <stat.icon className="w-5 h-5 mb-3" style={{ color: stat.color }} />
                    <div className="text-base font-black text-[#f1f5f9] leading-tight mb-1">
                      {stat.value}
                    </div>
                    <div className="text-[11px] text-[#475569] font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent games */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[#475569] uppercase tracking-wider">
                  Recent Games
                </h2>
                <Link href="/analysis" className="text-xs text-[#7c3aed] hover:text-[#a855f7] transition-colors flex items-center gap-1">
                  Analyze new
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3">
                {MOCK_GAMES.map((game, i) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="flex items-center gap-4 p-4 rounded-xl border border-[rgba(148,163,184,0.08)] bg-[rgba(15,15,26,0.6)] hover:border-[rgba(124,58,237,0.15)] hover:bg-[rgba(20,20,42,0.5)] transition-all cursor-pointer group"
                  >
                    {/* Accuracy circle */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm border"
                      style={{
                        background: `${
                          game.averageAccuracy >= 85
                            ? 'rgba(34,197,94,0.1)'
                            : game.averageAccuracy >= 70
                            ? 'rgba(124,58,237,0.1)'
                            : 'rgba(249,115,22,0.1)'
                        }`,
                        color:
                          game.averageAccuracy >= 85
                            ? '#22c55e'
                            : game.averageAccuracy >= 70
                            ? '#a855f7'
                            : '#f97316',
                        borderColor:
                          game.averageAccuracy >= 85
                            ? 'rgba(34,197,94,0.2)'
                            : game.averageAccuracy >= 70
                            ? 'rgba(124,58,237,0.2)'
                            : 'rgba(249,115,22,0.2)',
                      }}
                    >
                      {game.averageAccuracy}%
                    </div>

                    {/* Game info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#f1f5f9] truncate">{game.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[#475569]">
                        <span>{game.totalMoves} moves</span>
                        {game.blunderCount > 0 && (
                          <span className="text-[#ef4444] font-medium">{game.blunderCount} blunder{game.blunderCount !== 1 ? 's' : ''}</span>
                        )}
                        {game.mistakeCount > 0 && (
                          <span className="text-[#f97316] font-medium">{game.mistakeCount} mistake{game.mistakeCount !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </div>

                    {/* Date + arrow */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-xs text-[#475569]">{formatDate(game.createdAt)}</span>
                      <ChevronRight className="w-4 h-4 text-[#334155] group-hover:text-[#7c3aed] transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Progress chart (simplified visual) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-5 rounded-xl border border-[rgba(148,163,184,0.08)] bg-[rgba(15,15,26,0.6)]"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[#f1f5f9]">Accuracy Trend</h2>
                <span className="text-xs text-[#22c55e] font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +6.2% this week
                </span>
              </div>

              {/* Simple bar chart */}
              <div className="flex items-end gap-2 h-20">
                {[63, 71, 68, 78, 72, 82, 89].map((accuracy, i) => {
                  const color = accuracy >= 85 ? '#22c55e' : accuracy >= 70 ? '#7c3aed' : '#f97316';
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-sm transition-all"
                        style={{
                          height: `${(accuracy / 100) * 64}px`,
                          backgroundColor: color,
                          opacity: i === 6 ? 1 : 0.5 + (i / 6) * 0.3,
                        }}
                      />
                      <span className="text-[9px] text-[#334155]">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* ============================================
              Right column (1/3)
              ============================================ */}
          <div className="space-y-5">
            {/* Profile card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="p-5 rounded-xl border border-[rgba(124,58,237,0.15)] bg-gradient-to-br from-[rgba(124,58,237,0.08)] to-[rgba(6,182,212,0.04)] backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] flex items-center justify-center text-xl font-black text-white">
                  C
                </div>
                <div>
                  <p className="font-bold text-[#f1f5f9] text-sm">Chess Player</p>
                  <p className="text-xs text-[#475569]">Intermediate · Improving</p>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[#475569] font-medium">Chess Rating</span>
                  <button
                    onClick={() => setIsEditingRating(!isEditingRating)}
                    className="text-xs text-[#7c3aed] hover:text-[#a855f7] transition-colors"
                  >
                    {isEditingRating ? 'Save' : 'Edit'}
                  </button>
                </div>
                {isEditingRating ? (
                  <input
                    type="number"
                    value={ratingInput}
                    onChange={(e) => setRatingInput(e.target.value)}
                    onBlur={() => {
                      setPlayerRating(parseInt(ratingInput) || 1200);
                      setIsEditingRating(false);
                    }}
                    className="w-full px-3 py-2 bg-[rgba(8,8,16,0.8)] border border-[rgba(124,58,237,0.3)] rounded-lg text-[#f1f5f9] text-sm focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[#f1f5f9]">{playerRating}</span>
                    <span className="text-sm text-[#94a3b8]">ELO</span>
                  </div>
                )}
              </div>

              {/* Preferred openings */}
              <div>
                <span className="text-xs text-[#475569] font-medium block mb-2">Preferred Openings</span>
                <div className="flex flex-wrap gap-1.5">
                  {['Italian Game', 'Sicilian', 'King\'s Indian'].map((opening) => (
                    <span
                      key={opening}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.2)] text-[#a855f7] font-medium"
                    >
                      {opening}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Daily tip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="p-5 rounded-xl border border-[rgba(148,163,184,0.08)] bg-[rgba(15,15,26,0.6)]"
            >
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-[#94a3b8]" />
                <span className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide">Daily Tip</span>
              </div>
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ background: `${dailyTip.color}15`, border: `1px solid ${dailyTip.color}30` }}
              >
                <dailyTip.icon className="w-4.5 h-4.5" style={{ color: dailyTip.color }} />
              </div>
              <span
                className="text-[10px] font-bold uppercase tracking-wider mb-2 block"
                style={{ color: dailyTip.color }}
              >
                {dailyTip.category}
              </span>
              <p className="text-sm text-[#94a3b8] leading-relaxed">{dailyTip.tip}</p>
            </motion.div>

            {/* Quick AI Coach CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="p-5 rounded-xl border border-[rgba(6,182,212,0.15)] bg-gradient-to-br from-[rgba(6,182,212,0.06)] to-transparent"
            >
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-[#06b6d4]" />
                <span className="text-sm font-bold text-[#f1f5f9]">AI Coach</span>
              </div>
              <p className="text-xs text-[#94a3b8] mb-4 leading-relaxed">
                Ask your coach anything — from opening theory to endgame technique — personalized for your rating.
              </p>
              <Link
                href="/analysis"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[rgba(6,182,212,0.12)] border border-[rgba(6,182,212,0.2)] text-[#06b6d4] text-sm font-semibold hover:bg-[rgba(6,182,212,0.18)] transition-all"
              >
                <Brain className="w-4 h-4" />
                Open AI Coach
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
