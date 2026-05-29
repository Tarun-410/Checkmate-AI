-- ============================================================
-- Checkmate AI — Supabase Database Schema
-- Run this SQL in your Supabase project SQL editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- User Profiles (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  chess_rating INTEGER DEFAULT 1200 CHECK (chess_rating >= 100 AND chess_rating <= 3500),
  preferred_openings TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Analyzed Games
-- ============================================================
CREATE TABLE IF NOT EXISTS public.analyzed_games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  pgn TEXT NOT NULL,
  title TEXT,
  opponent_name TEXT,
  total_moves INTEGER DEFAULT 0,
  blunder_count INTEGER DEFAULT 0,
  inaccuracy_count INTEGER DEFAULT 0,
  mistake_count INTEGER DEFAULT 0,
  average_accuracy DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Game Mistakes (individual mistakes from each game)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.game_mistakes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES public.analyzed_games(id) ON DELETE CASCADE NOT NULL,
  move_number INTEGER NOT NULL,
  move_san TEXT NOT NULL,       -- e.g. "Nf6"
  mistake_type TEXT NOT NULL CHECK (mistake_type IN ('blunder', 'mistake', 'inaccuracy')),
  eval_before DECIMAL(7,2),     -- centipawn evaluation before move
  eval_after DECIMAL(7,2),      -- centipawn evaluation after move
  eval_swing DECIMAL(7,2),      -- change in evaluation
  best_move_san TEXT,           -- the move that should have been played
  ai_explanation TEXT,          -- GPT-generated human-friendly explanation
  position_fen TEXT,            -- FEN string of the position before the mistake
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Coaching Sessions (AI chat history)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.coaching_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  game_id UUID REFERENCES public.analyzed_games(id) ON DELETE SET NULL,
  messages JSONB DEFAULT '[]'::jsonb, -- array of {role, content, timestamp}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyzed_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_sessions ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Analyzed Games: Users can CRUD their own games
CREATE POLICY "Users can view own games" ON public.analyzed_games
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own games" ON public.analyzed_games
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own games" ON public.analyzed_games
  FOR DELETE USING (auth.uid() = user_id);

-- Game Mistakes: Users can view mistakes from their own games
CREATE POLICY "Users can view own game mistakes" ON public.game_mistakes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.analyzed_games ag
      WHERE ag.id = game_id AND ag.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert own game mistakes" ON public.game_mistakes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.analyzed_games ag
      WHERE ag.id = game_id AND ag.user_id = auth.uid()
    )
  );

-- Coaching Sessions: Users can CRUD their own sessions
CREATE POLICY "Users can view own coaching sessions" ON public.coaching_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own coaching sessions" ON public.coaching_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own coaching sessions" ON public.coaching_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_analyzed_games_user_id ON public.analyzed_games(user_id);
CREATE INDEX IF NOT EXISTS idx_analyzed_games_created_at ON public.analyzed_games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_mistakes_game_id ON public.game_mistakes(game_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_user_id ON public.coaching_sessions(user_id);
