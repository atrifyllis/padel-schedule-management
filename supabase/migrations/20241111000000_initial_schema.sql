-- Enable required extension for UUID generation
create extension if not exists "pgcrypto";

-- Domain types
create type public.user_role as enum ('admin', 'player');

-- Core tables
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'player'
);

create table if not exists public.courts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references public.courts(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint bookings_time_check check (end_time > start_time)
);

create table if not exists public.availabilities (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  probability smallint not null check (probability between 0 and 100),
  updated_at timestamptz not null default now(),
  constraint availabilities_booking_user_unique unique (booking_id, user_id)
);

-- Helper function
create or replace function public.is_admin(check_user uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.users u where u.id = check_user and u.role = 'admin'
  );
$$;

-- Enable row-level security
alter table public.courts enable row level security;
alter table public.bookings enable row level security;
alter table public.availabilities enable row level security;

-- Courts policies
create policy "players can view courts" on public.courts
  for select
  using (auth.uid() is not null);

create policy "admins manage courts" on public.courts
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Bookings policies
create policy "players can view bookings" on public.bookings
  for select
  using (auth.uid() is not null);

create policy "admins manage bookings" on public.bookings
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Availabilities policies
create policy "players view own availabilities" on public.availabilities
  for select
  using (user_id = auth.uid());

create policy "players manage own availabilities" on public.availabilities
  for insert
  with check (user_id = auth.uid());

create policy "players update own availabilities" on public.availabilities
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "admins manage availabilities" on public.availabilities
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
