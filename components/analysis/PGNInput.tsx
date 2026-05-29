'use client';

import { useState } from 'react';
import { useAnalysisStore } from '@/store/analysis-store';
import { useGameAnalysis } from '@/hooks/useGameAnalysis';
import { validatePgn } from '@/lib/chess/pgn-parser';
import { Upload, FileText, Loader2, Sparkles, X } from 'lucide-react';

// Sample PGN for demo/testing
const SAMPLE_PGN = `[Event "Casual Game"]
[Site "Chess.com"]
[White "Player1"]
[Black "Player2"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Nxe4 6. d4 b5 7. Bb3 d5 8. dxe5 Be6 9. Be3 Be7 10. c3 O-O 11. Nbd2 Nxd2 12. Qxd2 Na5 13. Bc2 Nc4 14. Qe2 Nxe3 15. fxe3 c5 16. Nd4 Bc4 17. Qf2 c4 18. b3 cxb3 19. Bxb3 Bxb3 20. axb3 Qb6 21. Rfb1 a5 22. Kh1 a4 23. b4 Qd8 24. Nxb5 Ra6 25. Nd4 Qh4 26. Nf3 Qh5 27. Rxa4 Rxa4 28. Qxa4 Qa5 29. Qxa5 1-0`;

export function PGNInput() {
  const { pgn, setPgn, isAnalyzing } = useAnalysisStore();
  const { analyzeGame } = useGameAnalysis();
  const [playerRating, setPlayerRating] = useState<string>('1200');
  const [validationError, setValidationError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleAnalyze = async () => {
    if (!pgn.trim()) {
      setValidationError('Please paste a PGN game first.');
      return;
    }

    const { valid, error } = validatePgn(pgn);
    if (!valid) {
      setValidationError(error ?? 'Invalid PGN format.');
      return;
    }

    setValidationError('');
    await analyzeGame(pgn, playerRating ? parseInt(playerRating) : undefined);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.pgn') || file.type === 'text/plain')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        if (content) {
          setPgn(content);
          setValidationError('');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Textarea with drag-and-drop */}
      <div
        className={`relative transition-all ${isDragging ? 'scale-[1.01]' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-[#94a3b8] flex items-center gap-2">
            <FileText className="w-4 h-4" />
            PGN Notation
          </label>
          {pgn && (
            <button
              onClick={() => { setPgn(''); setValidationError(''); }}
              className="text-xs text-[#475569] hover:text-[#94a3b8] flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        <textarea
          value={pgn}
          onChange={(e) => {
            setPgn(e.target.value);
            if (validationError) setValidationError('');
          }}
          placeholder={`Paste your PGN here...\n\nExample:\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6...`}
          rows={8}
          className={`w-full px-4 py-3 bg-[rgba(8,8,16,0.8)] border rounded-xl text-[#f1f5f9] text-sm font-mono placeholder-[#334155] focus:outline-none transition-all resize-none ${
            isDragging
              ? 'border-[rgba(124,58,237,0.5)] ring-2 ring-[rgba(124,58,237,0.2)]'
              : validationError
              ? 'border-[rgba(239,68,68,0.5)] focus:border-[rgba(239,68,68,0.7)]'
              : 'border-[rgba(148,163,184,0.1)] focus:border-[rgba(124,58,237,0.5)] focus:ring-1 focus:ring-[rgba(124,58,237,0.2)]'
          }`}
        />

        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-[rgba(124,58,237,0.08)] rounded-xl flex items-center justify-center border-2 border-dashed border-[#7c3aed]">
            <div className="text-center">
              <Upload className="w-8 h-8 text-[#7c3aed] mx-auto mb-2" />
              <p className="text-sm font-medium text-[#a855f7]">Drop your .pgn file here</p>
            </div>
          </div>
        )}
      </div>

      {/* Validation error */}
      {validationError && (
        <p className="text-xs text-[#ef4444] flex items-center gap-1.5">
          <span className="font-bold">!</span> {validationError}
        </p>
      )}

      {/* Player rating input */}
      <div>
        <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">
          Your Rating <span className="text-[#475569] font-normal">(for tailored explanations)</span>
        </label>
        <input
          type="number"
          value={playerRating}
          onChange={(e) => setPlayerRating(e.target.value)}
          min={100}
          max={3000}
          placeholder="e.g. 1200"
          className="w-full px-4 py-2.5 bg-[rgba(8,8,16,0.8)] border border-[rgba(148,163,184,0.1)] rounded-xl text-[#f1f5f9] text-sm focus:outline-none focus:border-[rgba(124,58,237,0.5)] focus:ring-1 focus:ring-[rgba(124,58,237,0.2)] transition-all"
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !pgn.trim()}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-5 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white font-semibold rounded-xl shadow-[0_4px_16px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_24px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyze Game
            </>
          )}
        </button>

        <button
          onClick={() => {
            setPgn(SAMPLE_PGN);
            setValidationError('');
          }}
          disabled={isAnalyzing}
          className="px-4 py-3 bg-transparent border border-[rgba(148,163,184,0.1)] text-[#94a3b8] text-sm font-medium rounded-xl hover:bg-[rgba(148,163,184,0.06)] hover:border-[rgba(148,163,184,0.2)] hover:text-[#f1f5f9] transition-all disabled:opacity-50"
          title="Load sample game"
        >
          Sample
        </button>
      </div>
    </div>
  );
}
