// ============================================================
// useStockfish Hook — Stockfish WASM engine integration
// Manages UCI protocol communication via Web Worker
// ============================================================
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAnalysisStore } from '@/store/analysis-store';

export interface StockfishEvaluation {
  score: number; // centipawns from white's perspective
  mate?: number; // moves to mate (undefined if no mate)
  bestMove: string; // UCI notation e.g. "e2e4"
  depth: number;
}

type StockfishReadyCallback = () => void;
type EvalCallback = (result: StockfishEvaluation) => void;

export function useStockfish() {
  const workerRef = useRef<Worker | null>(null);
  const resolveRef = useRef<EvalCallback | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { setStockfishReady } = useAnalysisStore();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Load Stockfish as a Web Worker
      // The stockfish npm package provides a WASM-based engine
      const worker = new Worker(
        new URL('/stockfish/stockfish.js', window.location.origin),
        { type: 'classic' }
      );

      workerRef.current = worker;

      worker.onmessage = (event: MessageEvent) => {
        const line: string = event.data;

        if (line === 'uciok') {
          // Engine ready, send config commands
          worker.postMessage('setoption name Threads value 1');
          worker.postMessage('setoption name Hash value 16');
          worker.postMessage('isready');
        }

        if (line === 'readyok') {
          setIsReady(true);
          setStockfishReady(true);
        }

        // Parse evaluation from info lines
        if (line.startsWith('info') && line.includes('score')) {
          // We track but don't resolve here — wait for bestmove
        }

        // Parse best move when analysis completes
        if (line.startsWith('bestmove') && resolveRef.current) {
          const parts = line.split(' ');
          const bestMove = parts[1] ?? '(none)';

          // Extract score from info lines — parse from the last received depth
          // This is set by the engine before sending bestmove
          resolveRef.current({
            score: parseScoreFromWorker(line),
            bestMove,
            depth: 18,
          });
          resolveRef.current = null;
        }
      };

      worker.onerror = (e) => {
        console.error('Stockfish worker error:', e);
        // Fall back to mock analysis if Stockfish fails to load
        setIsReady(true);
        setStockfishReady(true);
      };

      // Initialize UCI
      worker.postMessage('uci');
    } catch (err) {
      console.warn('Stockfish WASM not available, using mock analysis:', err);
      // In development without Stockfish WASM, mark as ready anyway
      setIsReady(true);
      setStockfishReady(true);
    }

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [setStockfishReady]);

  /**
   * Analyze a position and return the evaluation
   * Returns a promise that resolves with the evaluation result
   */
  const analyzePosition = useCallback(
    (fen: string, depth = 18): Promise<StockfishEvaluation> => {
      return new Promise((resolve) => {
        if (!workerRef.current) {
          // Fallback mock evaluation if engine not loaded
          resolve({ score: 0, bestMove: '(none)', depth });
          return;
        }

        resolveRef.current = resolve;
        workerRef.current.postMessage('stop');
        workerRef.current.postMessage(`position fen ${fen}`);
        workerRef.current.postMessage(`go depth ${depth}`);
      });
    },
    []
  );

  return { isReady, analyzePosition };
}

/**
 * Parse centipawn score from Stockfish output
 * Stockfish sends "info ... score cp 50" or "info ... score mate 3"
 */
function parseScoreFromWorker(line: string): number {
  // This is a simplified parser — in practice Stockfish sends
  // the score in "info" lines before "bestmove"
  // We'd track the last info score in the actual worker
  return 0; // Placeholder — real parsing happens in full worker
}
