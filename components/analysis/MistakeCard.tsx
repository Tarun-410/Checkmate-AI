'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAnalysisStore } from '@/store/analysis-store';
import type { GameMistake, MistakeType } from '@/types';
import { AlertTriangle, AlertCircle, Info, TrendingDown, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const MISTAKE_CONFIG: Record<MistakeType, {
  label: string;
  symbol: string;
  icon: React.ComponentType<{ className?: string }> | null;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  blunder: {
    label: 'Blunder',
    symbol: '??',
    icon: AlertCircle,
    color: '#ef4444',
    bgColor: 'rgba(239,68,68,0.08)',
    borderColor: 'rgba(239,68,68,0.2)',
  },
  mistake: {
    label: 'Mistake',
    symbol: '?',
    icon: AlertTriangle,
    color: '#f97316',
    bgColor: 'rgba(249,115,22,0.08)',
    borderColor: 'rgba(249,115,22,0.2)',
  },
  inaccuracy: {
    label: 'Inaccuracy',
    symbol: '?!',
    icon: Info,
    color: '#eab308',
    bgColor: 'rgba(234,179,8,0.08)',
    borderColor: 'rgba(234,179,8,0.2)',
  },
  good: { label: 'Good', symbol: '!', icon: TrendingDown, color: '#22c55e', bgColor: '', borderColor: '' },
  brilliant: { label: 'Brilliant', symbol: '!!', icon: TrendingDown, color: '#06b6d4', bgColor: '', borderColor: '' },
  best: { label: 'Best', symbol: '', icon: null, color: '#94a3b8', bgColor: '', borderColor: '' },
};

interface MistakeCardProps {
  mistake: GameMistake;
  isSelected?: boolean;
  onClick?: () => void;
}

export function MistakeCard({ mistake, isSelected, onClick }: MistakeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const config = MISTAKE_CONFIG[mistake.mistakeType];
  if (!config || !config.bgColor) return null;

  const evalSwingPawns = Math.abs(mistake.evalSwing / 100).toFixed(1);
  const evalBefore = (mistake.evalBefore / 100).toFixed(1);
  const evalAfter = (mistake.evalAfter / 100).toFixed(1);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`rounded-xl border p-4 cursor-pointer transition-all duration-200 ${
        isSelected ? 'ring-1 ring-[rgba(124,58,237,0.4)]' : ''
      }`}
      style={{
        backgroundColor: config.bgColor,
        borderColor: isSelected ? 'rgba(124,58,237,0.4)' : config.borderColor,
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${config.color}20` }}
          >
            <span className="text-xs font-black" style={{ color: config.color }}>
              {config.symbol}
            </span>
          </div>

          {/* Move info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-[#f1f5f9]">
                Move {mistake.moveNumber}.
              </span>
              <code className="text-sm font-mono font-semibold" style={{ color: config.color }}>
                {mistake.moveSan}
              </code>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                style={{
                  color: config.color,
                  backgroundColor: config.bgColor,
                  border: `1px solid ${config.borderColor}`,
                }}
              >
                {config.label}
              </span>
            </div>
            {/* Eval swing */}
            <div className="flex items-center gap-2 mt-0.5 text-xs text-[#64748b]">
              <span>
                {parseFloat(evalBefore) >= 0 ? '+' : ''}{evalBefore}
              </span>
              <ArrowRight className="w-3 h-3" />
              <span style={{ color: config.color }}>
                {parseFloat(evalAfter) >= 0 ? '+' : ''}{evalAfter}
              </span>
              <span className="ml-1 font-semibold" style={{ color: config.color }}>
                ({evalSwingPawns}↓)
              </span>
              {mistake.bestMoveSan && (
                <>
                  <span className="mx-1">·</span>
                  <span>Best: <code className="text-[#22c55e] font-mono">{mistake.bestMoveSan}</code></span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className="text-[#475569] hover:text-[#94a3b8] transition-colors flex-shrink-0"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* AI Explanation — collapsible */}
      <AnimatePresence>
        {expanded && mistake.aiExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t" style={{ borderColor: config.borderColor }}>
              <p className="text-sm text-[#94a3b8] leading-relaxed">{mistake.aiExplanation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed AI explanation preview */}
      {!expanded && mistake.aiExplanation && (
        <p className="mt-2 text-xs text-[#475569] leading-relaxed line-clamp-2">
          {mistake.aiExplanation}
        </p>
      )}
    </motion.div>
  );
}

import { calculateAccuracy } from '@/lib/chess/mistake-detector';
import { useMemo } from 'react';

// ============================================================
// MistakeList — shows all mistakes
// ============================================================
export function MistakeList() {
  const {
    analysisResult,
    selectedMistake,
    setSelectedMistake,
    setCurrentMoveIndex,
    gameMode,
    liveMoves,
  } = useAnalysisStore();

  const isPlayMode = gameMode === 'play';

  // Construct mistakes list dynamically
  const mistakes = useMemo(() => {
    if (isPlayMode) {
      const significant = liveMoves.filter(
        (m) =>
          m.mistakeType === 'blunder' ||
          m.mistakeType === 'mistake' ||
          m.mistakeType === 'inaccuracy'
      );
      return significant.map((m) => ({
        moveNumber: m.moveNumber,
        moveSan: m.san,
        mistakeType: m.mistakeType,
        evalBefore: m.evalBefore,
        evalAfter: m.evalAfter,
        evalSwing: m.evalSwing,
        bestMoveSan: m.bestMoveSan,
        positionFen: m.fen,
        aiExplanation: m.aiExplanation ?? '',
      })) as GameMistake[];
    }
    return analysisResult?.mistakes ?? [];
  }, [isPlayMode, liveMoves, analysisResult]);

  const blunderCount = useMemo(() => {
    return mistakes.filter((m) => m.mistakeType === 'blunder').length;
  }, [mistakes]);

  const mistakeCount = useMemo(() => {
    return mistakes.filter((m) => m.mistakeType === 'mistake').length;
  }, [mistakes]);

  const inaccuracyCount = useMemo(() => {
    return mistakes.filter((m) => m.mistakeType === 'inaccuracy').length;
  }, [mistakes]);

  const averageAccuracy = useMemo(() => {
    if (isPlayMode) {
      if (liveMoves.length === 0) return 100;
      return calculateAccuracy(liveMoves);
    }
    return analysisResult?.averageAccuracy ?? 0;
  }, [isPlayMode, liveMoves, analysisResult]);

  if (mistakes.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 rounded-full bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] flex items-center justify-center mx-auto mb-3">
          <span className="text-[#22c55e] text-xl">✓</span>
        </div>
        <p className="text-[#22c55e] font-semibold">Excellent game!</p>
        <p className="text-sm text-[#475569] mt-1">No significant mistakes detected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary row */}
      <div className="grid grid-cols-4 gap-2 p-3 rounded-xl bg-[rgba(8,8,16,0.6)] border border-[rgba(148,163,184,0.08)]">
        <div className="text-center">
          <div className="text-lg font-black text-[#ef4444]">{blunderCount}</div>
          <div className="text-[10px] text-[#475569] uppercase tracking-wide font-medium">Blunders</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-black text-[#f97316]">{mistakeCount}</div>
          <div className="text-[10px] text-[#475569] uppercase tracking-wide font-medium">Mistakes</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-black text-[#eab308]">{inaccuracyCount}</div>
          <div className="text-[10px] text-[#475569] uppercase tracking-wide font-medium">Inaccuracies</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-black text-[#a855f7]">{averageAccuracy}%</div>
          <div className="text-[10px] text-[#475569] uppercase tracking-wide font-medium">Accuracy</div>
        </div>
      </div>

      {/* Mistake cards */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {mistakes.map((mistake, i) => (
          <MistakeCard
            key={`${mistake.moveNumber}-${mistake.moveSan}-${i}`}
            mistake={mistake}
            isSelected={selectedMistake?.moveNumber === mistake.moveNumber}
            onClick={() => {
              setSelectedMistake(mistake);
              if (isPlayMode) {
                const moveIdx = liveMoves.findIndex((m) => m.fen === mistake.positionFen);
                if (moveIdx >= 0) {
                  setCurrentMoveIndex(moveIdx);
                  useAnalysisStore.setState({ liveCurrentFen: mistake.positionFen });
                }
                return;
              }
              const moveIdx = analysisResult?.moves.findIndex(
                (m) => m.moveNumber === mistake.moveNumber && m.san === mistake.moveSan
              ) ?? -1;
              if (moveIdx >= 0) setCurrentMoveIndex(moveIdx);
            }}
          />
        ))}
      </div>
    </div>
  );
}
