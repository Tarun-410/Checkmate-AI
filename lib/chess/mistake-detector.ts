// ============================================================
// Mistake Detector — classify moves as blunders/inaccuracies/mistakes
// based on evaluation swing thresholds used by chess platforms
// ============================================================
import type { ChessMove, GameMistake, MistakeType } from '@/types';

// Evaluation thresholds (in centipawns)
// Based on Chess.com and Lichess classification standards
export const MISTAKE_THRESHOLDS = {
  BLUNDER: 200,      // > 2.0 pawn swing = blunder
  MISTAKE: 100,      // > 1.0 pawn swing = mistake
  INACCURACY: 50,    // > 0.5 pawn swing = inaccuracy
} as const;

/**
 * Classify a move based on evaluation swing
 * evalSwing is always from the perspective of the player who just moved
 * (positive = good for them, negative = bad for them)
 */
export function classifyMove(evalSwing: number): MistakeType {
  const swing = Math.abs(evalSwing);

  if (evalSwing > 0) {
    // Move GAINED evaluation — could be good or brilliant
    if (swing > MISTAKE_THRESHOLDS.BLUNDER) return 'brilliant';
    return 'good';
  }

  // Move LOST evaluation
  if (swing >= MISTAKE_THRESHOLDS.BLUNDER) return 'blunder';
  if (swing >= MISTAKE_THRESHOLDS.MISTAKE) return 'mistake';
  if (swing >= MISTAKE_THRESHOLDS.INACCURACY) return 'inaccuracy';
  return 'best';
}

/**
 * Filter moves to only the significant mistakes (blunders, mistakes, inaccuracies)
 * Limit to most impactful ones to avoid overwhelming the user
 */
export function filterSignificantMistakes(moves: ChessMove[]): ChessMove[] {
  return moves.filter((m) =>
    m.mistakeType === 'blunder' ||
    m.mistakeType === 'mistake' ||
    m.mistakeType === 'inaccuracy'
  );
}

/**
 * Calculate accuracy score from 0-100 for all moves
 * Formula inspired by Chess.com's accuracy calculation
 */
export function calculateAccuracy(moves: ChessMove[]): number {
  if (moves.length === 0) return 0;

  const accuracyScores = moves.map((move) => {
    const swing = Math.abs(move.evalSwing);
    if (swing >= MISTAKE_THRESHOLDS.BLUNDER) return 0;
    if (swing >= MISTAKE_THRESHOLDS.MISTAKE) return 25;
    if (swing >= MISTAKE_THRESHOLDS.INACCURACY) return 60;
    return 100;
  });

  return Math.round(
    accuracyScores.reduce((sum: number, s) => sum + s, 0) / accuracyScores.length
  );
}

/**
 * Convert raw Stockfish evaluations to ChessMove objects with mistake classification
 */
export function buildMovesWithClassification(
  positions: Array<{
    fen: string;
    san: string;
    color: 'w' | 'b';
    moveNumber: number;
  }>,
  evaluations: Array<{
    score: number; // centipawns from white's perspective
    bestMove: string;
    bestMoveSan?: string;
  }>
): ChessMove[] {
  return positions.map((pos, i) => {
    const evalBefore = i === 0 ? 0 : evaluations[i - 1]?.score ?? 0;
    const evalAfter = evaluations[i]?.score ?? evalBefore;

    // Calculate swing from the perspective of the player who just moved
    // White wants higher evaluation, black wants lower
    const rawSwing = pos.color === 'w'
      ? evalAfter - evalBefore
      : evalBefore - evalAfter;

    return {
      moveNumber: pos.moveNumber,
      san: pos.san,
      fen: pos.fen,
      color: pos.color,
      evalBefore,
      evalAfter,
      evalSwing: rawSwing,
      mistakeType: classifyMove(rawSwing),
      bestMove: evaluations[i]?.bestMove,
      bestMoveSan: evaluations[i]?.bestMoveSan,
    };
  });
}

/**
 * Convert ChessMove array into GameMistake objects
 * (only for moves classified as blunders/mistakes/inaccuracies)
 */
export function extractMistakes(moves: ChessMove[]): Omit<GameMistake, 'aiExplanation'>[] {
  return filterSignificantMistakes(moves).map((move) => ({
    moveNumber: move.moveNumber,
    moveSan: move.san,
    mistakeType: move.mistakeType,
    evalBefore: move.evalBefore,
    evalAfter: move.evalAfter,
    evalSwing: move.evalSwing,
    bestMoveSan: move.bestMoveSan,
    positionFen: move.fen,
  }));
}

/**
 * Get a human-readable label for a mistake type
 */
export function getMistakeLabel(type: MistakeType): string {
  switch (type) {
    case 'blunder': return '??';
    case 'mistake': return '?';
    case 'inaccuracy': return '?!';
    case 'good': return '!';
    case 'brilliant': return '!!';
    case 'best': return '';
    default: return '';
  }
}

/**
 * Format centipawn value to human-readable string
 * e.g. 150 → "+1.5", -300 → "-3.0", 0 → "0.0"
 */
export function formatEval(centipawns: number, isMate?: number): string {
  if (isMate !== undefined) {
    return isMate > 0 ? `M${isMate}` : `-M${Math.abs(isMate)}`;
  }
  const pawns = centipawns / 100;
  return pawns >= 0 ? `+${pawns.toFixed(1)}` : `${pawns.toFixed(1)}`;
}
