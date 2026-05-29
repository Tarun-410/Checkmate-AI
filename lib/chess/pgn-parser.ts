// ============================================================
// PGN Parser — utilities for parsing chess PGN strings
// Uses chess.js for robust parsing
// ============================================================
import { Chess } from 'chess.js';

export interface ParsedPosition {
  fen: string;
  san: string;
  color: 'w' | 'b';
  moveNumber: number;
}

export interface PgnParseResult {
  positions: ParsedPosition[];
  pgn: string;
  isValid: boolean;
  error?: string;
}

/**
 * Parse a PGN string and extract all positions (FEN after each move)
 * Returns array of {fen, san, color, moveNumber} for each half-move
 */
export function parsePgn(pgn: string): PgnParseResult {
  const chess = new Chess();

  try {
    // Try to load the PGN
    chess.loadPgn(pgn.trim());
  } catch {
    return {
      positions: [],
      pgn,
      isValid: false,
      error: 'Invalid PGN format. Please check your game notation.',
    };
  }

  // Replay from the start to collect all positions
  const history = chess.history({ verbose: true });

  if (history.length === 0) {
    return {
      positions: [],
      pgn,
      isValid: false,
      error: 'No moves found in PGN.',
    };
  }

  // Reconstruct positions by replaying moves
  const replayChess = new Chess();
  const positions: ParsedPosition[] = [];
  let moveCount = 1;
  let colorIndex = 0;

  for (const move of history) {
    replayChess.move(move.san);
    const color = colorIndex % 2 === 0 ? 'w' : 'b';
    positions.push({
      fen: replayChess.fen(),
      san: move.san,
      color: color as 'w' | 'b',
      moveNumber: color === 'w' ? moveCount : moveCount,
    });
    if (color === 'b') moveCount++;
    colorIndex++;
  }

  return {
    positions,
    pgn,
    isValid: true,
  };
}

/**
 * Validate if a string is a valid PGN
 */
export function validatePgn(pgn: string): { valid: boolean; error?: string } {
  const result = parsePgn(pgn);
  return { valid: result.isValid, error: result.error };
}

/**
 * Get the starting FEN for a game from PGN headers
 * Returns null if using the standard starting position
 */
export function getStartingFen(pgn: string): string | null {
  const fenMatch = pgn.match(/\[FEN "([^"]+)"\]/);
  return fenMatch ? fenMatch[1] : null;
}

/**
 * Extract metadata from PGN headers
 */
export function extractPgnMetadata(pgn: string): Record<string, string> {
  const metadata: Record<string, string> = {};
  const headerRegex = /\[(\w+)\s+"([^"]+)"\]/g;
  let match;
  while ((match = headerRegex.exec(pgn)) !== null) {
    metadata[match[1]] = match[2];
  }
  return metadata;
}
