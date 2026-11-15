-- RISE MED schema. Run in the Supabase SQL editor after the project exists.
-- Auth users come from Supabase Auth. Profiles hang off auth.users.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role text check (role in ('youth', 'investor')),
  town text,
  languages text[] default '{}',
  stage text,
  goal text,
  project_name text,
  project_about text,
  offers_help text[] default '{}',
  focus text,
  before_meeting text,
  cv_path text,
  onboarded boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  place text,
  year text,
  created_at timestamptz default now()
);

create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  blurb text,
  place text,
  created_at timestamptz default now()
);

create table if not exists public.memberships (
  user_id uuid not null references public.profiles (id) on delete cascade,
  community_id uuid not null references public.communities (id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, community_id)
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  language text,
  level text,
  created_at timestamptz default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  position int not null,
  title text not null,
  body text
);

create table if not exists public.lesson_opens (
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  opened_at timestamptz default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('community', 'share', 'forum', 'reply')),
  community_id uuid references public.communities (id) on delete cascade,
  thread_id uuid,
  parent_id uuid references public.posts (id) on delete cascade,
  title text,
  body text not null,
  created_at timestamptz default now()
);

create table if not exists public.post_marks (
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

create table if not exists public.funding_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  project_name text not null,
  purpose text not null,
  amount_tnd numeric,
  if_not text,
  created_at timestamptz default now()
);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  detail text not null,
  who_for text,
  until_when text,
  created_at timestamptz default now()
);

create table if not exists public.offer_interest (
  user_id uuid not null references public.profiles (id) on delete cascade,
  offer_id uuid not null references public.offers (id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, offer_id)
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  place text,
  when_text text,
  detail text,
  created_at timestamptz default now()
);

create table if not exists public.rsvps (
  user_id uuid not null references public.profiles (id) on delete cascade,
  session_id uuid not null references public.sessions (id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, session_id)
);

alter table public.profiles enable row level security;
alter table public.experiences enable row level security;
alter table public.communities enable row level security;
alter table public.memberships enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_opens enable row level security;
alter table public.posts enable row level security;
alter table public.post_marks enable row level security;
alter table public.funding_applications enable row level security;
alter table public.offers enable row level security;
alter table public.offer_interest enable row level security;
alter table public.sessions enable row level security;
alter table public.rsvps enable row level security;

create policy "profiles read signed in" on public.profiles for select to authenticated using (true);
create policy "profiles write own" on public.profiles for all to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "experiences read signed in" on public.experiences for select to authenticated using (true);
create policy "experiences write own" on public.experiences for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "communities read" on public.communities for select to authenticated using (true);
create policy "courses read" on public.courses for select to authenticated using (true);
create policy "lessons read" on public.lessons for select to authenticated using (true);
create policy "sessions read" on public.sessions for select to authenticated using (true);

create policy "memberships read" on public.memberships for select to authenticated using (true);
create policy "memberships write own" on public.memberships for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "lesson opens own" on public.lesson_opens for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "posts read" on public.posts for select to authenticated using (true);
create policy "posts write own" on public.posts for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "marks own" on public.post_marks for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "applications read" on public.funding_applications for select to authenticated using (
  auth.uid() = user_id
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'investor')
);
create policy "applications write own" on public.funding_applications for insert to authenticated with check (auth.uid() = user_id);
create policy "applications update own" on public.funding_applications for update to authenticated using (auth.uid() = user_id);

create policy "offers read" on public.offers for select to authenticated using (true);
create policy "offers write own" on public.offers for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "interest own" on public.offer_interest for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "rsvp own" on public.rsvps for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CV files: create a private bucket named "cvs" in Storage.
-- Path pattern: {user_id}/{filename}
-- Policy sketch: owner can insert/select own folder; investors can select.
