--
-- PostgreSQL database dump
--

\restrict 08fuCqoJPhUtfn6laAOilSfXWM1yYRn6NdUo6t4nRY0bF803HLy4uoHJTNSwwGs

-- Dumped from database version 17.11
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: event_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_submissions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    event_id uuid NOT NULL,
    registration_id uuid NOT NULL,
    user_id uuid NOT NULL,
    answers jsonb DEFAULT '{}'::jsonb NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    submitted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    description text,
    date timestamp with time zone,
    end_date timestamp with time zone,
    location text,
    cover_image_url text,
    capacity integer,
    deadline timestamp with time zone,
    is_published boolean DEFAULT false,
    registration_mode text DEFAULT 'none'::text NOT NULL,
    external_registration_url text,
    one_submission_per_email boolean DEFAULT false,
    email_field_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    requires_submission boolean DEFAULT false NOT NULL,
    submission_deadline timestamp with time zone,
    submission_instructions text,
    post_registration_message text
);


--
-- Name: experience_album_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.experience_album_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    experience_id uuid NOT NULL,
    image_url text NOT NULL,
    caption text,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: experiences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.experiences (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    description text,
    year text,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    banner_image_url text
);


--
-- Name: form_fields; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.form_fields (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    event_id uuid NOT NULL,
    field_type text NOT NULL,
    label text NOT NULL,
    help_text text,
    placeholder text,
    required boolean DEFAULT false,
    options jsonb,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: hero_carousel_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hero_carousel_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    media_url text NOT NULL,
    media_type text DEFAULT 'image'::text NOT NULL,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: news_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.news_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    embed_url text NOT NULL,
    thumbnail_url text,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registrations (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    event_id uuid NOT NULL,
    answers jsonb DEFAULT '{}'::jsonb NOT NULL,
    submitted_email text,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid
);


--
-- Name: site_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_content (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    key text NOT NULL,
    value text,
    value_json jsonb,
    content_type text DEFAULT 'text'::text NOT NULL,
    label text,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: site_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_stats (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    label text NOT NULL,
    value text NOT NULL,
    icon text,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: submission_fields; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.submission_fields (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    event_id uuid NOT NULL,
    field_type text DEFAULT 'short_text'::text NOT NULL,
    label text DEFAULT ''::text NOT NULL,
    help_text text,
    placeholder text,
    required boolean DEFAULT false NOT NULL,
    allowed_file_types text[],
    max_file_size_mb integer DEFAULT 50,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    form_id uuid,
    options jsonb
);


--
-- Name: submission_forms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.submission_forms (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    event_id uuid NOT NULL,
    title text DEFAULT 'Submission Form'::text NOT NULL,
    description text,
    deadline timestamp with time zone,
    is_open boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.submissions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    form_id uuid,
    user_id uuid,
    answers jsonb DEFAULT '{}'::jsonb NOT NULL,
    submitted_at timestamp with time zone DEFAULT now()
);


--
-- Name: team_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_members (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    bio text,
    photo_url text,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: timeline_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.timeline_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    year text NOT NULL,
    title text NOT NULL,
    description text,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    image_urls jsonb DEFAULT '[]'::jsonb
);


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profiles (
    id uuid NOT NULL,
    full_name text,
    student_id text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Data for Name: event_submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event_submissions (id, event_id, registration_id, user_id, answers, status, submitted_at, created_at, updated_at) FROM stdin;
481e9403-913e-46b1-b2cb-530cef66df75	305b1b91-2b74-469b-b1c3-de881c26ce30	2aa64744-7abc-4148-b255-f70f75f13164	5c52b9fb-91fa-4f76-8d23-40140a1e7a53	{}	draft	\N	2026-10-18 13:20:41.43124+00	2026-10-18 13:20:41.43124+00
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.events (id, title, slug, description, date, end_date, location, cover_image_url, capacity, deadline, is_published, registration_mode, external_registration_url, one_submission_per_email, email_field_id, created_at, updated_at, requires_submission, submission_deadline, submission_instructions, post_registration_message) FROM stdin;
1d99f4fc-1873-466c-8527-aaf97ed8b5b2	UCIC Talk: Germany Unpacked	ucictalk-germany	Ever wondered what it’s really like to study abroad in Germany? Join us as we sit down with Ingrid Tanesa (IBM ‘21), an exchange student at Frankfurt School of Finance & Management, to talk about student life, cultural shocks and personal growth!\n\n🎁 KP IO GRANTED! ☝️\nDon’t miss this chance to gain insights into international student life while earning International Office Credit Points (KP IO) ✈️\n\n📅 Thursday, 22 October 2026\n⏰ 5 PM WIB (GMT+7)\n💻 Zoom Meeting ID: 956 6712 7023\n🔑 Passcode: UCICTalk\n\n🎟️ DON’T MISS OUT!\nRegister through CIS → My Activity → International Office → Browse International Event.\n\n📞 CONTACT PERSON\nJade (+62 811-3200-036)\nGaby (+62 821-5123-4558)\n\nUCIC, Let’s Go Global 🌏🌟	2026-10-22 10:00:00+00	2026-10-22 12:00:00+00	Meeting ID: 956 6712 7023	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/event-covers/events/1d99f4fc-1873-466c-8527-aaf97ed8b5b2/1791895342246.png	\N	2026-10-22 10:00:00+00	t	external	https://student.ciputra.ac.id/global_event/browse	f	\N	2026-10-13 10:08:10.813926+00	2026-10-14 05:00:44.67+00	f	\N	\N	\N
305b1b91-2b74-469b-b1c3-de881c26ce30	WISE: Worldview & International Sustainability Essay Competition	wise2026	WISE 2026 (Worldview &amp; International Sustainability Essay Competition) is an essay competition organized by UC International Community (UCIC) that invites young minds to explore global challenges and share their perspectives on building a more sustainable future.\n\nUnder the theme “The Future We Choose”, participants are encouraged to develop innovative ideas and thoughtful solutions through five subthemes: Technology, Education, Climate, and Economic Growth.<div><br></div><div>Through WISE 2026, we aim to empower young writers to think critically, express their ideas, and recognize the role they can play in shaping a better future for our world.&nbsp;</div><div><br></div><div>&nbsp;General Requirements:&nbsp;</div><div>1. Participants must be active undergraduate students enrolled at any higher education institutions.&nbsp;</div><div>2. Participants may compete individually or in teams consisting of 2-3 active students.&nbsp;</div><div>3. Submitted entries must be original, must not have been submitted to any other competition, and must not have been published in any form.&nbsp;</div><div>4.  ⁠Participants must agree to all terms and conditions stated in the WISE 2026 Guidebook.&nbsp;</div><div><br></div><div>For more informations:&nbsp;</div><div>📖 Competition Guidebook: <a href="https://bit.ly/WISE2026Guidebook">https://bit.ly/WISE2026</a><span style="font-family: inherit;"><a href="https://bit.ly/WISE2026Guidebook">Guidebook&nbsp;</a></span></div><div><span style="font-family: inherit;">📅 Registration &amp; Submission Deadline: 16th November 2026&nbsp;</span></div><div><span style="font-family: inherit;">&nbsp;📞 Contact Person: \nJade (+62 811-3200-036)\nGabby (+62 821-5123-4558)</span></div>	2026-11-16 16:59:00+00	2026-11-28 11:00:00+00	Online Competition	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/event-covers/events/305b1b91-2b74-469b-b1c3-de881c26ce30/1791993423839.png	\N	2026-11-16 16:59:00+00	t	internal	\N	f	\N	2026-10-13 08:41:40.895002+00	2026-10-19 06:37:16.986+00	t	2026-11-16 16:59:00+00	Before submitting your work, please make sure that your essay has been prepared according to the WISE 2026 Guidebook and meets all submission requirements. For team entires, the team leader must submit the essay on behalf of the entire team. \n\nMake sure you have prepared:\n📑 Final essay in PDF format\n📝 Declaration of Originality\n\nPlease carefully review your submission before clicking Submit. Make sure the uploaded file is the final version of your essay and that all information provided is accurate.\n\n⏰ Submission Deadline: November 16th, 2026\n\nGood Luck! 🌟	🌍 Thank you for registering for WISE 2026! We're excited to have you join us 🥳\n\n📢 Join the official WhatsApp group to receive important announcements, updates, and submission reminders.\n<a href="https://chat.whatsapp.com/Kg6n8Mv2po4DCM7fmdJMnH?mode=gi_t" target="_blank" rel="noopener noreferrer">https://chat.whatsapp.com/Kg6n8Mv2po4DCM7fmdJMnH?mode=gi_t</a>\nSee you at WISE 2026! 🌱
\.


--
-- Data for Name: experience_album_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.experience_album_items (id, experience_id, image_url, caption, sort_order, created_at) FROM stdin;
63933807-fea1-414b-893c-f2544c06cb94	46d2f9b2-90fa-4872-a58c-33bf683a4905	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/46d2f9b2-90fa-4872-a58c-33bf683a4905/1792337867001.jpg	\N	0	2026-10-18 15:38:06.926776+00
975ade98-210a-4ec2-91fe-3aa90eedc926	46d2f9b2-90fa-4872-a58c-33bf683a4905	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/46d2f9b2-90fa-4872-a58c-33bf683a4905/1792337896896.jpg	\N	1	2026-10-18 15:38:38.651389+00
4775b7c9-6d83-4f46-90f2-90525e08b5c1	46d2f9b2-90fa-4872-a58c-33bf683a4905	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/46d2f9b2-90fa-4872-a58c-33bf683a4905/1792337950842.jpg	\N	2	2026-10-18 15:39:28.433528+00
8acd0475-ce90-4e12-a61c-3cbf7ca275bc	3f9e0b77-5cc6-42e1-8d08-99750ce56dcd	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/3f9e0b77-5cc6-42e1-8d08-99750ce56dcd/1792373644566.jpg	\N	0	2026-10-19 01:34:08.913426+00
ba1f3663-fb68-4891-813e-11a698df41be	3f9e0b77-5cc6-42e1-8d08-99750ce56dcd	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/3f9e0b77-5cc6-42e1-8d08-99750ce56dcd/1792373661315.jpg	\N	1	2026-10-19 01:34:24.922054+00
e3ed2ebf-6f00-4b54-a4a1-242428b4c555	3f9e0b77-5cc6-42e1-8d08-99750ce56dcd	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/3f9e0b77-5cc6-42e1-8d08-99750ce56dcd/1792373675614.jpg	\N	2	2026-10-19 01:34:38.860485+00
fecf4697-32bb-450f-90f2-06578429f6e6	01477d99-ee9d-4005-a446-f54584f2c064	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/01477d99-ee9d-4005-a446-f54584f2c064/1792374109672.jpg	\N	0	2026-10-19 01:41:53.188256+00
bfdeee05-829e-4db1-9b04-c0afe68de77d	01477d99-ee9d-4005-a446-f54584f2c064	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/01477d99-ee9d-4005-a446-f54584f2c064/1792374120180.jpg	\N	1	2026-10-19 01:42:02.858067+00
f427a4f8-c407-4983-adc0-f68161699492	01477d99-ee9d-4005-a446-f54584f2c064	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/01477d99-ee9d-4005-a446-f54584f2c064/1792374127246.jpg	\N	2	2026-10-19 01:42:09.832857+00
c8390022-bb9f-45ab-a268-9c8572a76f88	01477d99-ee9d-4005-a446-f54584f2c064	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/01477d99-ee9d-4005-a446-f54584f2c064/1792374135371.jpg	\N	3	2026-10-19 01:42:18.17075+00
ff74fb8d-aa0a-4c7d-bb2c-92171133a59a	01477d99-ee9d-4005-a446-f54584f2c064	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/01477d99-ee9d-4005-a446-f54584f2c064/1792374144424.jpg	\N	4	2026-10-19 01:42:26.607261+00
457a594d-076b-476c-877a-e3359817d0ee	01477d99-ee9d-4005-a446-f54584f2c064	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/01477d99-ee9d-4005-a446-f54584f2c064/1792374151563.jpg	\N	5	2026-10-19 01:42:33.945368+00
436fd97e-9915-42f4-bae9-7ad474e50c57	01477d99-ee9d-4005-a446-f54584f2c064	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/01477d99-ee9d-4005-a446-f54584f2c064/1792374158387.jpg	\N	6	2026-10-19 01:42:40.895633+00
d8017271-8beb-4239-9041-e5db43996b8f	01477d99-ee9d-4005-a446-f54584f2c064	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/01477d99-ee9d-4005-a446-f54584f2c064/1792374167172.jpg	\N	7	2026-10-19 01:42:49.063157+00
26c82eb0-9d94-4afd-989c-2c96b3d4d37c	0c62cc6f-53fe-41e8-b2bf-2df3b9830255	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/0c62cc6f-53fe-41e8-b2bf-2df3b9830255/1792374481188.JPG	\N	0	2026-10-19 01:48:08.085353+00
1bb57a6a-8df2-4225-a313-a209e1237c77	0c62cc6f-53fe-41e8-b2bf-2df3b9830255	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/0c62cc6f-53fe-41e8-b2bf-2df3b9830255/1792374499846.JPG	\N	1	2026-10-19 01:48:23.390992+00
b6b5a97b-7bb3-48d2-a965-5738202d1ee8	0c62cc6f-53fe-41e8-b2bf-2df3b9830255	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/0c62cc6f-53fe-41e8-b2bf-2df3b9830255/1792374511319.JPG	\N	2	2026-10-19 01:48:36.114108+00
c47c31c3-acb7-4250-bd01-5e8ce4bc59a9	0c62cc6f-53fe-41e8-b2bf-2df3b9830255	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/0c62cc6f-53fe-41e8-b2bf-2df3b9830255/1792376899430.JPG	\N	3	2026-10-19 02:28:25.731181+00
0673a7bb-60a7-4e90-bb6f-6f544e05dbd3	0c62cc6f-53fe-41e8-b2bf-2df3b9830255	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/0c62cc6f-53fe-41e8-b2bf-2df3b9830255/1792376948168.JPG	\N	4	2026-10-19 02:29:11.112838+00
d75fd354-08d6-492b-94a5-e604ca676df6	0c62cc6f-53fe-41e8-b2bf-2df3b9830255	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/0c62cc6f-53fe-41e8-b2bf-2df3b9830255/1792376982339.JPG	\N	5	2026-10-19 02:29:45.915958+00
90c0192b-5e9a-4ed0-9a85-5a9773c59de1	93d1b618-501c-4f8a-a7e2-8a2f310bd621	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/93d1b618-501c-4f8a-a7e2-8a2f310bd621/1792377422303.JPG	\N	0	2026-10-19 02:37:08.786135+00
d9ecdf5d-1df2-4f2e-ac31-1e96766bb546	93d1b618-501c-4f8a-a7e2-8a2f310bd621	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/93d1b618-501c-4f8a-a7e2-8a2f310bd621/1792377438256.JPG	\N	1	2026-10-19 02:37:24.2502+00
a9947868-6e10-4090-99e4-8fa64d247bb2	93d1b618-501c-4f8a-a7e2-8a2f310bd621	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/93d1b618-501c-4f8a-a7e2-8a2f310bd621/1792377456531.JPG	\N	2	2026-10-19 02:37:42.150871+00
5e5c6e05-7a99-4adc-9ae9-452ab8e459a5	93d1b618-501c-4f8a-a7e2-8a2f310bd621	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/93d1b618-501c-4f8a-a7e2-8a2f310bd621/1792377473477.JPG	\N	3	2026-10-19 02:37:59.157355+00
451c170b-6839-4209-9e07-d348ff7d56c4	93d1b618-501c-4f8a-a7e2-8a2f310bd621	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/93d1b618-501c-4f8a-a7e2-8a2f310bd621/1792377485764.JPG	\N	4	2026-10-19 02:38:11.380795+00
136fc62a-db21-4ceb-a1ec-c01661f9619f	f6ec3f37-63d0-46f4-bd24-a67b4c6a0a75	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/f6ec3f37-63d0-46f4-bd24-a67b4c6a0a75/1792377622681.JPG	\N	0	2026-10-19 02:40:27.629532+00
2c78ce7d-3e45-461e-8e57-953d9cc3c90d	f6ec3f37-63d0-46f4-bd24-a67b4c6a0a75	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/f6ec3f37-63d0-46f4-bd24-a67b4c6a0a75/1792377639463.JPG	\N	1	2026-10-19 02:40:44.382452+00
d1e89894-58de-40f5-80a7-90425f464c59	f6ec3f37-63d0-46f4-bd24-a67b4c6a0a75	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/f6ec3f37-63d0-46f4-bd24-a67b4c6a0a75/1792377657550.JPG	\N	2	2026-10-19 02:41:03.340695+00
f1dfe3a6-9ec1-4d99-82b0-c8e669494720	f6ec3f37-63d0-46f4-bd24-a67b4c6a0a75	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/f6ec3f37-63d0-46f4-bd24-a67b4c6a0a75/1792377673404.JPG	\N	3	2026-10-19 02:41:18.485587+00
877942a2-ec11-4981-9718-4c0c5aa9846d	4331216f-704f-4305-8e21-dadcdfedfde1	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/4331216f-704f-4305-8e21-dadcdfedfde1/1792377834683.JPG	\N	0	2026-10-19 02:44:00.182442+00
3ddae272-f8cf-46f7-8670-248dc8eb0e69	4331216f-704f-4305-8e21-dadcdfedfde1	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/4331216f-704f-4305-8e21-dadcdfedfde1/1792377849372.JPG	\N	1	2026-10-19 02:44:16.019524+00
f292580a-f622-44df-8563-1fae990638eb	4331216f-704f-4305-8e21-dadcdfedfde1	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/4331216f-704f-4305-8e21-dadcdfedfde1/1792377864220.JPG	\N	2	2026-10-19 02:44:32.293221+00
bf19c12e-449c-420a-8d46-15d93dd37b81	4331216f-704f-4305-8e21-dadcdfedfde1	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/4331216f-704f-4305-8e21-dadcdfedfde1/1792377880213.JPG	\N	3	2026-10-19 02:44:47.343966+00
d1f2f7de-601a-4d65-9552-5e411f27791c	35311c37-9247-4998-82d4-90a5565ef663	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/35311c37-9247-4998-82d4-90a5565ef663/1792378192818.jpg	\N	0	2026-10-19 02:49:58.316813+00
b36a314c-ff48-4b36-a003-24c6459097fc	35311c37-9247-4998-82d4-90a5565ef663	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/35311c37-9247-4998-82d4-90a5565ef663/1792378209294.JPG	\N	1	2026-10-19 02:50:14.276407+00
78dd751d-0fa0-4bf0-8173-f71e3fcee449	35311c37-9247-4998-82d4-90a5565ef663	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/35311c37-9247-4998-82d4-90a5565ef663/1792378269030.JPG	\N	2	2026-10-19 02:51:14.672875+00
ffbf3b71-d8bc-4cb0-bc76-0d5ea9be033f	35311c37-9247-4998-82d4-90a5565ef663	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/35311c37-9247-4998-82d4-90a5565ef663/1792378327710.jpg	\N	3	2026-10-19 02:52:12.572091+00
aa34cdee-18c2-466e-8585-aa73b8a7277f	35311c37-9247-4998-82d4-90a5565ef663	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/35311c37-9247-4998-82d4-90a5565ef663/1792378345046.JPG	\N	4	2026-10-19 02:52:33.967039+00
9af23b58-dae1-4be5-8b20-e66c42844ee0	35311c37-9247-4998-82d4-90a5565ef663	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/35311c37-9247-4998-82d4-90a5565ef663/1792378359130.JPG	\N	5	2026-10-19 02:52:49.835689+00
ee2aa002-4613-4b9a-b153-6a49450c8e54	35311c37-9247-4998-82d4-90a5565ef663	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/35311c37-9247-4998-82d4-90a5565ef663/1792378390200.JPG	\N	6	2026-10-19 02:53:17.594933+00
f8bf510d-da31-4d12-a145-16d65d2f11f3	35311c37-9247-4998-82d4-90a5565ef663	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/35311c37-9247-4998-82d4-90a5565ef663/1792378405329.JPG	\N	7	2026-10-19 02:53:31.457924+00
99e961d2-603f-4334-8cf5-5a4ce648aa69	35311c37-9247-4998-82d4-90a5565ef663	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/35311c37-9247-4998-82d4-90a5565ef663/1792378419031.JPG	\N	8	2026-10-19 02:53:44.628379+00
4e053f12-8537-4987-aa32-494118e9e167	a3b2f43b-521e-43af-84ee-412eba9cc7a2	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/a3b2f43b-521e-43af-84ee-412eba9cc7a2/1792379804320.JPG	\N	0	2026-10-19 03:16:59.39046+00
3b57dc34-8d57-4121-9793-ae0adfb61e8b	a3b2f43b-521e-43af-84ee-412eba9cc7a2	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/a3b2f43b-521e-43af-84ee-412eba9cc7a2/1792379832652.JPG	\N	1	2026-10-19 03:17:24.817002+00
c16fd8fd-3675-4af0-858b-32847e4a8942	a3b2f43b-521e-43af-84ee-412eba9cc7a2	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/a3b2f43b-521e-43af-84ee-412eba9cc7a2/1792379862952.JPG	\N	2	2026-10-19 03:17:59.991052+00
d3444b67-4298-4b05-ac86-a53ba72aa540	a3b2f43b-521e-43af-84ee-412eba9cc7a2	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/a3b2f43b-521e-43af-84ee-412eba9cc7a2/1792379898118.JPG	\N	3	2026-10-19 03:18:28.372653+00
cc7f51a4-8822-4252-835b-64ede1a126c0	a3b2f43b-521e-43af-84ee-412eba9cc7a2	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/a3b2f43b-521e-43af-84ee-412eba9cc7a2/1792379916356.JPG	\N	4	2026-10-19 03:18:43.619724+00
55b6e7d0-5c49-43de-b4a3-18a285dfca94	a3b2f43b-521e-43af-84ee-412eba9cc7a2	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/a3b2f43b-521e-43af-84ee-412eba9cc7a2/1792380030682.JPG	\N	5	2026-10-19 03:20:38.826029+00
6279dc80-a94e-4583-b385-764278c29872	3f9e0b77-5cc6-42e1-8d08-99750ce56dcd	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/3f9e0b77-5cc6-42e1-8d08-99750ce56dcd/1792380578594.JPG	\N	3	2026-10-19 03:30:09.595742+00
db372826-f310-41cb-a03b-57b979b4a8b5	3fde65c3-ef6d-42bf-9a8e-e6d8cfa49d51	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/3fde65c3-ef6d-42bf-9a8e-e6d8cfa49d51/1792380855644.JPG	\N	0	2026-10-19 03:34:29.21624+00
cc9568a0-b2cb-496f-b852-bb58fbdd2201	3fde65c3-ef6d-42bf-9a8e-e6d8cfa49d51	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/3fde65c3-ef6d-42bf-9a8e-e6d8cfa49d51/1792380875389.JPG	\N	1	2026-10-19 03:34:48.106345+00
31cb51b6-e3ef-4670-9891-6771e6957ea0	3fde65c3-ef6d-42bf-9a8e-e6d8cfa49d51	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/3fde65c3-ef6d-42bf-9a8e-e6d8cfa49d51/1792380897507.JPG	\N	2	2026-10-19 03:35:25.942811+00
9d95d385-5676-42c5-ad9d-836034750fa8	3fde65c3-ef6d-42bf-9a8e-e6d8cfa49d51	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/3fde65c3-ef6d-42bf-9a8e-e6d8cfa49d51/1792380939026.JPG	\N	3	2026-10-19 03:35:56.061339+00
c6ce873f-e1f4-444e-98a7-aa64c987e7f5	3fde65c3-ef6d-42bf-9a8e-e6d8cfa49d51	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/3fde65c3-ef6d-42bf-9a8e-e6d8cfa49d51/1792380969817.JPG	\N	4	2026-10-19 03:36:23.829157+00
e53c6188-818c-44e0-b778-ae3075aae20c	3fde65c3-ef6d-42bf-9a8e-e6d8cfa49d51	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/3fde65c3-ef6d-42bf-9a8e-e6d8cfa49d51/1792381002013.JPG	\N	5	2026-10-19 03:36:58.919039+00
d6156974-80cb-43fa-86d2-d79f9ae17d1c	9ea70376-ec69-4280-8c56-8896db085990	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/9ea70376-ec69-4280-8c56-8896db085990/1792381653657.JPG	\N	0	2026-10-19 03:47:50.374013+00
86be5408-815c-4e4d-a1eb-e3a57c466a99	9ea70376-ec69-4280-8c56-8896db085990	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/9ea70376-ec69-4280-8c56-8896db085990/1792381678340.JPG	\N	1	2026-10-19 03:48:11.501805+00
f1a6cad5-596c-4c9a-8f54-ebc5c15da565	9ea70376-ec69-4280-8c56-8896db085990	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/9ea70376-ec69-4280-8c56-8896db085990/1792381703274.JPG	\N	2	2026-10-19 03:48:34.961547+00
94b352e8-37cb-42f1-bb13-762b9c0875c0	9ea70376-ec69-4280-8c56-8896db085990	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/9ea70376-ec69-4280-8c56-8896db085990/1792381731106.JPG	\N	3	2026-10-19 03:49:03.159584+00
1b2d250a-6f88-4dbb-bce7-50c90a8c4d13	9ea70376-ec69-4280-8c56-8896db085990	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/9ea70376-ec69-4280-8c56-8896db085990/1792381752173.JPG	\N	4	2026-10-19 03:49:22.431707+00
c72f7d65-9d26-4381-8730-a350a372fa30	9ea70376-ec69-4280-8c56-8896db085990	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/9ea70376-ec69-4280-8c56-8896db085990/1792381770912.JPG	\N	5	2026-10-19 03:49:42.657536+00
c949ca6f-00f1-4402-86b3-872366ac9712	9ea70376-ec69-4280-8c56-8896db085990	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/9ea70376-ec69-4280-8c56-8896db085990/1792381790791.JPG	\N	6	2026-10-19 03:50:01.919015+00
f9d5ce8a-dc61-4e09-a5d1-78b401f63bbb	9ea70376-ec69-4280-8c56-8896db085990	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/9ea70376-ec69-4280-8c56-8896db085990/1792381813164.JPG	\N	7	2026-10-19 03:50:24.890659+00
d5a03a2d-413d-4f12-82e3-0b31a952787b	9ea70376-ec69-4280-8c56-8896db085990	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/9ea70376-ec69-4280-8c56-8896db085990/1792381833053.JPG	\N	8	2026-10-19 03:50:42.195505+00
\.


--
-- Data for Name: experiences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.experiences (id, title, description, year, sort_order, created_at, updated_at, banner_image_url) FROM stdin;
f6ec3f37-63d0-46f4-bd24-a67b4c6a0a75	TrainIQA & ASEAN-QA Forum	\N	2025	8	2026-10-13 13:06:00.685338+00	2026-10-19 02:59:19.407+00	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/banners/1792378741928.JPG
3fde65c3-ef6d-42bf-9a8e-e6d8cfa49d51	Winter Camp		2024	2	2026-10-19 03:33:39.326465+00	2026-10-19 03:33:39.326465+00	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/banners/1792380796407.JPG
93d1b618-501c-4f8a-a7e2-8a2f310bd621	ACT (SIM x UC)	\N	2025	7	2026-10-13 12:50:42.593789+00	2026-10-19 03:02:04.121+00	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/banners/1792378809334.JPG
9ea70376-ec69-4280-8c56-8896db085990	PRISM 1.0	\N	2025	6	2026-10-19 02:54:23.656754+00	2026-10-19 03:55:38.022+00	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/banners/1792381854329.JPG
01477d99-ee9d-4005-a446-f54584f2c064	INHA Winter Camp	\N	2024	3	2026-10-13 12:47:58.840992+00	2026-10-19 03:03:43.896+00	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/banners/1792379018389.jpg
a3b2f43b-521e-43af-84ee-412eba9cc7a2	SAIL (Ngee An x UC)	\N	2025	4	2026-10-13 12:49:48.338003+00	2026-10-19 03:21:07.665+00	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/banners/1792380059968.JPG
35311c37-9247-4998-82d4-90a5565ef663	Java Impact Journey	\N	2026	10	2026-10-13 12:53:00.813045+00	2026-10-19 02:56:02.213+00	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/banners/1792378556230.jpg
0c62cc6f-53fe-41e8-b2bf-2df3b9830255	Mural Painting (UTM x UC)	\N	2025	5	2026-10-13 12:53:42.569977+00	2026-10-19 02:59:52.463+00	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/banners/1792378775878.JPG
3f9e0b77-5cc6-42e1-8d08-99750ce56dcd	SUSS Winter Camp	\N	2023	1	2026-10-13 12:58:25.87514+00	2026-10-19 03:38:31.928+00	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/banners/1792381104890.jpg
46d2f9b2-90fa-4872-a58c-33bf683a4905	French Embassy	\N	2023	0	2026-10-13 13:03:02.162438+00	2026-10-19 03:04:28.059+00	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/banners/1792379057925.jpg
1a0bf535-bd74-4318-a0a4-8596e079e9c9	PRISM 2.0		2026	11	2026-10-19 03:55:58.097649+00	2026-10-19 03:55:58.097649+00	\N
4331216f-704f-4305-8e21-dadcdfedfde1	Herbventures (UC x ITS)	\N	2025	9	2026-10-13 12:51:47.475123+00	2026-10-19 02:58:42.385+00	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/experience-photos/banners/1792378663262.JPG
\.


--
-- Data for Name: form_fields; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.form_fields (id, event_id, field_type, label, help_text, placeholder, required, options, sort_order, created_at, updated_at) FROM stdin;
8cda4008-d301-4786-b2a7-c2a30263569c	305b1b91-2b74-469b-b1c3-de881c26ce30	section_header	Biodata	Please fill in your personal information below to complete your registration for WISE 2026.	\N	f	\N	0	2026-10-18 15:20:19.466119+00	2026-10-18 15:20:19.466119+00
6eabe71d-c2d1-4d1f-9066-055e3fd2a462	305b1b91-2b74-469b-b1c3-de881c26ce30	short_text	Full Name (Leader/Individual)	\N	\N	t	\N	1	2026-10-18 15:20:19.466119+00	2026-10-18 15:20:19.466119+00
24adc3ef-659b-4adf-8652-17fd26d0677f	305b1b91-2b74-469b-b1c3-de881c26ce30	short_text	WhatsApp Number (Leader/Individual)	\N	\N	t	\N	2	2026-10-18 15:20:19.466119+00	2026-10-18 15:20:19.466119+00
5b509325-fca6-459b-b98d-3bf92c911bfd	305b1b91-2b74-469b-b1c3-de881c26ce30	short_text	University/Institution	\N	\N	t	\N	3	2026-10-18 15:20:19.466119+00	2026-10-18 15:20:19.466119+00
843b7c2f-3209-44d4-afb6-604110a81cb7	305b1b91-2b74-469b-b1c3-de881c26ce30	short_text	Full Name (Member 2)	\N	\N	f	\N	4	2026-10-18 15:20:19.466119+00	2026-10-18 15:20:19.466119+00
0700a4c7-2e6e-43c5-bc40-578b09b77d99	305b1b91-2b74-469b-b1c3-de881c26ce30	short_text	Full Name (Member 3)	\N	\N	f	\N	5	2026-10-18 15:20:19.466119+00	2026-10-18 15:20:19.466119+00
090d135b-62f5-4469-a1a3-c7de34f426a9	305b1b91-2b74-469b-b1c3-de881c26ce30	short_text	Team Name	\N	\N	f	\N	6	2026-10-18 15:20:19.466119+00	2026-10-18 15:20:19.466119+00
904f7a57-7979-4d66-b421-cc0b266bf46a	305b1b91-2b74-469b-b1c3-de881c26ce30	section_header	File Uploads	Please upload the required documents below for registration verification. Ensure all files are clear and legible.	\N	f	\N	7	2026-10-18 15:20:19.466119+00	2026-10-18 15:20:19.466119+00
6be64abe-508a-4917-853f-1932e8d4df47	305b1b91-2b74-469b-b1c3-de881c26ce30	file_upload	Student/ID Card 	Merge into 1 PDF (if team)	\N	t	\N	8	2026-10-18 15:20:19.466119+00	2026-10-18 15:20:19.466119+00
6bec0acb-377f-4941-ace1-553d9afe730c	305b1b91-2b74-469b-b1c3-de881c26ce30	file_upload	Proof of Following @wise_ucic	Merge into 1 PDF (if team)	\N	t	\N	9	2026-10-18 15:20:19.466119+00	2026-10-18 15:20:19.466119+00
1d02b302-e994-4b0e-ba1e-8a819aacff4e	305b1b91-2b74-469b-b1c3-de881c26ce30	file_upload	Proof of Following @uc_internationalcommunity	Merge into 1 PDF (if team)	\N	t	\N	10	2026-10-18 15:20:19.466119+00	2026-10-18 15:20:19.466119+00
04cc21ac-9681-4bd5-b281-9e203d50b151	305b1b91-2b74-469b-b1c3-de881c26ce30	section_header	Payment	Please complete the payment according to the selected registration fee and upload your proof of transaction.	\N	f	\N	11	2026-10-18 15:20:19.466119+00	2026-10-18 15:20:19.466119+00
705f9cb5-a4b4-4266-b909-58b5b5d3b939	305b1b91-2b74-469b-b1c3-de881c26ce30	text_block	🇮🇩 Indonesian Participants: IDR 50.000/team\n🌏 International Participants: USD 5/team\n\nTransfer Details\n👤 Name: Muhammad Yusuf Fadhlurrohman\n💳 Bank Central Asia (BCA): 7935636124\n📲 Paypal: <a href="https://www.paypal.me/YusufFadhlurrohman" target="_blank" rel="noopener noreferrer">YusufFadhlurrohman</a>\n\nPlease state in the transfer note ⬇️\nWISE2026_[Team/Individual Name]	\N	\N	f	\N	12	2026-10-18 15:20:19.466119+00	2026-10-18 15:20:19.466119+00
c90da695-8e8d-4a67-9bf6-abaff352087e	305b1b91-2b74-469b-b1c3-de881c26ce30	file_upload	Proof of Payment	\N	\N	t	\N	13	2026-10-18 15:20:19.466119+00	2026-10-18 15:20:19.466119+00
\.


--
-- Data for Name: hero_carousel_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hero_carousel_items (id, media_url, media_type, sort_order, created_at) FROM stdin;
\.


--
-- Data for Name: news_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.news_items (id, title, embed_url, thumbnail_url, sort_order, created_at, updated_at) FROM stdin;
b00d6c63-ce98-478b-90ec-ef11752141d7	Universitas Ciputra x French Embassy	https://youtu.be/NW-08jnEWec?si=5Bu99xeJzpLRv_S4	\N	1	2026-10-18 10:24:14.146801+00	2026-10-18 10:24:14.146801+00
3fe458e5-a5d9-4950-9cd8-f825d660c190	Surabaya City Tour with Friends from Timor Leste, Malaysia, and Italy	https://www.instagram.com/reel/DeGUJP-u8lt/?utm_source=ig_web_copy_link&vrfl=MzRlODBiNWFlZA==&srtk=MzRlODBiNWFlZA==	\N	0	2026-10-18 10:17:22.607022+00	2026-10-18 10:34:56.943+00
\.


--
-- Data for Name: registrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.registrations (id, event_id, answers, submitted_email, created_at, user_id) FROM stdin;
2aa64744-7abc-4148-b255-f70f75f13164	305b1b91-2b74-469b-b1c3-de881c26ce30	{"090d135b-62f5-4469-a1a3-c7de34f426a9": "rawr", "1d02b302-e994-4b0e-ba1e-8a819aacff4e": "registrations/305b1b91-2b74-469b-b1c3-de881c26ce30/1d02b302-e994-4b0e-ba1e-8a819aacff4e/1792329635961.jpeg", "24adc3ef-659b-4adf-8652-17fd26d0677f": "085864650996", "5b509325-fca6-459b-b98d-3bf92c911bfd": "Universitas Ciputra Surabaya", "6be64abe-508a-4917-853f-1932e8d4df47": "registrations/305b1b91-2b74-469b-b1c3-de881c26ce30/6be64abe-508a-4917-853f-1932e8d4df47/1792329633224.pdf", "6bec0acb-377f-4941-ace1-553d9afe730c": "registrations/305b1b91-2b74-469b-b1c3-de881c26ce30/6bec0acb-377f-4941-ace1-553d9afe730c/1792329634125.png", "6eabe71d-c2d1-4d1f-9066-055e3fd2a462": "Christabella Aurellia Irawan", "843b7c2f-3209-44d4-afb6-604110a81cb7": "Keisha Madelyn Tjiang", "c90da695-8e8d-4a67-9bf6-abaff352087e": "registrations/305b1b91-2b74-469b-b1c3-de881c26ce30/c90da695-8e8d-4a67-9bf6-abaff352087e/1792329636272.png"}	\N	2026-10-18 13:20:41.113357+00	5c52b9fb-91fa-4f76-8d23-40140a1e7a53
\.


--
-- Data for Name: site_content; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_content (id, key, value, value_json, content_type, label, updated_at) FROM stdin;
63038830-180c-4ca1-b257-86b116ed3eae	team_section_title	Meet the Team	\N	text	Team Section Title	2026-10-02 03:12:10.978181+00
02faa096-9e70-480b-87cd-3510f58a2ff6	nav_home	Home	\N	text	Nav: Home	2026-10-02 03:12:10.978181+00
ab5a3cbe-da8b-4a44-903c-11f21e8a7e78	nav_about	About Us	\N	text	Nav: About	2026-10-02 03:12:10.978181+00
bea42ed2-ecd8-4930-aa37-07326dc09477	nav_events	Events	\N	text	Nav: Events	2026-10-02 03:12:10.978181+00
5bef1caa-b808-4c8a-89ed-6b378711f698	nav_contact	Contact	\N	text	Nav: Contact	2026-10-02 03:12:10.978181+00
d9e6a7f7-5d3e-4b38-9e98-de0b41aafbbd	stats_section_title	By the Numbers	\N	text	Stats Section Title	2026-10-02 03:12:10.978181+00
4b61acd6-53b1-466c-b15f-48fa54f2d728	about_image_url	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/site-images/content/about_image_url-1792125394799.png	\N	text	About Hero Image URL	2026-10-16 04:36:39.879+00
f6b58d04-17db-408a-be90-bf8a49727efc	register_button_label	Register Now	\N	text	Register Button Label	2026-10-13 13:54:23.589+00
7c74e2f7-73b1-450d-808d-1adee751ac44	events_upcoming_label	Upcoming	\N	text	Upcoming Events Label	2026-10-13 13:54:23.588+00
030e7862-e9e7-41ee-a224-22105a063fcf	events_section_title	Events	\N	text	Events Section Title	2026-10-13 13:54:23.588+00
e6858804-af58-4934-9cc7-25d1a813ba1d	news_section_title	News & Updates	\N	text	News Section Title	2026-10-14 07:25:31.408083+00
a6b48875-33c0-4f65-abed-39b6b9a1bc6b	news_carousel_per_view	3	\N	text	News Carousel Cards Per View	2026-10-14 07:25:31.408083+00
e4ef2f07-fc31-4d24-b6a6-63e75976b1a7	hero_subheadline	UCIC brings cultures and people together through international experiences, opening up a world of possibilities for students.	\N	text	Hero Sub-headline	2026-10-16 03:44:26.571+00
84a38a22-5d96-419b-8c4b-ca03aa92f72c	hero_headline	Connecting Students Across the Globe	\N	text	Hero Headline	2026-10-16 03:44:26.571+00
5b337345-b843-4754-96b3-1f6031bf576f	hero_card_subtitle	Open to all UC students	\N	text	Hero Floating Card Subtitle	2026-10-16 03:44:26.571+00
9ea72443-ba28-4ea2-998b-52dd9ed21335	hero_card_title	Participate in Our Events	\N	text	Hero Floating Card Title	2026-10-16 03:44:26.571+00
085a06c8-b841-4aa8-8dde-80621191dfab	hero_cta_label	Browse Events	\N	text	Hero CTA Button Label	2026-10-16 03:44:26.571+00
f8f0bced-9f1f-454b-884b-fb0e1e671357	hero_image_url	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/site-images/content/hero_image_url-1792122257558.jpg	\N	text	Hero Background Image URL	2026-10-16 03:44:26.571+00
fac706ba-ab2e-43c5-bfa5-69238df23c14	about_title	About Us	\N	text	About Page Title	2026-10-16 04:36:39.879+00
834c498b-e953-4278-b32b-ededcfa44900	about_vision_title	Our Vision	\N	text	Vision Section Title	2026-10-16 04:36:39.879+00
476e618d-5aeb-49c9-bf98-b139935faa21	about_mission	To foster meaningful connections between local and international students, celebrate cultural diversity through engaging experiences, cultivate an open and inclusive community, and empower students to embrace new perspectives, explore global opportunities, and grow as active global citizens.	\N	text	Mission Statement	2026-10-16 04:36:39.879+00
6f5b5eeb-07bb-4a94-9ff8-ed098285d064	about_vision	To become a leading international student community in Southeast Asia, fostering a vibrant global culture where diverse perspectives connect, possibilities expand, and cross-cultural experiences inspire growth.	\N	text	Vision Statement	2026-10-16 04:36:39.88+00
aab14e7f-e436-418b-a2c5-4450df89f0d2	about_mission_title	Our Mission	\N	text	Mission Section Title	2026-10-16 04:36:39.879+00
7d5470f6-4724-4a06-b623-bb06541b2f64	about_intro	UC International Community (UCIC) is a vibrant student-led organization at Universitas Ciputra Surabaya that connects students with the world through exciting experiences and cross-cultural connections, where we bring international perspectives to campus and inspire students to explore beyond borders.	\N	text	About Intro	2026-10-16 04:36:39.879+00
55d1b094-b7cd-4941-8640-45fd64f85c45	contact_instagram	@uc_internationalcommunity	\N	text	Instagram Handle	2026-10-13 12:08:14.166+00
d9e430e2-be73-4323-b433-ae1dbe3fd322	footer_description	Let's Go Global with UCIC 🌎	\N	text	Footer Description	2026-10-13 12:08:14.166+00
e1fef86e-78c7-4738-97c7-1016c23d8362	contact_line		\N	text	LINE ID	2026-10-13 12:08:14.166+00
6b524b96-32ca-4686-b22a-cc24e6155a8b	scrolling_strip_text	UCIC · Connecting Students · Events · Community · International · Universitas Ciputra ·	\N	text	Scrolling Strip Text	2026-10-13 12:08:14.166+00
8551d0e4-6a80-4e42-921f-e93fccc444b6	footer_tagline	Universitas Ciputra International Community	\N	text	Footer Tagline	2026-10-13 12:08:14.166+00
86b50625-7660-49d5-8155-1674c6b61f31	contact_email	ucic@ciputra.ac.id	\N	text	Contact Email	2026-10-13 12:08:14.166+00
8ef89443-fa40-4304-b158-665f86532974	latest_activity_title	Latest Activity	\N	text	Home: Latest Activity Title	2026-10-13 13:54:23.589+00
ddacd473-8cec-4fa6-bffe-f5f88648934c	register_full_label	Event Full	\N	text	Full Event Label	2026-10-13 13:54:23.589+00
b84225a9-3067-40b9-b42b-bf6702cb02d8	events_past_label	Past Events	\N	text	Past Events Label	2026-10-13 13:54:23.589+00
57740c6a-aaea-42d5-ba6e-5b13d62ec0f8	register_closed_label	Registration Closed	\N	text	Closed Registration Label	2026-10-13 13:54:23.589+00
\.


--
-- Data for Name: site_stats; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_stats (id, label, value, icon, sort_order, created_at, updated_at) FROM stdin;
1afc3d09-ea92-4b1c-8721-cae31826080e	Hosted Countries	10+	\N	1	2026-10-02 03:12:10.978181+00	2026-10-13 11:18:44.007+00
865a2ff2-79d8-4b35-9251-af5e2bfe0787	University Partners	35+	\N	0	2026-10-02 03:12:10.978181+00	2026-10-13 12:38:21.704+00
81484c1e-b225-4049-a1ab-e85d38030701	Years Active	5+	\N	3	2026-10-02 03:12:10.978181+00	2026-10-13 11:17:07.75+00
7d1c4c82-933c-48dd-82b7-88f3275f4bff	Events per Year	10+	\N	2	2026-10-02 03:12:10.978181+00	2026-10-13 11:17:38.086+00
\.


--
-- Data for Name: submission_fields; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.submission_fields (id, event_id, field_type, label, help_text, placeholder, required, allowed_file_types, max_file_size_mb, sort_order, created_at, updated_at, form_id, options) FROM stdin;
a5d3a3f2-0e7f-4fae-be0e-54e8e71850ea	305b1b91-2b74-469b-b1c3-de881c26ce30	short_text	Full Name (Individual) / Team Name	\N	\N	t	\N	50	0	2026-10-13 10:32:38.026249+00	2026-10-13 10:32:38.026249+00	\N	\N
c15fc34a-4298-45f7-aa4a-41af1794bd5a	305b1b91-2b74-469b-b1c3-de881c26ce30	short_text	Short Description of Work	\N	\N	t	\N	50	1	2026-10-13 10:32:38.026249+00	2026-10-13 10:32:38.026249+00	\N	\N
7055b27b-2edb-4c3e-bf66-98fd4d8a1f78	305b1b91-2b74-469b-b1c3-de881c26ce30	file_upload	Declaration of Originality	Template: https://bit.ly/WISE2026Originality	\N	t	{pdf}	50	2	2026-10-13 10:32:38.026249+00	2026-10-13 10:32:38.026249+00	\N	\N
e05df3b6-61d3-44d8-a52b-442565d1b47a	305b1b91-2b74-469b-b1c3-de881c26ce30	file_upload	Essay Upload	\N	\N	t	{pdf}	50	3	2026-10-13 10:32:38.026249+00	2026-10-13 10:32:38.026249+00	\N	\N
\.


--
-- Data for Name: submission_forms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.submission_forms (id, event_id, title, description, deadline, is_open, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.submissions (id, form_id, user_id, answers, submitted_at) FROM stdin;
\.


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.team_members (id, name, role, bio, photo_url, sort_order, created_at, updated_at) FROM stdin;
63cb8fe5-83b6-4f78-8e96-926b0ea75cbe	James Iskandar	HOD • Assistant Secretary			3	2026-10-13 11:19:51.180353+00	2026-10-13 12:26:56.901+00
5d107ef4-034f-4add-a138-b0ea715452e1	Thalita	HOD • Vice President	\N	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/team-photos/members/team-1791894813534.jpg	1	2026-10-13 11:19:19.41467+00	2026-10-13 12:33:37.046+00
38342776-8d72-433d-b4a0-f3f7c8418454	Chen Aileen Wahyudi	HOD • Secretary	\N	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/team-photos/members/team-1791894842751.jpg	2	2026-10-13 11:19:30.639015+00	2026-10-13 12:34:04.547+00
91b161dc-91bd-451f-bf70-007e7e5a9652	Muhammad Yusuf Fadhlurrohman	HOD • Treasurer	\N	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/team-photos/members/team-1791894866887.jpg	4	2026-10-13 11:20:02.982321+00	2026-10-13 12:34:28.711+00
f5de4dff-b63e-4696-9b0c-d48cfac92448	Jessie Chriscellyn Tanuhardja	HOD • President	\N	https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/team-photos/members/team-1791894895995.jpg	0	2026-10-13 11:19:08.216318+00	2026-10-13 12:34:57.534+00
\.


--
-- Data for Name: timeline_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.timeline_items (id, year, title, description, sort_order, created_at, updated_at, image_urls) FROM stdin;
e5176262-f804-4c1b-adac-ae549fcbc600	2021	Where It All Began	Founded in 2021, the Universitas Ciputra International Committee emerged from a simple idea: to create a home away from home for international students while enriching the cultural landscape of our university.	0	2026-10-13 08:27:44.87641+00	2026-10-19 06:38:45.384+00	[]
4fb7abb5-8df5-473e-99fe-cbf9b7a8c9ef	2022	Building Our Foundation	With 13 members, 2022 marked an important chapter in UCIC's journey as the community began developing its presence and strengthening its foundation. Each member brought unique experiences, perspectives, and aspirations, contributing to the shared vision of creating a more culturally connected university environment.	1	2026-10-19 06:02:28.538126+00	2026-10-19 06:38:55.415+00	["https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/site-images/timeline/1792388435503.JPG"]
fb748a5f-efc7-4b15-b423-a8db40899fb5	2025	Strengthening Our Community	In 2025, UCIC reached 24 members and marked a significant milestone in its organizational journey. During the second semester, UCIC advanced from a Club to a Unit Kegiatan Mahasiswa (UKM) at Universitas Ciputra, representing an important step forward in its development and recognition within the university.	4	2026-10-19 06:37:02.739356+00	2026-10-19 07:13:04.561+00	["https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/site-images/timeline/1792393750277.jpeg", "https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/site-images/timeline/1792393760677.jpg", "https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/site-images/timeline/1792393784968.jpg", "https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/site-images/timeline/1792393794501.jpg", "https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/site-images/timeline/1792393809300.jpg", "https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/site-images/timeline/1792393827805.jpg", "https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/site-images/timeline/1792393841860.jpg", "https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/site-images/timeline/1792393849019.jpg", "https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/site-images/timeline/1792393977450.jpg"]
8b251afd-ad0f-485f-bd7b-8a23919fbe41	2023	Growing Together	In 2023, UCIC grew to 18 members, reflecting the community's continued development and its growing capacity to bring students together. With more individuals becoming part of the organization, UCIC had an opportunity to welcome new perspectives and strengthen the connections that formed the heart of its community.	2	2026-10-19 05:32:27.433964+00	2026-10-19 06:39:05.724+00	["https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/site-images/timeline/1792387935922.jpg"]
ade3bf25-743c-4fc1-a72d-5a0d636205a1	2026	Looking Beyond Borders	In 2026, UCIC reached 30 members and entered a new phase of its organizational development, fully establishing itself as a Unit Kegiatan Mahasiswa (UKM) at Universitas Ciputra. With its status as a UKM fully established, UCIC continues to develop its community and create opportunities for students to engage with international perspectives, explore cultural diversity, and build meaningful connections.	5	2026-10-19 06:38:22.569582+00	2026-10-19 06:39:43.148+00	[]
c7215c43-3bf3-4be1-a58d-167037984eba	2024	Expanding Horizons	By 2024, UCIC had grown to 23 members, continuing its upward trajectory and welcoming an increasingly diverse community of students. With each addition, the organization gained new perspectives and opportunities to strengthen its commitment to cultural exchange and international engagement.	2	2026-10-19 05:33:57.320997+00	2026-10-19 06:50:31.831+00	["https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/site-images/timeline/1792388028916.JPG", "https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/site-images/timeline/1792392580602.jpg", "https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/site-images/timeline/1792392588494.jpg", "https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/site-images/timeline/1792392596602.jpg", "https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/site-images/timeline/1792392601415.jpg", "https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/site-images/timeline/1792392608870.jpg", "https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/site-images/timeline/1792392615019.jpg", "https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/site-images/timeline/1792392619645.jpg", "https://jvcvbgcaltqhtabxahdg.supabase.co/storage/v1/object/public/site-images/timeline/1792392627127.jpg"]
\.


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_profiles (id, full_name, student_id, created_at) FROM stdin;
d8aabf73-9488-4f21-9a7e-74c59d27378e	cage	\N	2026-10-09 18:36:47.757086+00
\.


--
-- Name: event_submissions event_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_submissions
    ADD CONSTRAINT event_submissions_pkey PRIMARY KEY (id);


--
-- Name: event_submissions event_submissions_registration_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_submissions
    ADD CONSTRAINT event_submissions_registration_id_key UNIQUE (registration_id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: events events_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_slug_key UNIQUE (slug);


--
-- Name: experience_album_items experience_album_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experience_album_items
    ADD CONSTRAINT experience_album_items_pkey PRIMARY KEY (id);


--
-- Name: experiences experiences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experiences
    ADD CONSTRAINT experiences_pkey PRIMARY KEY (id);


--
-- Name: form_fields form_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_fields
    ADD CONSTRAINT form_fields_pkey PRIMARY KEY (id);


--
-- Name: hero_carousel_items hero_carousel_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hero_carousel_items
    ADD CONSTRAINT hero_carousel_items_pkey PRIMARY KEY (id);


--
-- Name: news_items news_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_items
    ADD CONSTRAINT news_items_pkey PRIMARY KEY (id);


--
-- Name: registrations registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_pkey PRIMARY KEY (id);


--
-- Name: site_content site_content_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_content
    ADD CONSTRAINT site_content_key_key UNIQUE (key);


--
-- Name: site_content site_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_content
    ADD CONSTRAINT site_content_pkey PRIMARY KEY (id);


--
-- Name: site_stats site_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_stats
    ADD CONSTRAINT site_stats_pkey PRIMARY KEY (id);


--
-- Name: submission_fields submission_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submission_fields
    ADD CONSTRAINT submission_fields_pkey PRIMARY KEY (id);


--
-- Name: submission_forms submission_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submission_forms
    ADD CONSTRAINT submission_forms_pkey PRIMARY KEY (id);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- Name: timeline_items timeline_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timeline_items
    ADD CONSTRAINT timeline_items_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: idx_events_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_published ON public.events USING btree (is_published);


--
-- Name: idx_events_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_slug ON public.events USING btree (slug);


--
-- Name: idx_exp_album_exp_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exp_album_exp_id ON public.experience_album_items USING btree (experience_id);


--
-- Name: idx_form_fields_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_form_fields_event_id ON public.form_fields USING btree (event_id);


--
-- Name: idx_registrations_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_registrations_email ON public.registrations USING btree (submitted_email);


--
-- Name: idx_registrations_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_registrations_event_id ON public.registrations USING btree (event_id);


--
-- Name: idx_submission_fields_form_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_submission_fields_form_id ON public.submission_fields USING btree (form_id);


--
-- Name: idx_submission_forms_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_submission_forms_event_id ON public.submission_forms USING btree (event_id);


--
-- Name: idx_submissions_form_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_submissions_form_id ON public.submissions USING btree (form_id);


--
-- Name: idx_submissions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_submissions_user_id ON public.submissions USING btree (user_id);


--
-- Name: event_submissions event_submissions_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_submissions
    ADD CONSTRAINT event_submissions_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_submissions event_submissions_registration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_submissions
    ADD CONSTRAINT event_submissions_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES public.registrations(id) ON DELETE CASCADE;


--
-- Name: event_submissions event_submissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_submissions
    ADD CONSTRAINT event_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: experience_album_items experience_album_items_experience_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experience_album_items
    ADD CONSTRAINT experience_album_items_experience_id_fkey FOREIGN KEY (experience_id) REFERENCES public.experiences(id) ON DELETE CASCADE;


--
-- Name: form_fields form_fields_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_fields
    ADD CONSTRAINT form_fields_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: registrations registrations_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: registrations registrations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: submission_fields submission_fields_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submission_fields
    ADD CONSTRAINT submission_fields_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: submission_fields submission_fields_form_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submission_fields
    ADD CONSTRAINT submission_fields_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.submission_forms(id) ON DELETE CASCADE;


--
-- Name: submission_forms submission_forms_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submission_forms
    ADD CONSTRAINT submission_forms_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: submissions submissions_form_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.submission_forms(id) ON DELETE CASCADE;


--
-- Name: submissions submissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: user_profiles user_profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: event_submissions admin can delete all submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin can delete all submissions" ON public.event_submissions FOR DELETE USING ((auth.uid() IS NOT NULL));


--
-- Name: events admin can manage events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin can manage events" ON public.events USING ((auth.uid() IS NOT NULL));


--
-- Name: experience_album_items admin can manage experience_album_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin can manage experience_album_items" ON public.experience_album_items USING ((auth.uid() IS NOT NULL));


--
-- Name: experiences admin can manage experiences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin can manage experiences" ON public.experiences USING ((auth.uid() IS NOT NULL));


--
-- Name: form_fields admin can manage form_fields; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin can manage form_fields" ON public.form_fields USING ((auth.uid() IS NOT NULL));


--
-- Name: hero_carousel_items admin can manage hero_carousel_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin can manage hero_carousel_items" ON public.hero_carousel_items USING ((auth.uid() IS NOT NULL));


--
-- Name: news_items admin can manage news_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin can manage news_items" ON public.news_items USING ((auth.uid() IS NOT NULL));


--
-- Name: registrations admin can manage registrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin can manage registrations" ON public.registrations USING ((auth.uid() IS NOT NULL));


--
-- Name: site_content admin can manage site_content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin can manage site_content" ON public.site_content USING ((auth.uid() IS NOT NULL));


--
-- Name: site_stats admin can manage site_stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin can manage site_stats" ON public.site_stats USING ((auth.uid() IS NOT NULL));


--
-- Name: submission_fields admin can manage submission_fields; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin can manage submission_fields" ON public.submission_fields USING ((auth.uid() IS NOT NULL));


--
-- Name: submission_forms admin can manage submission_forms; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin can manage submission_forms" ON public.submission_forms USING ((auth.uid() IS NOT NULL));


--
-- Name: submissions admin can manage submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin can manage submissions" ON public.submissions USING ((auth.uid() IS NOT NULL));


--
-- Name: team_members admin can manage team_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin can manage team_members" ON public.team_members USING ((auth.uid() IS NOT NULL));


--
-- Name: timeline_items admin can manage timeline_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin can manage timeline_items" ON public.timeline_items USING ((auth.uid() IS NOT NULL));


--
-- Name: user_profiles admin can manage user_profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin can manage user_profiles" ON public.user_profiles USING ((auth.uid() IS NOT NULL));


--
-- Name: event_submissions admin can read all submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin can read all submissions" ON public.event_submissions FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: event_submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.event_submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: experience_album_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.experience_album_items ENABLE ROW LEVEL SECURITY;

--
-- Name: experiences; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

--
-- Name: form_fields; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;

--
-- Name: hero_carousel_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.hero_carousel_items ENABLE ROW LEVEL SECURITY;

--
-- Name: news_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.news_items ENABLE ROW LEVEL SECURITY;

--
-- Name: registrations public can insert registrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public can insert registrations" ON public.registrations FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.events e
  WHERE ((e.id = registrations.event_id) AND (e.is_published = true) AND (e.registration_mode = 'internal'::text)))));


--
-- Name: experience_album_items public can read experience_album_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public can read experience_album_items" ON public.experience_album_items FOR SELECT USING (true);


--
-- Name: experiences public can read experiences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public can read experiences" ON public.experiences FOR SELECT USING (true);


--
-- Name: form_fields public can read form_fields for published events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public can read form_fields for published events" ON public.form_fields FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.events e
  WHERE ((e.id = form_fields.event_id) AND (e.is_published = true)))));


--
-- Name: hero_carousel_items public can read hero_carousel_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public can read hero_carousel_items" ON public.hero_carousel_items FOR SELECT USING (true);


--
-- Name: news_items public can read news_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public can read news_items" ON public.news_items FOR SELECT USING (true);


--
-- Name: events public can read published events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public can read published events" ON public.events FOR SELECT USING ((is_published = true));


--
-- Name: site_content public can read site_content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public can read site_content" ON public.site_content FOR SELECT USING (true);


--
-- Name: site_stats public can read site_stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public can read site_stats" ON public.site_stats FOR SELECT USING (true);


--
-- Name: submission_fields public can read submission_fields; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public can read submission_fields" ON public.submission_fields FOR SELECT USING (true);


--
-- Name: submission_forms public can read submission_forms; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public can read submission_forms" ON public.submission_forms FOR SELECT USING (true);


--
-- Name: team_members public can read team_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public can read team_members" ON public.team_members FOR SELECT USING (true);


--
-- Name: timeline_items public can read timeline_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public can read timeline_items" ON public.timeline_items FOR SELECT USING (true);


--
-- Name: registrations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

--
-- Name: site_content; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

--
-- Name: site_stats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;

--
-- Name: submission_fields; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.submission_fields ENABLE ROW LEVEL SECURITY;

--
-- Name: submission_forms; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.submission_forms ENABLE ROW LEVEL SECURITY;

--
-- Name: submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: team_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

--
-- Name: timeline_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.timeline_items ENABLE ROW LEVEL SECURITY;

--
-- Name: user_profiles user can manage own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "user can manage own profile" ON public.user_profiles USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));


--
-- Name: event_submissions user can manage own submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "user can manage own submissions" ON public.event_submissions USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: registrations user can read own registrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "user can read own registrations" ON public.registrations FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: submissions users can insert submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users can insert submissions" ON public.submissions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_profiles users can read own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users can read own profile" ON public.user_profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: submissions users can read own submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users can read own submissions" ON public.submissions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_profiles users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users can update own profile" ON public.user_profiles FOR UPDATE USING ((auth.uid() = id));


--
-- PostgreSQL database dump complete
--

\unrestrict 08fuCqoJPhUtfn6laAOilSfXWM1yYRn6NdUo6t4nRY0bF803HLy4uoHJTNSwwGs

