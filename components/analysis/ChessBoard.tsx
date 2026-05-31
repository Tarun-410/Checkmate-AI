'use client';

import { useMemo, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useAnalysisStore } from '@/store/analysis-store';
import type { Square } from 'chess.js';

// Custom board colors for dark chess theme
const BOARD_COLORS = {
  lightSquareStyle: { backgroundColor: '#b7c0d8' },
  darkSquareStyle: { backgroundColor: '#8796b0' },
};

// Mistake type → highlight color mapping
const MISTAKE_HIGHLIGHT_COLORS: Record<string, string> = {
  blunder: 'rgba(239, 68, 68, 0.45)',
  mistake: 'rgba(249, 115, 22, 0.4)',
  inaccuracy: 'rgba(234, 179, 8, 0.4)',
  good: 'rgba(34, 197, 94, 0.35)',
  brilliant: 'rgba(6, 182, 212, 0.4)',
};

interface ChessBoardComponentProps {
  onLiveMove?: (san: string, fen: string) => void;
  showSuggestions?: boolean;
}

export function ChessBoardComponent({ onLiveMove, showSuggestions = true }: ChessBoardComponentProps) {
  const {
    analysisResult,
    currentMoveIndex,
    gameMode,
    liveCurrentFen,
    liveSuggestedMove,
  } = useAnalysisStore();

  const validLiveSuggestion = useMemo(() => {
    if (gameMode !== 'play' || !liveSuggestedMove || liveSuggestedMove.length < 4) return null;

    try {
      const chess = new Chess(liveCurrentFen);
      const from = liveSuggestedMove.slice(0, 2) as Square;
      const to = liveSuggestedMove.slice(2, 4) as Square;
      const promotion = liveSuggestedMove.slice(4, 5) || undefined;
      const move = chess.move({ from, to, promotion });
      if (!move) return null;
      return {
        from,
        to,
      };
    } catch {
      return null;
    }
  }, [gameMode, liveCurrentFen, liveSuggestedMove]);

  // Derive board FEN
  const boardFen = useMemo(() => {
    if (gameMode === 'play') {
      return liveCurrentFen;
    }
    if (!analysisResult || currentMoveIndex < 0) {
      return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    }
    return analysisResult.moves[currentMoveIndex]?.fen ?? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }, [gameMode, liveCurrentFen, analysisResult, currentMoveIndex]);

  // Compute square highlights for mistakes at current position (only in review mode)
  const squareStyles = useMemo(() => {
    if (gameMode === 'play') return {};
    if (!analysisResult || currentMoveIndex < 0) return {};

    const currentMove = analysisResult.moves[currentMoveIndex];
    if (!currentMove) return {};

    const mistakeType = currentMove.mistakeType;
    if (mistakeType === 'best' || mistakeType === 'good') return {};

    const color = MISTAKE_HIGHLIGHT_COLORS[mistakeType];
    if (!color) return {};

    // Try to highlight the square of the moved piece
    try {
      const chess = new Chess();
      if (currentMoveIndex > 0) {
        const prevFen = analysisResult.moves[currentMoveIndex - 1]?.fen ?? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        chess.load(prevFen);
      }
      const san = currentMove.san;
      const move = chess.move(san);
      if (move) {
        return {
          [move.to as string]: { backgroundColor: color },
          [move.from as string]: { backgroundColor: `${color.replace('0.4', '0.2').replace('0.45', '0.2').replace('0.35', '0.15')}` },
        };
      }
    } catch {
      // Position parsing failed — return empty
    }

    return {};
  }, [gameMode, analysisResult, currentMoveIndex]);

  // Compute visual helper arrows (best move suggestions)
  const boardArrows = useMemo(() => {
    if (!showSuggestions) return [];
    if (gameMode === 'play') {
      if (validLiveSuggestion) {
        return [[validLiveSuggestion.from, validLiveSuggestion.to]];
      }
      return [];
    }

    if (!analysisResult || currentMoveIndex < 0) return [];

    const currentMove = analysisResult.moves[currentMoveIndex];
    if (!currentMove?.bestMove || currentMove.mistakeType === 'best') return [];

    // Parse UCI move (e.g. "e2e4") into from/to squares
    const uci = currentMove.bestMove;
    if (uci.length >= 4) {
      const from = uci.slice(0, 2) as Square;
      const to = uci.slice(2, 4) as Square;
      return [[from, to]];
    }
    return [];
  }, [gameMode, validLiveSuggestion, analysisResult, currentMoveIndex, showSuggestions]);

  // Handle piece dragging validity
  const isDraggablePiece = useCallback(
    (args: { piece: string }) => {
      const state = useAnalysisStore.getState();
      if (state.gameMode !== 'play') return false;
      if (!state.liveGameStarted) return false;

      // Allow dragging only at the latest position
      if (state.liveMoves.length > 0 && state.liveCurrentFen !== state.liveMoves[state.liveMoves.length - 1].fen) {
        return false;
      }

      const chess = new Chess(state.liveCurrentFen);
      // Only allow drag if game is active, it's White's turn, and the piece is White
      return (
        !chess.isGameOver() &&
        chess.turn() === 'w' &&
        args.piece.startsWith('w')
      );
    },
    []
  );

  // Handle piece drop move validation
  const onPieceDrop = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      const state = useAnalysisStore.getState();
      if (state.gameMode !== 'play') return false;
      if (!state.liveGameStarted) return false;

      try {
        const chess = new Chess(state.liveCurrentFen);
        const move = chess.move({
          from: sourceSquare as Square,
          to: targetSquare as Square,
          promotion: 'q',
        });

        if (move) {
          state.setLiveCurrentFen(chess.fen());
          if (onLiveMove) {
            onLiveMove(move.san, chess.fen());
          }
          return true;
        }
      } catch {
        // Invalid move
      }
      return false;
    },
    [onLiveMove]
  );

  return (
    <div className="chess-board-wrapper w-full max-w-[480px] mx-auto">
      <Chessboard
        id="checkmate-ai-board"
        position={boardFen}
        boardOrientation="white"
        areArrowsAllowed={false}
        customSquareStyles={squareStyles}
        customArrows={boardArrows}
        customArrowColor="#22c55e"
        customLightSquareStyle={BOARD_COLORS.lightSquareStyle}
        customDarkSquareStyle={BOARD_COLORS.darkSquareStyle}
        customBoardStyle={{
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
        isDraggablePiece={isDraggablePiece}
        onPieceDrop={onPieceDrop}
        animationDuration={200}
      />
    </div>
  );
}
