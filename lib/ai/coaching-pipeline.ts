// ============================================================
// OpenAI Coaching Pipeline
// Converts Stockfish raw analysis into human-friendly coaching text
// ============================================================
import OpenAI from 'openai';
import type { CoachingMessage, MistakeType } from '@/types';
import { getCoachDifficultyByRating } from '@/lib/chess/coach-difficulty';

const provider = process.env.CHATBOT_PROVIDER ?? 'openai';
const isGroq = provider === 'groq';

// Auto-detect Groq keys if they put it in the OpenAI key by accident
const isGroqKey = (key?: string) => key?.startsWith('gsk_');

const rawOpenAIKey = process.env.OPENAI_API_KEY;
const rawGroqKey = process.env.GROQ_API_KEY;

const useGroq = isGroq || isGroqKey(rawOpenAIKey) || !!rawGroqKey;

const apiKey = useGroq 
  ? (rawGroqKey || rawOpenAIKey)
  : rawOpenAIKey;

const baseURL = useGroq ? 'https://api.groq.com/openai/v1' : undefined;
const MODEL = useGroq 
  ? (process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile')
  : (process.env.OPENAI_MODEL ?? 'gpt-4o-mini');

const openai = new OpenAI({
  apiKey: apiKey || 'dummy-key',
  baseURL: baseURL,
});

export const isAiConfigured = !!apiKey;

/**
 * Generate a coaching-level system prompt based on player rating
 * Adapts language complexity for beginners vs. advanced players
 */
function getCoachingSystemPrompt(playerRating?: number): string {
  const difficulty = getCoachDifficultyByRating(playerRating);

  return `You are Checkmate AI, a friendly and encouraging chess coach.
You are coaching a ${difficulty.label} chess player${playerRating ? ` (rated ~${playerRating})` : ''}.

Your coaching style:
- Use clear, conversational language appropriate for a ${difficulty.label} player
- ${playerRating && playerRating < 1000 ? 'Avoid technical jargon. Explain everything simply.' : 'Use some chess terminology but always explain it.'}
- Be encouraging and constructive — mistakes are learning opportunities
- Focus on WHY a move is bad, not just WHAT the best move is
- Reference concrete pieces and squares (e.g. "your bishop on c4")
- Keep explanations concise (2-4 sentences for mistakes)
- Use analogies and patterns to make concepts memorable

Formatting guidelines (CRITICAL):
- Structure your answer cleanly: use subheadings (e.g., "### Why this move is tricky") if addressing multiple points or concepts
- Use bullet points or numbered lists to break down multiple threats, steps, or suggestions
- Wrap all chess moves and notations (e.g., \`e4\`, \`Nf3\`, \`Bxe5\`, \`1. e4\`) in inline code backticks (\`move\`) so they stand out clearly
- Use bold text for key principles, tactical ideas (like **pin**, **fork**, **skewer**), or warnings
- Keep paragraphs short (maximum 2-3 sentences each) to make the text easily digestible`;
}

/**
 * Generate AI explanations for a batch of mistakes from one game
 * Batches to reduce API calls
 */
export async function generateMistakeExplanations(
  mistakes: Array<{
    moveNumber: number;
    moveSan: string;
    mistakeType: MistakeType;
    evalSwing: number;
    bestMoveSan?: string;
    positionFen: string;
  }>,
  playerRating?: number
): Promise<string[]> {
  if (mistakes.length === 0) return [];

  // Build a structured prompt with all mistakes
  const mistakeDescriptions = mistakes
    .map((m, i) => {
      const swingPawns = Math.abs(m.evalSwing / 100).toFixed(1);
      return `Mistake ${i + 1}: Move ${m.moveNumber} — ${m.moveSan} (${m.mistakeType}, ${swingPawns} pawn swing)${
        m.bestMoveSan ? `. Better move was ${m.bestMoveSan}.` : ''
      }`;
    })
    .join('\n');

  const prompt = `A chess player made the following mistakes in their game. Generate a brief, friendly coaching explanation for EACH mistake. Return exactly ${mistakes.length} explanations, one per line, numbered 1. 2. etc.

${mistakeDescriptions}

Each explanation should:
- Explain WHY the move was a ${mistakes[0].mistakeType}
- Mention what threat or tactic was missed
- Be 1-3 sentences maximum
- Be encouraging and educational`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: getCoachingSystemPrompt(playerRating) },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content ?? '';

    // Parse numbered explanations
    const lines = content
      .split('\n')
      .filter((l) => l.trim())
      .filter((l) => /^\d+\./.test(l.trim()))
      .map((l) => l.replace(/^\d+\.\s*/, '').trim());

    // Pad with fallback if parsing fails
    while (lines.length < mistakes.length) {
      lines.push(`Move ${mistakes[lines.length]?.moveNumber} was a ${mistakes[lines.length]?.mistakeType} that gave up significant material or position.`);
    }

    return lines.slice(0, mistakes.length);
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Return fallback explanations if API fails
    return mistakes.map(
      (m) => `Move ${m.moveNumber} (${m.moveSan}) was a ${m.mistakeType} with a ${Math.abs(m.evalSwing / 100).toFixed(1)} pawn evaluation swing.${
        m.bestMoveSan ? ` The better move was ${m.bestMoveSan}.` : ''
      }`
    );
  }
}

/**
 * Streaming coaching chat response
 * Returns an async stream of text chunks for real-time display
 */
export async function streamCoachingResponse(
  userMessage: string,
  context: {
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
) {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: getCoachingSystemPrompt(context.playerRating) },
  ];

  // Add game context if available
  if (context.gameContext) {
    messages.push({
      role: 'system',
      content: `Current game stats: ${context.gameContext.blunderCount} blunders, ${context.gameContext.inaccuracyCount} inaccuracies, ${context.gameContext.averageAccuracy}% accuracy.`,
    });
  }

  if (context.currentMoveContext) {
    messages.push({
      role: 'system',
      content: `Current position context: ${context.currentMoveContext}`,
    });
  }

  // Add conversation history (last 10 messages to stay within context limits)
  if (context.sessionHistory) {
    const recentHistory = context.sessionHistory.slice(-10);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }
  }

  messages.push({ role: 'user', content: userMessage });

  return openai.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.8,
    max_tokens: 600,
    stream: true,
  });
}
