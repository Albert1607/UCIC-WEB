-- Migration: Replace user_profiles (tied to Supabase Auth) with a standalone users table
-- Run this in the Supabase SQL Editor

-- 1. Create the new standalone users table
CREATE TABLE IF NOT EXISTS public.users (
  id          uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
  email       text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  full_name   text,
  student_id  text,
  created_at  timestamp with time zone DEFAULT now(),
  updated_at  timestamp with time zone DEFAULT now()
);

-- 2. Index for fast email lookups (login)
CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON public.users (email);

-- 3. Disable RLS — access is controlled at the API layer via admin client
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
