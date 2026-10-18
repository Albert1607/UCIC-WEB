-- ============================================================
-- UCIC Website Schema Migration v2
-- Run this in the Supabase SQL editor AFTER the initial schema
-- ============================================================

-- ── Hero Carousel Media ──────────────────────────────────────
-- Stores multiple hero carousel items (images or videos)
create table if not exists hero_carousel_items (
  id uuid primary key default uuid_generate_v4(),
  media_url text not null,
  media_type text not null default 'image', -- 'image' | 'video'
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Enable RLS
alter table hero_carousel_items enable row level security;
create policy "public can read hero_carousel_items"
  on hero_carousel_items for select using (true);
create policy "admin can manage hero_carousel_items"
  on hero_carousel_items for all using (auth.uid() is not null);

-- ── News / Embedded Links ────────────────────────────────────
create table if not exists news_items (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  embed_url text not null,         -- YouTube / Instagram / etc URL
  thumbnail_url text,              -- optional custom thumbnail
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table news_items enable row level security;
create policy "public can read news_items"
  on news_items for select using (true);
create policy "admin can manage news_items"
  on news_items for all using (auth.uid() is not null);

-- Add news carousel visible count setting to site_content
insert into site_content (key, value, content_type, label) values
  ('news_section_title', 'News & Updates', 'text', 'News Section Title'),
  ('news_carousel_per_view', '3', 'text', 'News Carousel Cards Per View')
on conflict (key) do nothing;

-- ── Timeline: add image_urls (jsonb array) ───────────────────
alter table timeline_items
  add column if not exists image_urls jsonb default '[]'::jsonb;

-- ── Experiences: add banner_image_url + album_items ──────────
alter table experiences
  add column if not exists banner_image_url text;

-- Album items for experiences (event photos)
create table if not exists experience_album_items (
  id uuid primary key default uuid_generate_v4(),
  experience_id uuid not null references experiences(id) on delete cascade,
  image_url text not null,
  caption text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table experience_album_items enable row level security;
create policy "public can read experience_album_items"
  on experience_album_items for select using (true);
create policy "admin can manage experience_album_items"
  on experience_album_items for all using (auth.uid() is not null);

create index if not exists idx_exp_album_exp_id on experience_album_items(experience_id);

-- ── Storage bucket for hero carousel ────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'hero-carousel',
  'hero-carousel',
  true,
  52428800, -- 50MB to support video
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/ogg']
)
on conflict (id) do nothing;

create policy "public read hero-carousel"
  on storage.objects for select using (bucket_id = 'hero-carousel');
create policy "admin manage hero-carousel"
  on storage.objects for all using (bucket_id = 'hero-carousel' and auth.uid() is not null);

-- ── Storage bucket for experience photos ─────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'experience-photos',
  'experience-photos',
  true,
  10485760,
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do nothing;

create policy "public read experience-photos"
  on storage.objects for select using (bucket_id = 'experience-photos');
create policy "admin manage experience-photos"
  on storage.objects for all using (bucket_id = 'experience-photos' and auth.uid() is not null);
