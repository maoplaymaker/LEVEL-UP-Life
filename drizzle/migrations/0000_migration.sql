CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY,
  display_name text NOT NULL DEFAULT '',
  handle text NOT NULL DEFAULT '',
  locale text NOT NULL DEFAULT 'es',
  bio text NOT NULL DEFAULT '',
  onboarding_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.player_progress (
  user_id uuid PRIMARY KEY,
  level integer NOT NULL DEFAULT 1,
  current_xp integer NOT NULL DEFAULT 0,
  next_level_xp integer NOT NULL DEFAULT 500,
  lifecoins integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  equipped jsonb NOT NULL DEFAULT '{"character":"char_runner","outfit":"outfit_street","accessory":"acc_glasses","scene":"scene_city","pet":null,"aura":null}'::jsonb,
  owned_items jsonb NOT NULL DEFAULT '["char_runner","char_hacker","char_luna","outfit_street","acc_glasses","scene_city"]'::jsonb,
  owned_themes jsonb NOT NULL DEFAULT '["cyber"]'::jsonb,
  theme_id text NOT NULL DEFAULT 'cyber',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.player_progress TO authenticated;
GRANT ALL ON public.player_progress TO service_role;
ALTER TABLE public.player_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress" ON public.player_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own progress" ON public.player_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.player_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_id text NOT NULL,
  unlocked boolean NOT NULL DEFAULT false,
  progress integer NOT NULL DEFAULT 0,
  unlocked_at timestamptz,
  UNIQUE(user_id, badge_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_badges TO authenticated;
GRANT ALL ON public.user_badges TO service_role;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own badges" ON public.user_badges FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own badges" ON public.user_badges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own badges" ON public.user_badges FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);