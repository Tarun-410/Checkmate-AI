'use client';

import { useRef, useEffect } from 'react';
import { useAnalysisStore } from '@/store/analysis-store';
import type { MistakeType } from '@/types';

const MISTAKE_SYMBOLS: Record<MistakeType, string> = {
  blunder: '??',
  mistake: '?',
  inaccuracy: '?!',
  good: '!',
  brilliant: '!!',
  best: '',
};

const MISTAKE_COLORS: Record<MistakeType, string> = {
  blunder: '#ef4444',
  mistake: '#f97316',
  inaccuracy: '#eab308',
  good: '#22c55e',
  brilliant: '#06b6d4',
  best: '#94a3b8',
};

export function MoveList() {
  const {
    analysisResult,
    currentMoveIndex,
    setCurrentMoveIndex,
    setSelectedMistake,
    gameMode,
    liveMoves,
  } = useAnalysisStore();
  const activeRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active move
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [currentMoveIndex]);

  const moves = gameMode === 'play' ? liveMoves : analysisResult?.moves ?? [];

  if (moves.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-[#475569]">
        No moves to display
      </div>
    );
  }

  // Group moves into pairs (white + black per row)
  const movePairs: Array<{ moveNum: number; white?: number; black?: number }> = [];
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    if (move.color === 'w') {
      movePairs.push({ moveNum: move.moveNumber, white: i });
    } else {
      const lastPair = movePairs[movePairs.length - 1];
      if (lastPair && lastPair.moveNum === move.moveNumber) {
        lastPair.black = i;
      } else {
        movePairs.push({ moveNum: move.moveNumber, black: i });
      }
    }
  }

  const handleMoveClick = (index: number) => {
    setCurrentMoveIndex(index);
    if (gameMode === 'play') {
      const move = liveMoves[index];
      if (move) {
        useAnalysisStore.setState({ liveCurrentFen: move.fen });
      }
      return;
    }
    // If this move has a mistake, highlight it
    const mistake = analysisResult?.mistakes.find((m) => m.moveNumber === moves[index]?.moveNumber);
    if (mistake) {
      setSelectedMistake(mistake);
    } else {
      setSelectedMistake(null);
    }
  };

  return (
    <div className="overflow-y-auto max-h-[320px] pr-1">
      <div className="space-y-0.5">
        {movePairs.map(({ moveNum, white, black }) => (
          <div
            key={moveNum}
            className="flex items-center gap-1 rounded-lg px-1 py-0.5 hover:bg-[rgba(148,163,184,0.04)] transition-colors"
          >
            {/* Move number */}
            <span className="text-[12px] text-[#475569] w-7 flex-shrink-0 font-mono font-medium">
              {moveNum}.
            </span>

            {/* White move */}
            {white !== undefined ? (
              <MoveChip
                index={white}
                move={moves[white]}
                isActive={currentMoveIndex === white}
                onClick={() => handleMoveClick(white)}
                ref={currentMoveIndex === white ? activeRef : undefined}
              />
            ) : (
              <div className="w-20" />
            )}

            {/* Black move */}
            {black !== undefined ? (
              <MoveChip
                index={black}
                move={moves[black]}
                isActive={currentMoveIndex === black}
                onClick={() => handleMoveClick(black)}
                ref={currentMoveIndex === black ? activeRef : undefined}
              />
            ) : (
              <div className="w-20" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface MoveChipProps {
  index: number;
  move: {
    mistakeType: MistakeType;
    san: string;
    moveNumber: number;
    color: 'w' | 'b';
  };
  isActive: boolean;
  onClick: () => void;
}

import { forwardRef } from 'react';

const MoveChip = forwardRef<HTMLDivElement, Omit<MoveChipProps, 'ref'>>(
  ({ move, isActive, onClick }, ref) => {
    const type: MistakeType = move.mistakeType;
    const symbol = MISTAKE_SYMBOLS[type];
    const color = MISTAKE_COLORS[type];
    const isMistake = type === 'blunder' || type === 'mistake' || type === 'inaccuracy';

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={`move-item flex-1 max-w-[90px] cursor-pointer select-none relative ${
          isActive ? 'active' : ''
        } ${isMistake ? type : ''}`}
        style={isMistake ? { color } : undefined}
        title={isMistake ? `${type} — click to review` : move.san}
      >
        <span className="font-mono text-[13px]">{move.san}</span>
        {symbol && (
          <span className="ml-0.5 text-[11px] font-black opacity-90">{symbol}</span>
        )}
      </div>
    );
  }
);
MoveChip.displayName = 'MoveChip';
