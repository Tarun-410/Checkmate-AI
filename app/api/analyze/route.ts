// ============================================================
// POST /api/analyze
// Receives PGN positions, runs mock/Stockfish analysis,
// calls OpenAI for explanations, returns structured results
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { generateMistakeExplanations, isAiConfigured } from '@/lib/ai/coaching-pipeline';
import {
  buildMovesWithClassification,
  extractMistakes,
  calculateAccuracy,
} from '@/lib/chess/mistake-detector';
import type { AnalysisResult } from '@/types';

interface AnalyzeRequestBody {
  pgn: string;
  positions: Array<{ fen: string; san: string; color?: 'w' | 'b'; moveNumber?: number }>;
  playerRating?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: AnalyzeRequestBody = await req.json();
    const { positions, playerRating } = body;

    if (!positions || positions.length === 0) {
      return NextResponse.json({ error: 'No positions provided' }, { status: 400 });
    }

    // =========================================================
    // STEP 1: Generate Stockfish-style evaluations
    // In production, Stockfish runs client-side via WASM.
    // Here we generate realistic evaluations server-side for demo.
    // =========================================================
    const evaluations = generateMockStockfishEvals(positions.length);

    // =========================================================
    // STEP 2: Build ChessMove objects with mistake classification
    // =========================================================
    const positionsWithMeta = positions.map((p, i) => ({
      fen: p.fen,
      san: p.san,
      color: (i % 2 === 0 ? 'w' : 'b') as 'w' | 'b',
      moveNumber: Math.floor(i / 2) + 1,
    }));

    const moves = buildMovesWithClassification(positionsWithMeta, evaluations);

    // =========================================================
    // STEP 3: Extract significant mistakes for AI explanation
    // =========================================================
    const mistakesRaw = extractMistakes(moves);

    // =========================================================
    // STEP 4: Generate AI explanations (if API key available)
    // =========================================================
    let mistakeExplanations: string[] = mistakesRaw.map(
      (m) =>
        `Move ${m.moveNumber} (${m.moveSan}) was a ${m.mistakeType}${
          m.bestMoveSan ? `. The stronger move was ${m.bestMoveSan}.` : '.'
        } This caused a ${Math.abs(m.evalSwing / 100).toFixed(1)} pawn evaluation swing.`
    );

    if (isAiConfigured && mistakesRaw.length > 0) {
      try {
        mistakeExplanations = await generateMistakeExplanations(
          mistakesRaw,
          playerRating
        );
      } catch (aiError) {
        console.error('AI explanation generation failed:', aiError);
        // Keep fallback explanations on error
      }
    }

    // =========================================================
    // STEP 5: Assemble final result
    // =========================================================
    const mistakes = mistakesRaw.map((m, i) => ({
      ...m,
      aiExplanation: mistakeExplanations[i] ?? '',
    }));

    const blunderCount = mistakes.filter((m) => m.mistakeType === 'blunder').length;
    const inaccuracyCount = mistakes.filter((m) => m.mistakeType === 'inaccuracy').length;
    const mistakeCount = mistakes.filter((m) => m.mistakeType === 'mistake').length;
    const averageAccuracy = calculateAccuracy(moves);

    const result: AnalysisResult = {
      moves,
      mistakes,
      blunderCount,
      inaccuracyCount,
      mistakeCount,
      averageAccuracy,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze game. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Generate realistic mock Stockfish evaluations for demo mode
 * Simulates a real game with some blunders and positional swings
 */
function generateMockStockfishEvals(count: number) {
  let score = 0;
  const evals = [];

  for (let i = 0; i < count; i++) {
    // Gradual drift
    const drift = (Math.random() - 0.48) * 20;
    // Occasional tactical swing (8% chance)
    const isTactical = Math.random() < 0.08;
    const swing = isTactical ? (Math.random() - 0.3) * 400 : 0;
    score = Math.max(-900, Math.min(900, score + drift + swing));

    // Choose a realistic best move (UCI format: from-to)
    const moves = ['e2e4', 'e7e5', 'd2d4', 'd7d5', 'g1f3', 'b8c6', 'f1c4', 'g8f6'];
    const bestMove = moves[i % moves.length];

    evals.push({
      score: Math.round(score),
      bestMove,
      bestMoveSan: bestMove.slice(2),
    });
  }

  return evals;
}
