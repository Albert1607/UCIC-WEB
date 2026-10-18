-- ============================================================
-- UCIC Website Schema Migration v3  (safe / non-destructive)
-- Run this in the Supabase SQL editor AFTER migration v2
--
-- This script NEVER drops or recreates tables.
-- It only adds missing columns and policies, so existing
-- data is always preserved.
-- ============================================================

-- ── user_profiles table ──────────────────────────────────────
create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  student_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table user_profiles enable row level security;

drop policy if exists "users can read own profile" on user_profiles;
create policy "users can read own profile"
  on user_profiles for select using (auth.uid() = id);

drop policy if exists "users can update own profile" on user_profiles;
create policy "users can update own profile"
  on user_profiles for update using (auth.uid() = id);

drop policy if exists "admin can manage user_profiles" on user_profiles;
create policy "admin can manage user_profiles"
  on user_profiles for all using (auth.uid() is not null);

-- ── registration-files: allow public uploads ──────────────────
drop policy if exists "public can upload registration files" on storage.objects;
create policy "public can upload registration files"
  on storage.objects for insert with check (bucket_id = 'registration-files');

-- ── events: add post_registration_message column ─────────────
alter table events
  add column if not exists post_registration_message text;

-- ── submission_forms table ────────────────────────────────────
create table if not exists submission_forms (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  title text not null default 'Submission Form',
  description text,
  deadline timestamptz,
  is_open boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- In case the table existed but was missing columns
alter table submission_forms add column if not exists event_id uuid references events(id) on delete cascade;
alter table submission_forms add column if not exists title text;
alter table submission_forms add column if not exists description text;
alter table submission_forms add column if not exists deadline timestamptz;
alter table submission_forms add column if not exists is_open boolean default true;
alter table submission_forms add column if not exists created_at timestamptz default now();
alter table submission_forms add column if not exists updated_at timestamptz default now();

alter table submission_forms enable row level security;

drop policy if exists "public can read submission_forms" on submission_forms;
create policy "public can read submission_forms"
  on submission_forms for select using (true);

drop policy if exists "admin can manage submission_forms" on submission_forms;
create policy "admin can manage submission_forms"
  on submission_forms for all using (auth.uid() is not null);

create index if not exists idx_submission_forms_event_id on submission_forms(event_id);

-- ── submission_fields table ───────────────────────────────────
create table if not exists submission_fields (
  id uuid primary key default uuid_generate_v4(),
  form_id uuid references submission_forms(id) on delete cascade,
  field_type text not null,
  label text not null,
  help_text text,
  placeholder text,
  required boolean default false,
  options jsonb,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- In case the table existed but was missing form_id
-- NOTE: nullable (no NOT NULL) so existing rows are not broken
alter table submission_fields add column if not exists form_id uuid references submission_forms(id) on delete cascade;
alter table submission_fields add column if not exists field_type text;
alter table submission_fields add column if not exists label text;
alter table submission_fields add column if not exists help_text text;
alter table submission_fields add column if not exists placeholder text;
alter table submission_fields add column if not exists required boolean default false;
alter table submission_fields add column if not exists options jsonb;
alter table submission_fields add column if not exists sort_order integer default 0;

alter table submission_fields enable row level security;

drop policy if exists "public can read submission_fields" on submission_fields;
create policy "public can read submission_fields"
  on submission_fields for select using (true);

drop policy if exists "admin can manage submission_fields" on submission_fields;
create policy "admin can manage submission_fields"
  on submission_fields for all using (auth.uid() is not null);

create index if not exists idx_submission_fields_form_id on submission_fields(form_id);

-- ── submissions table ─────────────────────────────────────────
create table if not exists submissions (
  id uuid primary key default uuid_generate_v4(),
  form_id uuid references submission_forms(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  answers jsonb not null default '{}',
  submitted_at timestamptz default now()
);

-- In case the table existed but was missing columns
-- All new columns are nullable so existing rows keep their data intact
alter table submissions add column if not exists form_id uuid references submission_forms(id) on delete cascade;
alter table submissions add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table submissions add column if not exists answers jsonb default '{}';
alter table submissions add column if not exists submitted_at timestamptz default now();

alter table submissions enable row level security;

drop policy if exists "users can insert submissions" on submissions;
create policy "users can insert submissions"
  on submissions for insert with check (auth.uid() = user_id);

drop policy if exists "users can read own submissions" on submissions;
create policy "users can read own submissions"
  on submissions for select using (auth.uid() = user_id);

drop policy if exists "admin can manage submissions" on submissions;
create policy "admin can manage submissions"
  on submissions for all using (auth.uid() is not null);

create index if not exists idx_submissions_form_id on submissions(form_id);
create index if not exists idx_submissions_user_id on submissions(user_id);
