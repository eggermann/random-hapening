-- Supabase SQL schema for HappeningRoulette.com

-- Table: events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  latitude double precision not null,
  longitude double precision not null,
  radius double precision not null,
  created_at timestamptz default now()
);

-- Table: posts
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  user_id uuid,
  type text not null,
  media_url text,
  text_content text,
  created_at timestamptz default now()
);

-- Table: chats
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  user_id uuid,
  message text not null,
  created_at timestamptz default now()
);

insert into public.events (name, description, city, start_time, end_time, latitude, longitude, radius)
values (
  'Berlin Art Happening',
  'A spontaneous art event in Berlin.',
  'Berlin',
  '2025-07-01T18:00:00+02:00',
  '2025-07-01T22:00:00+02:00',
  52.5200,
  13.4050,
  500
);