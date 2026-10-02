-- ============================================================
-- UCIC Website Database Schema
-- Run this in the Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Site-wide editable content (key-value store)
create table if not exists site_content (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null,
  value text,
  value_json jsonb,
  content_type text not null default 'text', -- 'text' | 'html' | 'json'
  label text,
  updated_at timestamptz default now()
);

-- Site stats (big numbers shown on home/about)
create table if not exists site_stats (
  id uuid primary key default uuid_generate_v4(),
  label text not null,
  value text not null,
  icon text,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Team members
create table if not exists team_members (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text not null,
  bio text,
  photo_url text,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Experiences (About Us section)
create table if not exists experiences (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  year text,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Timeline items (About Us section)
create table if not exists timeline_items (
  id uuid primary key default uuid_generate_v4(),
  year text not null,
  title text not null,
  description text,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Events
create table if not exists events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  description text,
  date timestamptz,
  end_date timestamptz,
  location text,
  cover_image_url text,
  capacity integer,
  deadline timestamptz,
  is_published boolean default false,
  registration_mode text not null default 'none', -- 'none' | 'internal' | 'external'
  external_registration_url text,
  one_submission_per_email boolean default false,
  email_field_id uuid, -- references form_fields(id) for the email question
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Form fields (per event)
create table if not exists form_fields (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  field_type text not null, -- 'short_text'|'long_text'|'email'|'phone'|'number'|'date'|'dropdown'|'radio'|'checkboxes'|'yes_no'|'file_upload'|'section_header'
  label text not null,
  help_text text,
  placeholder text,
  required boolean default false,
  options jsonb, -- array of {id, label} for dropdown/radio/checkboxes
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Registrations
create table if not exists registrations (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  answers jsonb not null default '{}', -- { [field_id]: value }
  submitted_email text, -- denormalized for quick lookup
  created_at timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_events_slug on events(slug);
create index if not exists idx_events_published on events(is_published);
create index if not exists idx_form_fields_event_id on form_fields(event_id);
create index if not exists idx_registrations_event_id on registrations(event_id);
create index if not exists idx_registrations_email on registrations(submitted_email);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table site_content enable row level security;
alter table site_stats enable row level security;
alter table team_members enable row level security;
alter table experiences enable row level security;
alter table timeline_items enable row level security;
alter table events enable row level security;
alter table form_fields enable row level security;
alter table registrations enable row level security;

-- Helper: is admin (authenticated user)
-- We use auth.uid() is not null as the admin check.
-- Only one admin account should be created in Supabase Auth.

-- site_content: public read, admin write
create policy "public can read site_content"
  on site_content for select using (true);
create policy "admin can manage site_content"
  on site_content for all using (auth.uid() is not null);

-- site_stats: public read, admin write
create policy "public can read site_stats"
  on site_stats for select using (true);
create policy "admin can manage site_stats"
  on site_stats for all using (auth.uid() is not null);

-- team_members: public read, admin write
create policy "public can read team_members"
  on team_members for select using (true);
create policy "admin can manage team_members"
  on team_members for all using (auth.uid() is not null);

-- experiences: public read, admin write
create policy "public can read experiences"
  on experiences for select using (true);
create policy "admin can manage experiences"
  on experiences for all using (auth.uid() is not null);

-- timeline_items: public read, admin write
create policy "public can read timeline_items"
  on timeline_items for select using (true);
create policy "admin can manage timeline_items"
  on timeline_items for all using (auth.uid() is not null);

-- events: public can read published, admin can read/write all
create policy "public can read published events"
  on events for select using (is_published = true);
create policy "admin can manage events"
  on events for all using (auth.uid() is not null);

-- form_fields: public can read fields for published events, admin manages all
create policy "public can read form_fields for published events"
  on form_fields for select using (
    exists (
      select 1 from events e
      where e.id = form_fields.event_id
      and e.is_published = true
    )
  );
create policy "admin can manage form_fields"
  on form_fields for all using (auth.uid() is not null);

-- registrations: public can insert only, admin can read/manage
create policy "public can insert registrations"
  on registrations for insert with check (
    exists (
      select 1 from events e
      where e.id = registrations.event_id
      and e.is_published = true
      and e.registration_mode = 'internal'
    )
  );
create policy "admin can manage registrations"
  on registrations for all using (auth.uid() is not null);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

-- Create buckets (run as service role or owner)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('event-covers', 'event-covers', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif']),
  ('team-photos', 'team-photos', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('site-images', 'site-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']),
  ('registration-files', 'registration-files', false, 10485760, null)
on conflict (id) do nothing;

-- Storage policies: public read for public buckets
create policy "public read event-covers"
  on storage.objects for select using (bucket_id = 'event-covers');
create policy "admin manage event-covers"
  on storage.objects for all using (bucket_id = 'event-covers' and auth.uid() is not null);

create policy "public read team-photos"
  on storage.objects for select using (bucket_id = 'team-photos');
create policy "admin manage team-photos"
  on storage.objects for all using (bucket_id = 'team-photos' and auth.uid() is not null);

create policy "public read site-images"
  on storage.objects for select using (bucket_id = 'site-images');
create policy "admin manage site-images"
  on storage.objects for all using (bucket_id = 'site-images' and auth.uid() is not null);

-- registration-files: admin only
create policy "admin manage registration-files"
  on storage.objects for all using (bucket_id = 'registration-files' and auth.uid() is not null);

-- ============================================================
-- DEFAULT SITE CONTENT SEEDS
-- ============================================================

insert into site_content (key, value, content_type, label) values
  ('hero_headline', 'Connecting Students Across the Globe', 'text', 'Hero Headline'),
  ('hero_subheadline', 'Universitas Ciputra International Community — where cultures meet, ideas grow, and friendships last.', 'text', 'Hero Sub-headline'),
  ('hero_cta_label', 'Browse Events', 'text', 'Hero CTA Button Label'),
  ('hero_image_url', '', 'text', 'Hero Background Image URL'),
  ('hero_card_title', 'Join UCIC', 'text', 'Hero Floating Card Title'),
  ('hero_card_subtitle', 'Open to all UC students', 'text', 'Hero Floating Card Subtitle'),
  ('about_title', 'About Us', 'text', 'About Page Title'),
  ('about_intro', 'We are the Universitas Ciputra International Community — a student-led organization dedicated to fostering international connections, cross-cultural understanding, and global opportunities within UC.', 'text', 'About Intro'),
  ('about_image_url', '', 'text', 'About Section Image URL'),
  ('about_mission_title', 'Our Mission', 'text', 'Mission Section Title'),
  ('about_mission', 'To create an inclusive community where every UC student — local or international — feels at home, grows as a global citizen, and builds meaningful connections.', 'text', 'Mission Statement'),
  ('about_vision_title', 'Our Vision', 'text', 'Vision Section Title'),
  ('about_vision', 'A vibrant international campus community that celebrates diversity and empowers students to thrive in a global world.', 'text', 'Vision Statement'),
  ('footer_tagline', 'Universitas Ciputra International Community', 'text', 'Footer Tagline'),
  ('footer_description', 'Connecting UC students with the world.', 'text', 'Footer Description'),
  ('contact_email', 'ucic@ciputra.ac.id', 'text', 'Contact Email'),
  ('contact_instagram', '', 'text', 'Instagram Handle'),
  ('contact_line', '', 'text', 'LINE ID'),
  ('events_section_title', 'Events', 'text', 'Events Section Title'),
  ('events_upcoming_label', 'Upcoming', 'text', 'Upcoming Events Label'),
  ('events_past_label', 'Past Events', 'text', 'Past Events Label'),
  ('team_section_title', 'Meet the Team', 'text', 'Team Section Title'),
  ('latest_activity_title', 'Latest Activity', 'text', 'Home: Latest Activity Title'),
  ('register_button_label', 'Register Now', 'text', 'Register Button Label'),
  ('register_closed_label', 'Registration Closed', 'text', 'Closed Registration Label'),
  ('register_full_label', 'Event Full', 'text', 'Full Event Label'),
  ('nav_home', 'Home', 'text', 'Nav: Home'),
  ('nav_about', 'About Us', 'text', 'Nav: About'),
  ('nav_events', 'Events', 'text', 'Nav: Events'),
  ('nav_contact', 'Contact', 'text', 'Nav: Contact'),
  ('scrolling_strip_text', 'UCIC · Connecting Students · Events · Community · International · Universitas Ciputra ·', 'text', 'Scrolling Strip Text'),
  ('stats_section_title', 'By the Numbers', 'text', 'Stats Section Title')
on conflict (key) do nothing;

insert into site_stats (label, value, sort_order) values
  ('Members', '200+', 0),
  ('Events per Year', '20+', 1),
  ('Nationalities', '15+', 2),
  ('Years Active', '5+', 3)
on conflict do nothing;
