-- AI YouTube Notes Generator — SQL Schema

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' NOT NULL,
    plan TEXT DEFAULT 'free' NOT NULL,
    account_status TEXT DEFAULT 'active' NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE NOT NULL,
    preferred_note_style TEXT DEFAULT 'standard' NOT NULL,
    preferred_language TEXT DEFAULT 'en' NOT NULL,
    timezone TEXT DEFAULT 'Asia/Kolkata' NOT NULL,
    theme TEXT DEFAULT 'system' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Usage Quotas
CREATE TABLE IF NOT EXISTS public.usage_quotas (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    daily_generation_limit INTEGER DEFAULT 5 NOT NULL,
    monthly_generation_limit INTEGER DEFAULT 100 NOT NULL,
    daily_generation_count INTEGER DEFAULT 0 NOT NULL,
    monthly_generation_count INTEGER DEFAULT 0 NOT NULL,
    last_daily_reset_at TIMESTAMPTZ DEFAULT NOW(),
    last_monthly_reset_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Notes
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    youtube_url TEXT NOT NULL,
    youtube_video_id TEXT,
    video_title TEXT,
    video_channel TEXT,
    video_duration_seconds INTEGER,
    thumbnail_url TEXT,
    transcript_language TEXT,
    transcript_source TEXT,
    generated_title TEXT,
    markdown_content TEXT NOT NULL,
    plain_text_content TEXT,
    style TEXT DEFAULT 'standard' NOT NULL,
    status TEXT DEFAULT 'completed' NOT NULL,
    token_input INTEGER,
    token_output INTEGER,
    model_name TEXT,
    provider_name TEXT,
    summary_version INTEGER DEFAULT 1 NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE NOT NULL,
    is_archived BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Note Jobs (for background tracking)
CREATE TABLE IF NOT EXISTS public.note_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    job_type TEXT DEFAULT 'generate_notes' NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    youtube_url TEXT NOT NULL,
    youtube_video_id TEXT,
    requested_style TEXT DEFAULT 'standard' NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    backend_request_id TEXT,
    note_id UUID REFERENCES public.notes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RLS Policies (example for profiles)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- (Repeat for other tables)
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notes" ON public.notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own notes" ON public.notes FOR ALL USING (auth.uid() = user_id);

-- (Automatic Profile Creation Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  INSERT INTO public.usage_quotas (user_id)
  VALUES (new.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
