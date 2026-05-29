// ============================================================
// Zustand Store — Global analysis state management
// ============================================================
import { create } from 'zustand';
import type { AnalysisResult, ChessMove, GameMistake, CoachingMessage } from '@/types';

interface AnalysisState {
  // PGN Input
  pgn: string;
  setPgn: (pgn: string) => void;

  // Analysis state
  isAnalyzing: boolean;
  analysisResult: AnalysisResult | null;
  analysisError: string | null;
  setAnalyzing: (v: boolean) => void;
  setAnalysisResult: (result: AnalysisResult) => void;
  setAnalysisError: (err: string | null) => void;

  // Board navigation — which move is currently displayed
  currentMoveIndex: number;
  setCurrentMoveIndex: (idx: number) => void;

  // Currently selected mistake for coaching context
  selectedMistake: GameMistake | null;
  setSelectedMistake: (m: GameMistake | null) => void;

  // Coaching chat messages
  coachMessages: CoachingMessage[];
  addCoachMessage: (msg: CoachingMessage) => void;
  setCoachMessages: (msgs: CoachingMessage[]) => void;
  clearCoachMessages: () => void;

  // Stockfish readiness
  stockfishReady: boolean;
  setStockfishReady: (v: boolean) => void;

  // Game Mode: 'review' (Upload PGN) or 'play' (Play vs Coach)
  gameMode: 'review' | 'play';
  setGameMode: (mode: 'review' | 'play') => void;

  // Live Play state
  liveGameStarted: boolean;
  setLiveGameStarted: (v: boolean) => void;
  liveCurrentFen: string;
  liveSuggestedMove: string | null;
  liveSuggestedMoveSan: string | null;
  liveCoachFeedback: string | null;
  liveMoves: ChessMove[];
  liveClassification: string | null;
  liveIsAnalyzingMove: boolean;

  setLiveCurrentFen: (fen: string) => void;
  setLiveSuggestedMove: (move: string | null) => void;
  setLiveSuggestedMoveSan: (moveSan: string | null) => void;
  setLiveCoachFeedback: (feedback: string | null) => void;
  setLiveMoves: (moves: ChessMove[]) => void;
  setLiveClassification: (classification: string | null) => void;
  setLiveIsAnalyzingMove: (v: boolean) => void;
  resetLiveGame: () => void;

  // Reset everything
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  pgn: '',
  setPgn: (pgn) => set({ pgn }),

  isAnalyzing: false,
  analysisResult: null,
  analysisError: null,
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setAnalysisResult: (analysisResult) => set({ analysisResult, analysisError: null }),
  setAnalysisError: (analysisError) => set({ analysisError, isAnalyzing: false }),

  currentMoveIndex: -1, // -1 = starting position
  setCurrentMoveIndex: (currentMoveIndex) => set({ currentMoveIndex }),

  selectedMistake: null,
  setSelectedMistake: (selectedMistake) => set({ selectedMistake }),

  coachMessages: [],
  addCoachMessage: (msg) =>
    set((state) => ({ coachMessages: [...state.coachMessages, msg] })),
  setCoachMessages: (coachMessages) => set({ coachMessages }),
  clearCoachMessages: () => set({ coachMessages: [] }),

  stockfishReady: false,
  setStockfishReady: (stockfishReady) => set({ stockfishReady }),

  // Game Mode
  gameMode: 'review',
  setGameMode: (gameMode) => set({ gameMode }),

  // Live play initial state
  liveGameStarted: false,
  setLiveGameStarted: (liveGameStarted) => set({ liveGameStarted }),
  liveCurrentFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  liveSuggestedMove: null,
  liveSuggestedMoveSan: null,
  liveCoachFeedback: null,
  liveMoves: [],
  liveClassification: null,
  liveIsAnalyzingMove: false,

  setLiveCurrentFen: (liveCurrentFen) => set({ liveCurrentFen }),
  setLiveSuggestedMove: (liveSuggestedMove) => set({ liveSuggestedMove }),
  setLiveSuggestedMoveSan: (liveSuggestedMoveSan) => set({ liveSuggestedMoveSan }),
  setLiveCoachFeedback: (liveCoachFeedback) => set({ liveCoachFeedback }),
  setLiveMoves: (liveMoves) => set({ liveMoves }),
  setLiveClassification: (liveClassification) => set({ liveClassification }),
  setLiveIsAnalyzingMove: (liveIsAnalyzingMove) => set({ liveIsAnalyzingMove }),
  resetLiveGame: () =>
    set({
      liveGameStarted: false,
      liveCurrentFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      liveSuggestedMove: null,
      liveSuggestedMoveSan: null,
      liveCoachFeedback: null,
      liveMoves: [],
      liveClassification: null,
      liveIsAnalyzingMove: false,
    }),

  reset: () =>
    set({
      pgn: '',
      isAnalyzing: false,
      analysisResult: null,
      analysisError: null,
      currentMoveIndex: -1,
      selectedMistake: null,
      coachMessages: [],
      stockfishReady: false,
      gameMode: 'review',
      liveGameStarted: false,
      liveCurrentFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      liveSuggestedMove: null,
      liveSuggestedMoveSan: null,
      liveCoachFeedback: null,
      liveMoves: [],
      liveClassification: null,
      liveIsAnalyzingMove: false,
    }),
}));
