// ============================================================
// useCoaching Hook — AI coaching chat with streaming support
// ============================================================
'use client';

import { useCallback, useState } from 'react';
import { useAnalysisStore } from '@/store/analysis-store';
import type { CoachingMessage } from '@/types';

export function useCoaching() {
  const {
    coachMessages,
    addCoachMessage,
    analysisResult,
    currentMoveIndex,
  } = useAnalysisStore();
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(
    async (userText: string, playerRating?: number) => {
      if (!userText.trim() || isStreaming) return;

      // Add user message immediately
      const userMessage: CoachingMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: userText,
        timestamp: new Date(),
      };
      addCoachMessage(userMessage);
      setIsStreaming(true);

      // Build context for the AI
      const currentMove = analysisResult?.moves[currentMoveIndex];
      const currentMoveContext = currentMove
        ? `Player is looking at move ${currentMove.moveNumber} (${currentMove.san}), classified as ${currentMove.mistakeType}.`
        : undefined;

      try {
        const response = await fetch('/api/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userText,
            playerRating,
            currentMoveContext,
            sessionHistory: coachMessages.slice(-8), // last 8 messages for context
            gameContext: analysisResult
              ? {
                  blunderCount: analysisResult.blunderCount,
                  inaccuracyCount: analysisResult.inaccuracyCount,
                  averageAccuracy: analysisResult.averageAccuracy,
                }
              : undefined,
          }),
        });

        if (!response.ok) throw new Error('Coaching response failed');

        // Handle streaming response via SSE
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error('No response stream');

        // Add assistant message placeholder
        const assistantMessage: CoachingMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        };
        addCoachMessage(assistantMessage);

        // Stream text chunks into the message
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

                // Update the last message in store with accumulated content
                // We do this by updating assistantMessage directly for performance
                assistantMessage.content = accumulated;
              } catch {}
            }
          }
        }

        // Final update with complete message
        useAnalysisStore.setState((state) => ({
          coachMessages: state.coachMessages.map((m) =>
            m.id === assistantMessage.id
              ? { ...m, content: accumulated }
              : m
          ),
        }));
      } catch (err) {
        const errorMessage: CoachingMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content:
            "I'm having trouble connecting right now. Please make sure your OpenAI API key is configured in `.env.local`.",
          timestamp: new Date(),
        };
        addCoachMessage(errorMessage);
      } finally {
        setIsStreaming(false);
      }
    },
    [addCoachMessage, coachMessages, analysisResult, currentMoveIndex, isStreaming]
  );

  return { sendMessage, isStreaming, coachMessages };
}
