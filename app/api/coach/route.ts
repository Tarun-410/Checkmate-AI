// ============================================================
// POST /api/coach
// Streaming AI coaching chat endpoint using Server-Sent Events
// ============================================================
import { NextRequest } from 'next/server';
import { streamCoachingResponse, isAiConfigured } from '@/lib/ai/coaching-pipeline';
import type { CoachRequest } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body: CoachRequest = await req.json();
    const { message, playerRating, currentMoveContext, sessionHistory, gameContext } =
      body;

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: 'Message required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // If no AI key configured, return a helpful demo response
    if (!isAiConfigured) {
      const demoResponse = getDemoCoachResponse(message);
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          // Stream demo response word by word for realistic feel
          const words = demoResponse.split(' ');
          let i = 0;
          const interval = setInterval(() => {
            if (i < words.length) {
              const chunk = (i === 0 ? '' : ' ') + words[i];
              const data = JSON.stringify({
                choices: [{ delta: { content: chunk } }],
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              i++;
            } else {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
              clearInterval(interval);
            }
          }, 50);
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // Stream from OpenAI
    const openaiStream = await streamCoachingResponse(message, {
      playerRating,
      currentMoveContext,
      sessionHistory,
      gameContext,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of openaiStream) {
            const data = JSON.stringify(chunk);
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Coach API error:', error);
    return new Response(JSON.stringify({ error: 'Coaching service unavailable' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Demo responses for when OpenAI API key is not configured
 * Provides realistic coaching flavor even in demo mode
 */
function getDemoCoachResponse(message: string): string {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('blunder') || lowerMsg.includes('bad move')) {
    return "Great question! A blunder typically occurs when you overlook a tactical threat — like a fork, pin, or skewer. The key is to always ask yourself 'What can my opponent do after my move?' before committing. Try to think one move ahead defensively, not just offensively!";
  }
  if (lowerMsg.includes('opening') || lowerMsg.includes('start')) {
    return "For beginners, I recommend starting with 1.e4 (as White) or the Sicilian Defense (1...c5 as Black). These openings are rich, well-studied, and teach core principles: control the center, develop your pieces, and get your king to safety via castling. Avoid moving the same piece twice in the opening!";
  }
  if (lowerMsg.includes('improve') || lowerMsg.includes('better')) {
    return "The fastest way to improve is through deliberate practice: analyze your own games (which you're doing right now!), solve 10-15 tactical puzzles daily, and study one endgame pattern per week. Tactics win games, but understanding basic endgames prevents you from losing won positions. You're on the right track!";
  }
  if (lowerMsg.includes('endgame')) {
    return "Endgames are where games are truly won or lost! Start with king and pawn endgames — learn the concept of opposition and key squares. Then study rook endgames, which are the most common. The golden rule: activate your king! In the endgame, the king is a powerful piece.";
  }
  return "I'm your Checkmate AI coach! I analyze your games and help you understand your mistakes in plain language. Ask me about specific moves, openings, tactical patterns, or how to improve your overall game. To unlock full AI coaching, add your OpenAI API key to the `.env.local` file.";
}
