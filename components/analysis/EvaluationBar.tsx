'use client';

import { useMemo } from 'react';
import { useAnalysisStore } from '@/store/analysis-store';

// Convert centipawn evaluation to bar height percentage (0-100)
// From Black's perspective (bar fills from bottom = white advantage)
function evalToBarHeight(centipawns: number): number {
  // Clamp at ±800 centipawns (8 pawns is decisive)
  const clamped = Math.max(-800, Math.min(800, centipawns));
  // Map -800..+800 to 0..100 (50 = equal)
  return Math.round(50 + (clamped / 800) * 50);
}

function formatEvalDisplay(centipawns: number, mate?: number): string {
  if (mate !== undefined) {
    return mate > 0 ? `M${mate}` : `-M${Math.abs(mate)}`;
  }
  const pawns = centipawns / 100;
  if (pawns > 0) return `+${pawns.toFixed(1)}`;
  return `${pawns.toFixed(1)}`;
}

export function EvaluationBar() {
  const { analysisResult, currentMoveIndex, gameMode, liveMoves } = useAnalysisStore();

  const { evalDisplay, barHeight, evalSign } = useMemo(() => {
    if (gameMode === 'play') {
      if (liveMoves.length === 0) {
        return { evalDisplay: '0.0', barHeight: 50, evalSign: 'equal' };
      }
      const lastMove = liveMoves[liveMoves.length - 1];
      const eval_ = lastMove.evalAfter;
      const height = evalToBarHeight(eval_);
      const display = formatEvalDisplay(eval_);
      const sign = eval_ > 10 ? 'white' : eval_ < -10 ? 'black' : 'equal';

      return { evalDisplay: display, barHeight: height, evalSign: sign };
    }

    if (!analysisResult || currentMoveIndex < 0) {
      return { evalDisplay: '0.0', barHeight: 50, evalSign: 'equal' };
    }

    const move = analysisResult.moves[currentMoveIndex];
    if (!move) return { evalDisplay: '0.0', barHeight: 50, evalSign: 'equal' };

    const eval_ = move.evalAfter;
    const height = evalToBarHeight(eval_);
    const display = formatEvalDisplay(eval_);
    const sign = eval_ > 10 ? 'white' : eval_ < -10 ? 'black' : 'equal';

    return { evalDisplay: display, barHeight: height, evalSign: sign };
  }, [analysisResult, currentMoveIndex, gameMode, liveMoves]);

  return (
    <div className="flex flex-col items-center gap-2 w-7">
      {/* Evaluation value */}
      <span
        className={`text-[10px] font-bold font-mono rotate-180 writing-mode-vertical ${
          evalSign === 'black'
            ? 'text-[#f1f5f9]'
            : evalSign === 'white'
            ? 'text-[#1a1a2e]'
            : 'text-[#94a3b8]'
        }`}
        style={{ writingMode: 'vertical-rl', fontSize: '10px' }}
      >
        {evalDisplay}
      </span>

      {/* The bar itself */}
      <div className="relative flex-1 w-5 rounded-lg overflow-hidden bg-[#0f0f1a] border border-[rgba(148,163,184,0.1)] min-h-[300px]">
        {/* White portion (fills from bottom) */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-[#e2e8f0] transition-all duration-500 ease-out"
          style={{ height: `${barHeight}%` }}
        />
        {/* Black portion (fills from top) */}
        <div
          className="absolute top-0 left-0 right-0 bg-[#1e293b] transition-all duration-500 ease-out"
          style={{ height: `${100 - barHeight}%` }}
        />
        {/* Center line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-[rgba(148,163,184,0.3)] z-10" />
      </div>

      {/* Color indicators */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-3 h-3 rounded-sm bg-[#1e293b] border border-[rgba(148,163,184,0.2)]" title="Black" />
        <div className="w-3 h-3 rounded-sm bg-[#e2e8f0] border border-[rgba(148,163,184,0.2)]" title="White" />
      </div>
    </div>
  );
}
