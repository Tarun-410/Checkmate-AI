// ============================================================
// Checkmate AI — Global TypeScript Type Definitions
// ============================================================

export type MistakeType = 'blunder' | 'mistake' | 'inaccuracy' | 'good' | 'brilliant' | 'best';

export interface ChessMove {
  moveNumber: number;
  san: string; // Standard Algebraic Notation (e.g. "e4")
  fen: string; // FEN string after this move
  color: 'w' | 'b';
  evalBefore: number; // Centipawn evaluation before move
  evalAfter: number; // Centipawn evaluation after move
  evalSwing: number; // Change in evaluation (negative = bad for mover)
  mistakeType: MistakeType;
  bestMove?: string; // Best move in UCI notation
  bestMoveSan?: string; // Best move in SAN
  aiExplanation?: string; // AI Coach explanation for this move
}

export interface GameMistake {
  id?: string;
  gameId?: string;
  moveNumber: number;
  moveSan: string;
  mistakeType: MistakeType;
  evalBefore: number;
  evalAfter: number;
  evalSwing: number;
  bestMoveSan?: string;
  aiExplanation: string;
  positionFen: string;
}

export interface AnalyzedGame {
  id?: string;
  userId?: string;
  pgn: string;
  title?: string;
  opponentName?: string;
  totalMoves: number;
  blunderCount: number;
  inaccuracyCount: number;
  mistakeCount: number;
  averageAccuracy: number;
  mistakes: GameMistake[];
  moves: ChessMove[];
  createdAt?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  chessRating?: number;
  preferredOpenings?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface CoachingMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface CoachingSession {
  id?: string;
  userId: string;
  gameId?: string;
  messages: CoachingMessage[];
  createdAt?: string;
}

export interface StockfishAnalysis {
  fen: string;
  depth: number;
  score: number; // centipawns (from white's perspective)
  mate?: number; // moves to mate (null if no mate)
  bestMove: string; // UCI notation
  pv?: string[]; // principal variation (sequence of best moves)
}

export interface AnalysisRequest {
  pgn: string;
  playerColor?: 'w' | 'b';
  playerRating?: number;
}

export interface AnalysisResult {
  moves: ChessMove[];
  mistakes: GameMistake[];
  blunderCount: number;
  inaccuracyCount: number;
  mistakeCount: number;
  averageAccuracy: number;
  gameId?: string;
}

export interface CoachRequest {
  message: string;
  playerRating?: number;
  currentFen?: string;
  currentMoveContext?: string;
  sessionHistory?: CoachingMessage[];
  gameContext?: {
    blunderCount: number;
    inaccuracyCount: number;
    averageAccuracy: number;
  };
}

export interface WeaknessStats {
  mostCommonMistake: MistakeType | null;
  blunderRate: number; // blunders per game
  averageAccuracy: number;
  bestOpeningPerformance: string | null;
  totalGamesAnalyzed: number;
  recentTrend: 'improving' | 'declining' | 'stable';
}

export interface DailyTip {
  id: string;
  title: string;
  content: string;
  category: 'tactics' | 'endgame' | 'opening' | 'strategy' | 'mindset';
}
