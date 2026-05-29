// ============================================================
// useGameAnalysis Hook — Orchestrates full game analysis pipeline
// PGN → Positions → Stockfish → Classify → OpenAI → Display
// ============================================================
'use client';

import { useCallback } from 'react';
import { Chess } from 'chess.js';
import { useAnalysisStore } from '@/store/analysis-store';
import { parsePgn } from '@/lib/chess/pgn-parser';
import {
  buildMovesWithClassification,
  extractMistakes,
  calculateAccuracy,
  filterSignificantMistakes,
} from '@/lib/chess/mistake-detector';
import type { AnalysisResult, ChessMove } from '@/types';

/**
 * Hook that provides the analyzeGame function
 * Coordinates between PGN parser, Stockfish, and OpenAI API
 */
export function useGameAnalysis() {
  const { setAnalyzing, setAnalysisResult, setAnalysisError, pgn } =
    useAnalysisStore();

  const analyzeGame = useCallback(
    async (pgnInput: string, playerRating?: number) => {
      setAnalyzing(true);
      setAnalysisError(null);

      try {
        // Step 1: Parse PGN into positions
        const parseResult = parsePgn(pgnInput);
        if (!parseResult.isValid) {
          setAnalysisError(parseResult.error ?? 'Invalid PGN');
          return;
        }

        const { positions } = parseResult;
        if (positions.length === 0) {
          setAnalysisError('No moves found in the PGN.');
          return;
        }

        // Step 2: Run Stockfish analysis via API route
        // We send positions to the server-side API which runs mock analysis
        // In production, this would call actual Stockfish WASM client-side
        const analysisResponse = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pgn: pgnInput,
            positions: positions.map((p) => ({ fen: p.fen, san: p.san })),
            playerRating,
          }),
        });

        if (!analysisResponse.ok) {
          const err = await analysisResponse.json();
          throw new Error(err.error ?? 'Analysis failed');
        }

        const result: AnalysisResult = await analysisResponse.json();

        setAnalysisResult(result);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unknown error occurred';
        setAnalysisError(message);
      }
    },
    [setAnalyzing, setAnalysisResult, setAnalysisError]
  );

  return { analyzeGame };
}

/**
 * Generate mock evaluations for demo mode (when no API keys configured)
 * Creates realistic-looking evaluations for a game
 */
export function generateMockEvaluations(
  positions: Array<{ fen: string; san: string }>
): Array<{ score: number; bestMove: string; bestMoveSan?: string }> {
  let score = 0;
  return positions.map((_, i) => {
    // Simulate evaluation drift with occasional swings
    const drift = (Math.random() - 0.48) * 30;
    const suddenSwing = Math.random() < 0.08 ? (Math.random() - 0.5) * 300 : 0;
    score = Math.max(-800, Math.min(800, score + drift + suddenSwing));
    return {
      score: Math.round(score),
      bestMove: 'e2e4', // mock best move
      bestMoveSan: 'e4',
    };
  });
}
