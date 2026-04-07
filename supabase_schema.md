-- =========================================================
-- AI YOUTUBE NOTES GENERATOR - FULL SUPABASE SQL SCHEMA
-- =========================================================
-- Safe, scalable schema for:
-- - authentication-linked profiles
-- - user plans
-- - note generation history
-- - usage tracking
-- - async job tracking
-- - exports
-- - audit/security logging
-- - row level security
-- =========================================================

-- ---------------------------------------------------------
-- 1. EXTENSIONS
-- ---------------------------------------------------------
create extension if not exists pgcrypto;
create extension if not exists citext;

-- ---------------------------------------------------------
-- 2. CUSTOM TYPES / ENUMS
-- ---------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('user', 'premium', 'admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'account_status') then
    create type public.account_status as enum ('active', 'suspended', 'deleted');
  end if;

  if not exists (select 1 from pg_type where typname = 'note_status') then
    create type public.note_status as enum ('queued', 'processing', 'completed', 'failed');
  end if;

  if not exists (select 1 from pg_type where typname = 'note_style') then
    create type public.note_style as enum (
      'standard',
      'exam',
      'concise',
      'detailed',
      'bullet_summary'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'export_format') then
    create type public.export_format as enum ('md', 'pdf', 'txt');
  end if;

  if not exists (select 1 from pg_type where typname = 'plan_type') then
    create type public.plan_type as enum ('free', 'pro', 'enterprise');
  end if;

  if not exists (select 1 from pg_type where typname = 'job_type') then
    create type public.job_type as enum ('generate_notes', 'regenerate_notes', 'export_note');
  end if;

  if not exists (select 1 from pg_type where typname = 'job_status') then
    create type public.job_status as enum ('pending', 'running', 'completed', 'failed', 'cancelled');
  end if;
end $$;

-- ---------------------------------------------------------
-- 3. UPDATED_AT TRIGGER FUNCTION
-- ---------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------
-- 4. HANDLE NEW USER PROFILE CREATION
-- ---------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    avatar_url,
    role,
    plan,
    account_status,
    email_verified
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    new.raw_user_meta_data ->> 'avatar_url',
    'user',
    'free',
    'active',
    coalesce(new.email_confirmed_at is not null, false)
  )
  on conflict (id) do nothing;

  insert into public.usage_quotas (
    user_id,
    daily_generation_limit,
    monthly_generation_limit,
    daily_generation_count,
    monthly_generation_count,
    last_daily_reset_at,
    last_monthly_reset_at
  )
  values (
    new.id,
    5,
    100,
    0,
    0,
    now(),
    now()
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Drop trigger if it exists first, then recreate
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

-- ---------------------------------------------------------
-- 5. SYNC EMAIL VERIFIED STATUS FROM AUTH USERS
-- ---------------------------------------------------------
create or replace function public.sync_profile_email_verified()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    email = new.email,
    email_verified = (new.email_confirmed_at is not null),
    updated_at = now()
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_updated_sync_profile on auth.users;

create trigger on_auth_user_updated_sync_profile
after update of email, email_confirmed_at on auth.users
for each row
execute procedure public.sync_profile_email_verified();

-- ---------------------------------------------------------
-- 6. PROFILES
-- ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text check (char_length(full_name) <= 120),
  email citext unique,
  avatar_url text,
  role public.app_role not null default 'user',
  plan public.plan_type not null default 'free',
  account_status public.account_status not null default 'active',
  email_verified boolean not null default false,

  preferred_note_style public.note_style not null default 'standard',
  preferred_language text not null default 'en',
  timezone text not null default 'Asia/Kolkata',
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute procedure public.set_updated_at();

-- ---------------------------------------------------------
-- 7. USAGE QUOTAS / LIMITS
-- ---------------------------------------------------------
create table if not exists public.usage_quotas (
  user_id uuid primary key references auth.users(id) on delete cascade,

  daily_generation_limit integer not null default 5 check (daily_generation_limit >= 0),
  monthly_generation_limit integer not null default 100 check (monthly_generation_limit >= 0),

  daily_generation_count integer not null default 0 check (daily_generation_count >= 0),
  monthly_generation_count integer not null default 0 check (monthly_generation_count >= 0),

  last_daily_reset_at timestamptz not null default now(),
  last_monthly_reset_at timestamptz not null default now(),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_usage_quotas_updated_at
before update on public.usage_quotas
for each row
execute procedure public.set_updated_at();

-- ---------------------------------------------------------
-- 8. NOTES TABLE
-- ---------------------------------------------------------
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  youtube_url text not null,
  youtube_video_id text,
  video_title text,
  video_channel text,
  video_duration_seconds integer check (video_duration_seconds is null or video_duration_seconds >= 0),
  thumbnail_url text,

  transcript_language text,
  transcript_source text,

  generated_title text,
  markdown_content text not null,
  plain_text_content text,

  style public.note_style not null default 'standard',
  status public.note_status not null default 'completed',

  token_input integer check (token_input is null or token_input >= 0),
  token_output integer check (token_output is null or token_output >= 0),
  model_name text,
  provider_name text,

  summary_version integer not null default 1 check (summary_version >= 1),
  is_favorite boolean not null default false,
  is_archived boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint notes_youtube_url_not_empty check (char_length(trim(youtube_url)) > 0),
  constraint notes_markdown_not_empty check (char_length(trim(markdown_content)) > 0)
);

create trigger set_notes_updated_at
before update on public.notes
for each row
execute procedure public.set_updated_at();

-- ---------------------------------------------------------
-- 9. NOTE TAGS
-- ---------------------------------------------------------
create table if not exists public.note_tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  constraint note_tags_name_length check (char_length(trim(name)) between 1 and 50),
  constraint note_tags_user_name_unique unique (user_id, name)
);

-- ---------------------------------------------------------
-- 10. NOTE <-> TAG MAPPING
-- ---------------------------------------------------------
create table if not exists public.note_tag_map (
  note_id uuid not null references public.notes(id) on delete cascade,
  tag_id uuid not null references public.note_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (note_id, tag_id)
);

-- ---------------------------------------------------------
-- 11. NOTE GENERATION JOBS
-- ---------------------------------------------------------
create table if not exists public.note_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  job_type public.job_type not null default 'generate_notes',
  status public.job_status not null default 'pending',

  youtube_url text not null,
  youtube_video_id text,
  requested_style public.note_style not null default 'standard',

  started_at timestamptz,
  completed_at timestamptz,

  error_message text,
  backend_request_id text,

  note_id uuid references public.notes(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_note_jobs_updated_at
before update on public.note_jobs
for each row
execute procedure public.set_updated_at();

-- ---------------------------------------------------------
-- 12. NOTE EXPORTS
-- ---------------------------------------------------------
create table if not exists public.note_exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  note_id uuid not null references public.notes(id) on delete cascade,

  export_type public.export_format not null default 'md',
  file_path text,
  file_size_bytes bigint check (file_size_bytes is null or file_size_bytes >= 0),

  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- 13. SECURITY / AUDIT LOGS
-- ---------------------------------------------------------
create table if not exists public.security_logs (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,

  event_type text not null,
  ip_address inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- 14. OPTIONAL USER FEEDBACK ON GENERATED NOTES
-- ---------------------------------------------------------
create table if not exists public.note_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  note_id uuid not null references public.notes(id) on delete cascade,

  rating integer not null check (rating between 1 and 5),
  feedback_text text,

  created_at timestamptz not null default now(),

  constraint note_feedback_one_per_user_note unique (user_id, note_id)
);

-- ---------------------------------------------------------
-- 15. INDEXES
-- ---------------------------------------------------------
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_plan on public.profiles(plan);

create index if not exists idx_notes_user_id on public.notes(user_id);
create index if not exists idx_notes_user_created_at on public.notes(user_id, created_at desc);
create index if not exists idx_notes_youtube_video_id on public.notes(youtube_video_id);
create index if not exists idx_notes_status on public.notes(status);
create index if not exists idx_notes_favorite on public.notes(user_id, is_favorite);
create index if not exists idx_notes_archived on public.notes(user_id, is_archived);

create index if not exists idx_note_jobs_user_id on public.note_jobs(user_id);
create index if not exists idx_note_jobs_status on public.note_jobs(status);
create index if not exists idx_note_jobs_created_at on public.note_jobs(created_at desc);

create index if not exists idx_note_exports_user_id on public.note_exports(user_id);
create index if not exists idx_note_exports_note_id on public.note_exports(note_id);

create index if not exists idx_security_logs_user_id on public.security_logs(user_id);
create index if not exists idx_security_logs_event_type on public.security_logs(event_type);
create index if not exists idx_security_logs_created_at on public.security_logs(created_at desc);

create index if not exists idx_note_tags_user_id on public.note_tags(user_id);
create index if not exists idx_note_feedback_user_id on public.note_feedback(user_id);

-- ---------------------------------------------------------
-- 16. OPTIONAL FULL TEXT SEARCH SUPPORT FOR NOTES
-- ---------------------------------------------------------
alter table public.notes
add column if not exists search_vector tsvector generated always as (
  setweight(to_tsvector('english', coalesce(video_title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(generated_title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(markdown_content, '')), 'B')
) stored;

create index if not exists idx_notes_search_vector
on public.notes using gin(search_vector);

-- ---------------------------------------------------------
-- 17. ENABLE ROW LEVEL SECURITY
-- ---------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.usage_quotas enable row level security;
alter table public.notes enable row level security;
alter table public.note_tags enable row level security;
alter table public.note_tag_map enable row level security;
alter table public.note_jobs enable row level security;
alter table public.note_exports enable row level security;
alter table public.security_logs enable row level security;
alter table public.note_feedback enable row level security;

-- ---------------------------------------------------------
-- 18. DROP EXISTING POLICIES SAFELY
-- ---------------------------------------------------------
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

drop policy if exists "Users can view own quotas" on public.usage_quotas;

drop policy if exists "Users can view own notes" on public.notes;
drop policy if exists "Users can insert own notes" on public.notes;
drop policy if exists "Users can update own notes" on public.notes;
drop policy if exists "Users can delete own notes" on public.notes;

drop policy if exists "Users can manage own note tags" on public.note_tags;
drop policy if exists "Users can view own note tag map" on public.note_tag_map;
drop policy if exists "Users can manage own note tag map" on public.note_tag_map;

drop policy if exists "Users can view own jobs" on public.note_jobs;
drop policy if exists "Users can insert own jobs" on public.note_jobs;
drop policy if exists "Users can update own jobs" on public.note_jobs;

drop policy if exists "Users can view own exports" on public.note_exports;
drop policy if exists "Users can insert own exports" on public.note_exports;
drop policy if exists "Users can delete own exports" on public.note_exports;

drop policy if exists "Users can view own security logs" on public.security_logs;

drop policy if exists "Users can manage own feedback" on public.note_feedback;

-- ---------------------------------------------------------
-- 19. RLS POLICIES - PROFILES
-- ---------------------------------------------------------
create policy "Users can view own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- ---------------------------------------------------------
-- 20. RLS POLICIES - USAGE QUOTAS
-- ---------------------------------------------------------
create policy "Users can view own quotas"
on public.usage_quotas
for select
using (auth.uid() = user_id);

-- no direct insert/update/delete for clients on quotas
-- backend/service role should manage quota counters safely

-- ---------------------------------------------------------
-- 21. RLS POLICIES - NOTES
-- ---------------------------------------------------------
create policy "Users can view own notes"
on public.notes
for select
using (auth.uid() = user_id);

create policy "Users can insert own notes"
on public.notes
for insert
with check (auth.uid() = user_id);

create policy "Users can update own notes"
on public.notes
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own notes"
on public.notes
for delete
using (auth.uid() = user_id);

-- ---------------------------------------------------------
-- 22. RLS POLICIES - NOTE TAGS
-- ---------------------------------------------------------
create policy "Users can manage own note tags"
on public.note_tags
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ---------------------------------------------------------
-- 23. RLS POLICIES - NOTE TAG MAP
-- ---------------------------------------------------------
create policy "Users can view own note tag map"
on public.note_tag_map
for select
using (
  exists (
    select 1
    from public.notes n
    where n.id = note_tag_map.note_id
      and n.user_id = auth.uid()
  )
);

create policy "Users can manage own note tag map"
on public.note_tag_map
for all
using (
  exists (
    select 1
    from public.notes n
    where n.id = note_tag_map.note_id
      and n.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.notes n
    where n.id = note_tag_map.note_id
      and n.user_id = auth.uid()
  )
);

-- ---------------------------------------------------------
-- 24. RLS POLICIES - NOTE JOBS
-- ---------------------------------------------------------
create policy "Users can view own jobs"
on public.note_jobs
for select
using (auth.uid() = user_id);

create policy "Users can insert own jobs"
on public.note_jobs
for insert
with check (auth.uid() = user_id);

create policy "Users can update own jobs"
on public.note_jobs
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ---------------------------------------------------------
-- 25. RLS POLICIES - NOTE EXPORTS
-- ---------------------------------------------------------
create policy "Users can view own exports"
on public.note_exports
for select
using (auth.uid() = user_id);

create policy "Users can insert own exports"
on public.note_exports
for insert
with check (auth.uid() = user_id);

create policy "Users can delete own exports"
on public.note_exports
for delete
using (auth.uid() = user_id);

-- ---------------------------------------------------------
-- 26. RLS POLICIES - SECURITY LOGS
-- ---------------------------------------------------------
create policy "Users can view own security logs"
on public.security_logs
for select
using (auth.uid() = user_id);

-- no client insert/update/delete by default

-- ---------------------------------------------------------
-- 27. RLS POLICIES - NOTE FEEDBACK
-- ---------------------------------------------------------
create policy "Users can manage own feedback"
on public.note_feedback
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ---------------------------------------------------------
-- 28. HELPER FUNCTION TO RESET QUOTAS
-- ---------------------------------------------------------
create or replace function public.reset_user_quotas_if_needed(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.usage_quotas
  set
    daily_generation_count = case
      when last_daily_reset_at::date < now()::date then 0
      else daily_generation_count
    end,
    monthly_generation_count = case
      when date_trunc('month', last_monthly_reset_at) < date_trunc('month', now()) then 0
      else monthly_generation_count
    end,
    last_daily_reset_at = case
      when last_daily_reset_at::date < now()::date then now()
      else last_daily_reset_at
    end,
    last_monthly_reset_at = case
      when date_trunc('month', last_monthly_reset_at) < date_trunc('month', now()) then now()
      else last_monthly_reset_at
    end,
    updated_at = now()
  where user_id = p_user_id;
end;
$$;

-- ---------------------------------------------------------
-- 29. HELPER FUNCTION TO INCREMENT USAGE
-- ---------------------------------------------------------
create or replace function public.increment_generation_usage(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.reset_user_quotas_if_needed(p_user_id);

  update public.usage_quotas
  set
    daily_generation_count = daily_generation_count + 1,
    monthly_generation_count = monthly_generation_count + 1,
    updated_at = now()
  where user_id = p_user_id;
end;
$$;

-- ---------------------------------------------------------
-- 30. HELPER FUNCTION TO CHECK REMAINING USAGE
-- ---------------------------------------------------------
create or replace function public.can_user_generate(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_daily_count integer;
  v_daily_limit integer;
  v_monthly_count integer;
  v_monthly_limit integer;
begin
  perform public.reset_user_quotas_if_needed(p_user_id);

  select
    daily_generation_count,
    daily_generation_limit,
    monthly_generation_count,
    monthly_generation_limit
  into
    v_daily_count,
    v_daily_limit,
    v_monthly_count,
    v_monthly_limit
  from public.usage_quotas
  where user_id = p_user_id;

  if v_daily_count is null then
    return false;
  end if;

  return (v_daily_count < v_daily_limit) and (v_monthly_count < v_monthly_limit);
end;
$$;

-- ---------------------------------------------------------
-- 31. OPTIONAL ADMIN VIEW
-- ---------------------------------------------------------
create or replace view public.admin_user_overview as
select
  p.id,
  p.full_name,
  p.email,
  p.role,
  p.plan,
  p.account_status,
  p.email_verified,
  p.created_at,
  uq.daily_generation_count,
  uq.daily_generation_limit,
  uq.monthly_generation_count,
  uq.monthly_generation_limit
from public.profiles p
left join public.usage_quotas uq on uq.user_id = p.id;

-- Restrict client access unless explicitly exposed later.
revoke all on public.admin_user_overview from anon, authenticated;

-- ---------------------------------------------------------
-- 32. STORAGE BUCKET SUGGESTION
-- ---------------------------------------------------------
-- Create this bucket manually in Supabase Storage:
--   note-exports
--
-- Suggested object path convention:
--   user_id/note_id/export_filename.md
--
-- Storage policies are configured separately in Supabase Storage UI or SQL.

-- ---------------------------------------------------------
-- 33. OPTIONAL SEED / UPDATE PLANS
-- ---------------------------------------------------------
-- Upgrade admins manually like:
-- update public.profiles set role = 'admin', plan = 'enterprise' where email = 'your@email.com';

-- Update premium quota manually like:
-- update public.usage_quotas
-- set daily_generation_limit = 100, monthly_generation_limit = 3000
-- where user_id = 'USER_UUID';

-- =========================================================
-- END OF SCHEMA
-- =========================================================