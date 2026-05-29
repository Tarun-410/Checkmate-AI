// ============================================================
// GET /api/games — fetch user's analyzed games
// POST /api/games — save a new analyzed game
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(_req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: games, error } = await supabase
      .from('analyzed_games')
      .select(`
        id, title, opponent_name, total_moves,
        blunder_count, inaccuracy_count, mistake_count,
        average_accuracy, created_at
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    return NextResponse.json({ games: games ?? [] });
  } catch (err) {
    console.error('Games fetch error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { pgn, title, opponentName, analysis } = body;

    // Save the analyzed game
    const { data: game, error: gameError } = await supabase
      .from('analyzed_games')
      .insert({
        user_id: session.user.id,
        pgn,
        title: title ?? `Game ${new Date().toLocaleDateString()}`,
        opponent_name: opponentName,
        total_moves: analysis.moves?.length ?? 0,
        blunder_count: analysis.blunderCount ?? 0,
        inaccuracy_count: analysis.inaccuracyCount ?? 0,
        mistake_count: analysis.mistakeCount ?? 0,
        average_accuracy: analysis.averageAccuracy ?? 0,
      })
      .select()
      .single();

    if (gameError) throw gameError;

    // Save individual mistakes
    if (analysis.mistakes && analysis.mistakes.length > 0) {
      const mistakesData = (analysis.mistakes ?? []).map((m: Record<string, unknown>) => ({
        game_id: game.id,
        move_number: m.moveNumber,
        move_san: m.moveSan,
        mistake_type: m.mistakeType,
        eval_before: m.evalBefore,
        eval_after: m.evalAfter,
        eval_swing: m.evalSwing,
        best_move_san: m.bestMoveSan,
        ai_explanation: m.aiExplanation,
        position_fen: m.positionFen,
      }));

      const { error: mistakesError } = await supabase
        .from('game_mistakes')
        .insert(mistakesData);

      if (mistakesError) console.error('Failed to save mistakes:', mistakesError);
    }

    return NextResponse.json({ game, gameId: game.id });
  } catch (err) {
    console.error('Game save error:', err);
    return NextResponse.json(
      { error: 'Failed to save game' },
      { status: 500 }
    );
  }
}
