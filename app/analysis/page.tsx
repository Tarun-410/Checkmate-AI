'use client';

import { useState, useMemo, ComponentType, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChessBoardComponent } from '@/components/analysis/ChessBoard';
import { EvaluationBar } from '@/components/analysis/EvaluationBar';
import { MoveList } from '@/components/analysis/MoveList';
import { MistakeList } from '@/components/analysis/MistakeCard';
import { PGNInput } from '@/components/analysis/PGNInput';
import { CoachingChat, MarkdownRenderer } from '@/components/coaching/CoachingChat';
import { useAnalysisStore } from '@/store/analysis-store';
import { Chess } from 'chess.js';
import { formatEval } from '@/lib/chess/mistake-detector';
import {
  COACH_DIFFICULTIES,
  DEFAULT_COACH_DIFFICULTY,
  getCoachDifficultyById,
} from '@/lib/chess/coach-difficulty';
import type { ChessMove } from '@/types';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  SkipBack,
  SkipForward,
  Brain,
  ListOrdered,
  AlertTriangle,
  Upload,
  Loader2,
  Play,
  Swords,
  Sparkles,
} from 'lucide-react';

type ActiveTab = 'input' | 'moves' | 'mistakes' | 'coach' | 'play';

export default function AnalysisPage() {
  const {
    isAnalyzing,
    analysisResult,
    currentMoveIndex,
    setCurrentMoveIndex,
    reset,
    gameMode,
    setGameMode,
    liveCurrentFen,
    setLiveCurrentFen,
    setLiveSuggestedMove,
    liveSuggestedMoveSan,
    setLiveSuggestedMoveSan,
    liveCoachFeedback,
    setLiveCoachFeedback,
    liveMoves,
    setLiveMoves,
    liveClassification,
    setLiveClassification,
    liveIsAnalyzingMove,
    setLiveIsAnalyzingMove,
    resetLiveGame,
    liveGameStarted,
    setLiveGameStarted,
  } = useAnalysisStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>('input');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [coachDifficulty, setCoachDifficulty] = useState(DEFAULT_COACH_DIFFICULTY);

  const coachRating = getCoachDifficultyById(coachDifficulty).rating;

  const resolveLegalSuggestion = (fen: string, uci?: string | null) => {
    if (!uci || uci.length < 4) return null;

    try {
      const chess = new Chess(fen);
      const from = uci.slice(0, 2);
      const to = uci.slice(2, 4);
      const promotion = uci.slice(4, 5) || undefined;
      const move = chess.move({ from, to, promotion });
      if (!move) return null;

      return {
        uci: `${from}${to}${promotion ?? ''}`,
        san: move.san,
      };
    } catch {
      return null;
    }
  };

  // Dynamic moves helper based on gameMode
  const moves = useMemo(() => {
    return gameMode === 'play' ? liveMoves : analysisResult?.moves ?? [];
  }, [gameMode, liveMoves, analysisResult]);

  // Derive active game conditions
  const { isOpponentTurn, isLiveGameOver } = useMemo(() => {
    if (gameMode !== 'play') return { isOpponentTurn: false, isLiveGameOver: false };
    try {
      const chess = new Chess(liveCurrentFen);
      return {
        isOpponentTurn: chess.turn() === 'b',
        isLiveGameOver: chess.isGameOver(),
      };
    } catch {
      return { isOpponentTurn: false, isLiveGameOver: false };
    }
  }, [gameMode, liveCurrentFen]);

  const isNextDisabled = () => {
    if (gameMode === 'play') {
      if (liveMoves.length === 0) return true;
      const isLatestMove = currentMoveIndex >= liveMoves.length - 1;
      if (isLatestMove) {
        return !isOpponentTurn || isLiveGameOver;
      }
      return false;
    }
    return moves.length === 0 || currentMoveIndex >= moves.length - 1;
  };

  // Ref and Effect to auto-scroll AI Coach commentary to the bottom
  const coachFeedbackEndRef = useRef<HTMLDivElement>(null);
  const liveMovesLength = liveMoves.length;
  useEffect(() => {
    if (activeTab === 'play') {
      coachFeedbackEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveCoachFeedback, liveMovesLength, activeTab]);

  // Navigate board moves
  const goToPrev = () => {
    if (currentMoveIndex > 0) {
      const prevIdx = currentMoveIndex - 1;
      setCurrentMoveIndex(prevIdx);
      if (gameMode === 'play') {
        setLiveCurrentFen(liveMoves[prevIdx].fen);
      }
    } else if (currentMoveIndex === 0) {
      setCurrentMoveIndex(-1);
      if (gameMode === 'play') {
        setLiveCurrentFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      }
    }
  };

  const goToNext = () => {
    if (gameMode === 'play') {
      const isLatestMove = currentMoveIndex === liveMoves.length - 1;
      if (isLatestMove && isOpponentTurn && !isLiveGameOver) {
        triggerBotMove();
        return;
      }
    }

    if (moves.length === 0) return;
    if (currentMoveIndex < moves.length - 1) {
      const nextIdx = currentMoveIndex + 1;
      setCurrentMoveIndex(nextIdx);
      if (gameMode === 'play') {
        setLiveCurrentFen(liveMoves[nextIdx].fen);
      }
    }
  };

  const goToStart = () => {
    setCurrentMoveIndex(-1);
    if (gameMode === 'play') {
      setLiveCurrentFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    }
  };

  const goToEnd = () => {
    if (moves.length === 0) return;
    const endIdx = moves.length - 1;
    setCurrentMoveIndex(endIdx);
    if (gameMode === 'play') {
      setLiveCurrentFen(liveMoves[endIdx].fen);
    }
  };

  const handleTabChange = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    if (tabId === 'play') {
      setGameMode('play');
      // If live play game has not started, initialize it
      if (!liveGameStarted && liveMoves.length === 0) {
        setLiveCurrentFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        setLiveCoachFeedback("Welcome to Play vs Coach mode! Make your first move as White by dragging a piece. I will analyze your move and reply immediately.");
      }
    } else {
      setGameMode('review');
    }
  };

  // Stream Coach Feedback using /api/coach Server-Sent Events (SSE)
  const streamLiveCoachFeedback = async (move: ChessMove): Promise<string> => {
    try {
      const isWhite = move.color === 'w';
      const moveStr = `${move.moveNumber}. ${isWhite ? move.san : '... ' + move.san}`;
      
      let message = '';
      if (move.mistakeType === 'best' || move.mistakeType === 'good' || move.mistakeType === 'brilliant') {
        message = `In this position, the ${isWhite ? 'player' : 'computer opponent'} played ${moveStr}. Move classification: "${move.mistakeType}". Evaluation: ${formatEval(move.evalAfter)}. Explain why this is good in 1-2 short, simple sentences.`;
      } else {
        message = `In this position, the ${isWhite ? 'player' : 'computer opponent'} played ${moveStr}. Move classification: "${move.mistakeType}" (evaluation swing: ${Math.abs(move.evalSwing / 100).toFixed(1)} pawns). Best move: ${move.bestMoveSan}. Explain why this is a mistake and the threat in 1-2 short, simple sentences.`;
      }

      const currentMoveContext = `Move ${move.moveNumber}: ${move.color === 'w' ? 'White' : 'Black'} played ${move.san}. Mistake classification: ${move.mistakeType}. Evaluation swing: ${move.evalSwing} centipawns.`;

      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            playerRating: coachRating,
            currentFen: move.fen,
            currentMoveContext,
            sessionHistory: [],
        }),
      });

      if (!response.ok) throw new Error('SSE failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return '';

      let accumulated = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content ?? '';
              accumulated += delta;
              setLiveCoachFeedback(accumulated);
            } catch {}
          }
        }
      }
      return accumulated;
    } catch (err) {
      console.error('Streaming feedback error:', err);
      const fallback = `Move ${move.san} was played. Classification: ${move.mistakeType}. Best move: ${move.bestMoveSan}.`;
      setLiveCoachFeedback(fallback);
      return fallback;
    }
  };

  // Orchestrate user move + analysis
  const handleLiveMove = async (san: string, fen: string) => {
    // Player played move
    const currentPositions = [
      ...liveMoves.map((m) => ({ fen: m.fen, san: m.san })),
      { fen, san },
    ];

    setLiveIsAnalyzingMove(true);
    setLiveClassification(null);
    setLiveSuggestedMove(null);
    setLiveSuggestedMoveSan(null);
    setLiveCoachFeedback('');

    try {
      // 1. Analyze player's move
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            positions: currentPositions,
            playerRating: coachRating,
          }),
        });

      if (!response.ok) throw new Error('Analysis failed');
      const result = await response.json();
      
      const enrichedMoves: ChessMove[] = result.moves;
      setLiveMoves(enrichedMoves);

      const playerMove = enrichedMoves[enrichedMoves.length - 1];
      if (playerMove) {
        setCurrentMoveIndex(enrichedMoves.length - 1);
        setLiveClassification(playerMove.mistakeType);
        const playerSuggestion = resolveLegalSuggestion(liveCurrentFen, playerMove.bestMove);
        setLiveSuggestedMove(playerSuggestion?.uci ?? null);
        setLiveSuggestedMoveSan(playerSuggestion?.san ?? null);

        // Stream Coach commentary
        const feedback = await streamLiveCoachFeedback(playerMove);
        
        // Save the explanation to the move so the Mistakes/Moves tab can render it
        const finalPlayerMoves = enrichedMoves.map((m, idx) =>
          idx === enrichedMoves.length - 1 ? { ...m, aiExplanation: feedback } : m
        );
        setLiveMoves(finalPlayerMoves);
      }
    } catch (err) {
      console.error('Error during player move analysis:', err);
    } finally {
      setLiveIsAnalyzingMove(false);
    }
  };

  // Trigger Bot's move + analysis on demand
  const triggerBotMove = async () => {
    if (isBotThinking || liveIsAnalyzingMove) return;

    setIsBotThinking(true);
    setLiveIsAnalyzingMove(true);
    setLiveClassification(null);
    setLiveSuggestedMove(null);
    setLiveSuggestedMoveSan(null);
    setLiveCoachFeedback('');

    try {
      const chess = new Chess(liveCurrentFen);
      if (chess.isGameOver()) {
        setIsBotThinking(false);
        setLiveIsAnalyzingMove(false);
        return;
      }

      // Get the suggested best move from the last player move
      const lastPlayerMove = liveMoves[liveMoves.length - 1];
      const suggestedUci = lastPlayerMove?.bestMove;

      let botMoveSan = '';
      let botMoveFen = '';

      if (suggestedUci && suggestedUci.length >= 4) {
        try {
          const tempChess = new Chess(liveCurrentFen);
          const from = suggestedUci.slice(0, 2);
          const to = suggestedUci.slice(2, 4);
          const promotion = suggestedUci.slice(4, 5) || undefined;
          const move = tempChess.move({ from, to, promotion });
          if (move) {
            botMoveSan = move.san;
            botMoveFen = tempChess.fen();
          }
        } catch {
          // suggested move invalid or failed
        }
      }

      // Fallback to random legal move
      if (!botMoveSan) {
        const tempChess = new Chess(liveCurrentFen);
        const legalMoves = tempChess.moves({ verbose: true });
        if (legalMoves.length > 0) {
          const priorityMoves = legalMoves.filter(
            (m) => m.captured || m.san.includes('+') || m.san.includes('#')
          );
          const movesToChooseFrom = priorityMoves.length > 0 ? priorityMoves : legalMoves;
          const randomMove = movesToChooseFrom[Math.floor(Math.random() * movesToChooseFrom.length)];
          const move = tempChess.move(randomMove.san);
          if (move) {
            botMoveSan = move.san;
            botMoveFen = tempChess.fen();
          }
        }
      }

      if (botMoveSan && botMoveFen) {
        // Apply bot move on board FEN
        setLiveCurrentFen(botMoveFen);

        // Analyze bot move
        const botPositions = [
          ...liveMoves.map((m) => ({ fen: m.fen, san: m.san })),
          { fen: botMoveFen, san: botMoveSan },
        ];

        const botAnalyzeResponse = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            positions: botPositions,
            playerRating: coachRating,
          }),
        });

        if (!botAnalyzeResponse.ok) throw new Error('Bot analysis failed');
        const botResult = await botAnalyzeResponse.json();

        const enrichedBotMoves: ChessMove[] = botResult.moves;
        setLiveMoves(enrichedBotMoves);

        const botMove = enrichedBotMoves[enrichedBotMoves.length - 1];
        if (botMove) {
          setCurrentMoveIndex(enrichedBotMoves.length - 1);
          setLiveClassification(botMove.mistakeType);
          const botSuggestion = resolveLegalSuggestion(botMoveFen, botMove.bestMove);
          setLiveSuggestedMove(botSuggestion?.uci ?? null);
          setLiveSuggestedMoveSan(botSuggestion?.san ?? null);

          // Stream Coach commentary for bot move
          const feedback = await streamLiveCoachFeedback(botMove);

          setLiveMoves(
            enrichedBotMoves.map((m, idx) =>
              idx === enrichedBotMoves.length - 1 ? { ...m, aiExplanation: feedback } : m
            )
          );
        }
      }
    } catch (err) {
      console.error('Error in bot move execution:', err);
    } finally {
      setIsBotThinking(false);
      setLiveIsAnalyzingMove(false);
    }
  };

  const tabs: { id: ActiveTab; label: string; icon: ComponentType<{ className?: string }>; count?: number }[] = [
    { id: 'input', label: 'Upload', icon: Upload },
    { id: 'play', label: 'Play vs Coach', icon: Swords },
    { id: 'moves', label: 'Moves', icon: ListOrdered, count: gameMode === 'play' ? liveMoves.length : analysisResult?.moves.length },
    {
      id: 'mistakes',
      label: 'Mistakes',
      icon: AlertTriangle,
      count: gameMode === 'play'
        ? liveMoves.filter(
            (m) =>
              m.mistakeType === 'blunder' ||
              m.mistakeType === 'mistake' ||
              m.mistakeType === 'inaccuracy'
          ).length
        : analysisResult
        ? analysisResult.blunderCount + analysisResult.mistakeCount + analysisResult.inaccuracyCount
        : undefined,
    },
    { id: 'coach', label: 'Coach', icon: Brain },
  ];

  return (
    <div className="min-h-screen bg-[#080810] pt-16">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#f1f5f9]">
              Game Analysis
            </h1>
            <p className="text-sm text-[#475569] mt-0.5">
              {gameMode === 'play'
                ? `${liveMoves.length} moves played in live game`
                : analysisResult
                ? `${analysisResult.moves.length} moves · ${analysisResult.averageAccuracy}% accuracy`
                : 'Upload a PGN or start a live game vs Coach'}
            </p>
          </div>
          {((analysisResult && gameMode !== 'play') || (gameMode === 'play' && liveMoves.length > 0)) && (
            <button
              onClick={() => {
                if (gameMode === 'play') {
                  resetLiveGame();
                  setLiveCurrentFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
                  setLiveCoachFeedback("Welcome to Play vs Coach mode! Make your first move as White by dragging a piece. I will analyze your move and reply immediately.");
                } else {
                  reset();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#94a3b8] border border-[rgba(148,163,184,0.1)] rounded-lg hover:bg-[rgba(148,163,184,0.06)] transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              New Game
            </button>
          )}
        </div>

        {/* Main layout: board + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px] gap-6">
          {/* ================================================
              Left: Chessboard + Controls
              ================================================ */}
          <div className="flex flex-col gap-4">
            {/* Board with eval bar */}
            <div className="flex gap-3 items-start justify-center lg:justify-start">
              {(analysisResult || gameMode === 'play') && (
                <div className="flex-shrink-0">
                  <EvaluationBar />
                </div>
              )}
              <div className="flex-1 flex justify-center lg:justify-start">
                <ChessBoardComponent onLiveMove={handleLiveMove} showSuggestions={showSuggestions} />
              </div>
            </div>

            {/* Board navigation controls */}
            {(analysisResult || gameMode === 'play') && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={goToStart}
                  className="p-2.5 rounded-lg bg-[rgba(15,15,26,0.8)] border border-[rgba(148,163,184,0.08)] text-[#94a3b8] hover:text-white hover:border-[rgba(148,163,184,0.2)] transition-all disabled:opacity-40"
                  disabled={currentMoveIndex < 0}
                  title="Go to start"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={goToPrev}
                  className="p-2.5 rounded-lg bg-[rgba(15,15,26,0.8)] border border-[rgba(148,163,184,0.08)] text-[#94a3b8] hover:text-white hover:border-[rgba(148,163,184,0.2)] transition-all disabled:opacity-40"
                  disabled={currentMoveIndex < 0}
                  title="Previous move"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Position indicator */}
                <div className="px-4 py-2 rounded-lg bg-[rgba(15,15,26,0.8)] border border-[rgba(148,163,184,0.08)] text-xs font-mono text-[#94a3b8] min-w-[80px] text-center">
                  {currentMoveIndex < 0
                    ? 'Start'
                    : gameMode === 'play'
                    ? `${liveMoves[currentMoveIndex]?.moveNumber}${
                        liveMoves[currentMoveIndex]?.color === 'b' ? '...' : '.'
                      }${liveMoves[currentMoveIndex]?.san ?? ''}`
                    : `${analysisResult?.moves[currentMoveIndex]?.moveNumber}${
                        analysisResult?.moves[currentMoveIndex]?.color === 'b' ? '...' : '.'
                      }${analysisResult?.moves[currentMoveIndex]?.san ?? ''}`}
                </div>

                <button
                  onClick={goToNext}
                  className="p-2.5 rounded-lg bg-[rgba(15,15,26,0.8)] border border-[rgba(148,163,184,0.08)] text-[#94a3b8] hover:text-white hover:border-[rgba(148,163,184,0.2)] transition-all disabled:opacity-40"
                  disabled={isNextDisabled()}
                  title="Next move"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={goToEnd}
                  className="p-2.5 rounded-lg bg-[rgba(15,15,26,0.8)] border border-[rgba(148,163,184,0.08)] text-[#94a3b8] hover:text-white hover:border-[rgba(148,163,184,0.2)] transition-all disabled:opacity-40"
                  disabled={moves.length === 0 || currentMoveIndex >= moves.length - 1}
                  title="Go to end"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Analyzing state */}
            {(isAnalyzing || liveIsAnalyzingMove) && (
              <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-[rgba(124,58,237,0.08)] border border-[rgba(124,58,237,0.2)] analyzing-pulse">
                <Loader2 className="w-5 h-5 text-[#7c3aed] animate-spin" />
                <div>
                  <p className="text-sm font-semibold text-[#a855f7]">
                    {liveIsAnalyzingMove ? 'AI Coach is analyzing move...' : 'Analyzing your game...'}
                  </p>
                  <p className="text-xs text-[#475569]">
                    {liveIsAnalyzingMove ? 'Evaluating position + streaming feedback' : 'Running Stockfish + AI explanations'}
                  </p>
                </div>
              </div>
            )}

            {/* Stats when analysis is done */}
            {analysisResult && !isAnalyzing && gameMode !== 'play' && (
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Blunders', value: analysisResult.blunderCount, color: '#ef4444' },
                  { label: 'Mistakes', value: analysisResult.mistakeCount, color: '#f97316' },
                  { label: 'Inaccuracies', value: analysisResult.inaccuracyCount, color: '#eab308' },
                  { label: 'Accuracy', value: `${analysisResult.averageAccuracy}%`, color: '#a855f7' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="text-center p-3 rounded-xl bg-[rgba(15,15,26,0.6)] border border-[rgba(148,163,184,0.08)]"
                  >
                    <div className="text-xl font-black" style={{ color: stat.color }}>
                      {stat.value}
                    </div>
                    <div className="text-[10px] text-[#475569] uppercase tracking-wide font-medium mt-0.5">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ================================================
              Right: Tabbed sidebar panel
              ================================================ */}
          <div className="flex flex-col rounded-2xl border border-[rgba(148,163,184,0.08)] bg-[rgba(10,10,20,0.8)] backdrop-blur-xl overflow-hidden min-h-[600px] lg:min-h-0 lg:h-[calc(100vh-10rem)] lg:sticky lg:top-20">
            {/* Tab navigation */}
            <div className="flex border-b border-[rgba(148,163,184,0.08)] bg-[rgba(8,8,16,0.6)] px-2 pt-2 gap-1 overflow-x-auto whitespace-nowrap scrollbar-none">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-semibold transition-all relative ${
                    activeTab === tab.id
                      ? 'bg-[rgba(15,15,26,0.9)] text-[#f1f5f9] border border-b-0 border-[rgba(148,163,184,0.1)]'
                      : 'text-[#475569] hover:text-[#94a3b8]'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      tab.id === 'mistakes' && tab.count > 0
                        ? 'bg-[rgba(239,68,68,0.2)] text-[#ef4444]'
                        : 'bg-[rgba(124,58,237,0.2)] text-[#a855f7]'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`flex-1 min-h-0 ${activeTab === 'coach' || activeTab === 'play' ? 'flex flex-col' : 'overflow-y-auto'}`}
                >
                  {activeTab === 'input' && (
                    <div className="p-5">
                      <PGNInput />
                    </div>
                  )}

                  {activeTab === 'play' && (
                    <div className="p-5 flex-1 flex flex-col min-h-0 h-full">
                      {!liveGameStarted ? (
                        /* Game lobby / start screen */
                        <div className="flex-1 flex flex-col justify-center py-6 text-center">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[rgba(124,58,237,0.15)] to-[rgba(6,182,212,0.15)] border border-[rgba(124,58,237,0.2)] flex items-center justify-center mx-auto mb-4">
                            <Swords className="w-7 h-7 text-[#06b6d4]" />
                          </div>
                          <h3 className="text-base font-bold text-[#f1f5f9] mb-1.5">
                            Play vs AI Coach
                          </h3>
                          <p className="text-xs text-[#94a3b8] leading-relaxed max-w-[280px] mx-auto mb-6">
                            Practice your skills against the computer opponent. The AI Coach will critique every move in real time, highlight mistakes, and show you the optimal lines.
                          </p>

                          <div className="bg-[rgba(15,15,26,0.4)] border border-[rgba(148,163,184,0.06)] rounded-xl p-4 max-w-[320px] mx-auto w-full mb-6 space-y-3.5 text-left">
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-[#94a3b8]">
                                Coach Difficulty
                              </label>
                              <select
                                value={coachDifficulty}
                                onChange={(e) => setCoachDifficulty(e.target.value as typeof coachDifficulty)}
                                className="w-full px-3 py-2 rounded-lg bg-[rgba(8,8,16,0.8)] border border-[rgba(148,163,184,0.12)] text-xs font-medium text-[#f1f5f9] focus:outline-none focus:border-[rgba(124,58,237,0.45)] focus:ring-1 focus:ring-[rgba(124,58,237,0.2)]"
                              >
                                {COACH_DIFFICULTIES.map((difficulty) => (
                                  <option key={difficulty.id} value={difficulty.id}>
                                    {difficulty.label} ({difficulty.rating} rating)
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-semibold text-[#94a3b8]">
                                Player Color
                              </label>
                              <span className="text-xs font-mono font-bold text-[#e2e8f0] px-2 py-0.5 rounded bg-[rgba(255,255,255,0.06)]">
                                White (Plays First)
                              </span>
                            </div>
                            <div className="h-px bg-[rgba(148,163,184,0.06)]" />
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-[#94a3b8]">
                                Show Move Suggestions
                              </span>
                              <input
                                type="checkbox"
                                checked={showSuggestions}
                                onChange={(e) => setShowSuggestions(e.target.checked)}
                                className="w-4 h-4 rounded border-[rgba(148,163,184,0.2)] text-[#7c3aed] bg-[rgba(8,8,16,0.8)] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                              />
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              resetLiveGame();
                              setLiveGameStarted(true);
                              setGameMode('play');
                              setLiveCurrentFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
                              setLiveCoachFeedback("Welcome to Play vs Coach mode! Make your first move as White by dragging a piece. I will analyze your move and reply immediately.");
                            }}
                            className="flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white font-semibold rounded-xl shadow-[0_4px_16px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_24px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 transition-all text-sm max-w-[240px] mx-auto w-full"
                          >
                            <Play className="w-4 h-4 fill-white" />
                            Start Live Game
                          </button>
                        </div>
                      ) : (
                        /* Active play panel */
                        <div className="flex-1 flex flex-col min-h-0 space-y-4">
                          {/* Turn & Status Indicator */}
                          <div className="flex items-center justify-between p-3 rounded-xl bg-[rgba(8,8,16,0.6)] border border-[rgba(148,163,184,0.06)]">
                            <div className="flex items-center gap-2">
                              {isBotThinking ? (
                                <>
                                  <Loader2 className="w-4 h-4 text-[#06b6d4] animate-spin" />
                                  <span className="text-xs text-[#06b6d4] font-semibold">Coach Bot is thinking...</span>
                                </>
                              ) : liveIsAnalyzingMove ? (
                                <>
                                  <Loader2 className="w-4 h-4 text-[#a855f7] animate-spin" />
                                  <span className="text-xs text-[#a855f7] font-semibold">AI Coach is analyzing...</span>
                                </>
                              ) : isOpponentTurn && !isLiveGameOver ? (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs text-[#06b6d4] font-semibold">Opponent&apos;s turn:</span>
                                  <button
                                    onClick={triggerBotMove}
                                    className="flex items-center gap-1.5 py-1 px-2.5 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] hover:from-[#0891b2] hover:to-[#06b6d4] text-white font-bold rounded shadow transition-all text-[10px]"
                                  >
                                    <Play className="w-2.5 h-2.5 fill-white" />
                                    Play Bot Move (or click Next)
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                                  <span className="text-xs text-[#94a3b8] font-medium">Your Turn (White)</span>
                                </>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-[#475569] uppercase font-bold tracking-wider">
                              Move {Math.floor(liveMoves.length / 2) + 1}
                            </span>
                          </div>

                          {/* Last Move Quality & Suggestion */}
                          {liveClassification && (
                            <div className="p-4 rounded-xl border bg-[rgba(15,15,26,0.4)] border-[rgba(148,163,184,0.06)] space-y-3">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-[#94a3b8]">Last Move:</span>
                                  <code className="text-xs font-mono font-bold text-[#f1f5f9] px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.06)]">
                                    {liveMoves[liveMoves.length - 1]?.san}
                                  </code>
                                </div>
                                <span
                                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                                    liveClassification === 'blunder'
                                      ? 'bg-[rgba(239,68,68,0.08)] text-[#ef4444] border-[rgba(239,68,68,0.2)]'
                                      : liveClassification === 'mistake'
                                      ? 'bg-[rgba(249,115,22,0.08)] text-[#f97316] border-[rgba(249,115,22,0.2)]'
                                      : liveClassification === 'inaccuracy'
                                      ? 'bg-[rgba(234,179,8,0.08)] text-[#eab308] border-[rgba(234,179,8,0.2)]'
                                      : liveClassification === 'good'
                                      ? 'bg-[rgba(34,197,94,0.08)] text-[#22c55e] border-[rgba(34,197,94,0.2)]'
                                      : liveClassification === 'brilliant'
                                      ? 'bg-[rgba(6,182,212,0.08)] text-[#06b6d4] border-[rgba(6,182,212,0.2)]'
                                      : 'bg-[rgba(99,102,241,0.08)] text-[#6366f1] border-[rgba(99,102,241,0.2)]'
                                  }`}
                                >
                                  {liveClassification}
                                </span>
                              </div>

                              {showSuggestions && liveSuggestedMoveSan && (
                                <div className="flex items-center gap-1.5 text-xs text-[#22c55e] bg-[rgba(34,197,94,0.05)] border border-[rgba(34,197,94,0.1)] rounded-lg px-2.5 py-1.5 font-medium">
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Suggested move in this position was <strong>{liveSuggestedMoveSan}</strong></span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Coach Feedback Stream Area */}
                          <div className="flex-1 overflow-y-auto rounded-xl border border-[rgba(148,163,184,0.08)] bg-[rgba(8,8,16,0.5)] p-4 flex flex-col min-h-0">
                            <div className="flex items-center gap-2 mb-3 border-b border-[rgba(148,163,184,0.04)] pb-2">
                              <Brain className="w-4 h-4 text-[#06b6d4]" />
                              <span className="text-xs font-bold text-[#f1f5f9]">AI Coach Commentary</span>
                            </div>
                            <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-4">
                              {/* Past reviews */}
                              {liveMoves.map((move, index) => {
                                if (!move.aiExplanation) return null;
                                const isWhiteMove = move.color === 'w';
                                return (
                                  <div key={index} className="border-b border-[rgba(148,163,184,0.05)] pb-3 last:border-0 last:pb-0">
                                    <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                                      <span className="text-[10px] font-mono text-[#94a3b8] font-bold">
                                        Move {move.moveNumber}. {isWhiteMove ? move.san : '... ' + move.san}
                                      </span>
                                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                                        move.mistakeType === 'blunder'
                                          ? 'bg-[rgba(239,68,68,0.05)] text-[#ef4444] border-[rgba(239,68,68,0.15)]'
                                          : move.mistakeType === 'mistake'
                                          ? 'bg-[rgba(249,115,22,0.05)] text-[#f97316] border-[rgba(249,115,22,0.15)]'
                                          : move.mistakeType === 'inaccuracy'
                                          ? 'bg-[rgba(234,179,8,0.05)] text-[#eab308] border-[rgba(234,179,8,0.15)]'
                                          : move.mistakeType === 'good'
                                          ? 'bg-[rgba(34,197,94,0.05)] text-[#22c55e] border-[rgba(34,197,94,0.15)]'
                                          : move.mistakeType === 'brilliant'
                                          ? 'bg-[rgba(6,182,212,0.05)] text-[#06b6d4] border-[rgba(6,182,212,0.15)]'
                                          : 'bg-[rgba(99,102,241,0.05)] text-[#6366f1] border-[rgba(99,102,241,0.15)]'
                                      }`}>
                                        {move.mistakeType}
                                      </span>
                                    </div>
                                    <MarkdownRenderer content={move.aiExplanation} />
                                  </div>
                                );
                              })}

                              {/* Welcome message / initial greeting */}
                              {liveMoves.filter(m => m.aiExplanation).length === 0 && liveCoachFeedback && (
                                <MarkdownRenderer content={liveCoachFeedback} />
                              )}

                              {/* Currently streaming review */}
                              {liveIsAnalyzingMove && liveCoachFeedback && !liveMoves[liveMoves.length - 1]?.aiExplanation && (
                                <div className="border-t border-[rgba(148,163,184,0.05)] pt-3">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-mono text-[#a855f7] font-bold animate-pulse">
                                      Analyzing Move...
                                    </span>
                                  </div>
                                  <MarkdownRenderer content={liveCoachFeedback} />
                                </div>
                              )}
                              
                              <div ref={coachFeedbackEndRef} />
                            </div>
                          </div>

                          {/* Bottom Settings & Control Panel */}
                          <div className="flex items-center justify-between gap-4 pt-2 border-t border-[rgba(148,163,184,0.04)] flex-wrap">
                            <div className="flex items-center gap-3 flex-wrap">
                              <label className="flex items-center gap-2 text-xs text-[#475569] cursor-pointer hover:text-[#94a3b8] transition-colors select-none">
                                <input
                                  type="checkbox"
                                  checked={showSuggestions}
                                  onChange={(e) => setShowSuggestions(e.target.checked)}
                                  className="w-3.5 h-3.5 rounded border-[rgba(148,163,184,0.2)] text-[#7c3aed] bg-[rgba(8,8,16,0.8)] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                />
                                Show suggestions
                              </label>

                              <label className="flex items-center gap-2 text-xs text-[#475569] cursor-pointer hover:text-[#94a3b8] transition-colors select-none">
                                <span className="font-semibold">Difficulty</span>
                                <select
                                  value={coachDifficulty}
                                  onChange={(e) => setCoachDifficulty(e.target.value as typeof coachDifficulty)}
                                  className="px-2.5 py-1.5 rounded-lg bg-[rgba(8,8,16,0.8)] border border-[rgba(148,163,184,0.12)] text-[11px] font-medium text-[#f1f5f9] focus:outline-none focus:border-[rgba(124,58,237,0.45)] focus:ring-1 focus:ring-[rgba(124,58,237,0.2)]"
                                >
                                  {COACH_DIFFICULTIES.map((difficulty) => (
                                    <option key={difficulty.id} value={difficulty.id}>
                                      {difficulty.label}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </div>

                            <button
                              onClick={() => {
                                resetLiveGame();
                                setLiveGameStarted(true);
                                setLiveCurrentFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
                                setLiveCoachFeedback("Welcome to Play vs Coach mode! Make your first move as White by dragging a piece. I will analyze your move and reply immediately.");
                              }}
                              className="px-3.5 py-1.5 text-xs text-[#ef4444] border border-[rgba(239,68,68,0.15)] rounded-lg hover:bg-[rgba(239,68,68,0.06)] transition-all font-semibold"
                            >
                              Restart Game
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'moves' && (
                    <div className="p-5">
                      {gameMode === 'play' ? (
                        liveMoves.length > 0 ? (
                          <MoveList />
                        ) : (
                          <div className="text-center py-12 text-[#475569] text-sm">
                            <ListOrdered className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            Start playing to see moves
                          </div>
                        )
                      ) : analysisResult ? (
                        <MoveList />
                      ) : (
                        <div className="text-center py-12 text-[#475569] text-sm">
                          <ListOrdered className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          Analyze a game to see moves
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'mistakes' && (
                    <div className="p-5">
                      {isAnalyzing ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                          <Loader2 className="w-8 h-8 text-[#7c3aed] animate-spin" />
                          <p className="text-sm text-[#94a3b8]">Generating AI explanations...</p>
                        </div>
                      ) : gameMode === 'play' ? (
                        liveMoves.length > 0 ? (
                          <MistakeList />
                        ) : (
                          <div className="text-center py-12 text-[#475569] text-sm">
                            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            Start playing to see mistakes
                          </div>
                        )
                      ) : analysisResult ? (
                        <MistakeList />
                      ) : (
                        <div className="text-center py-12 text-[#475569] text-sm">
                          <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          Analyze a game to see mistakes
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'coach' && (
                    <div className="flex-1 flex flex-col min-h-0 h-full">
                      <CoachingChat playerRating={coachRating} />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
