-- Add display_name and email to public.users and keep them in sync with auth.users
begin;

alter table if exists public.users
  add column if not exists display_name text,
  add column if not exists email text;

-- Backfill existing rows from auth.users
update public.users u
set
  email = a.email,
  display_name = coalesce(u.display_name, (a.raw_user_meta_data->>'full_name')::text, split_part(a.email, '@', 1))
from auth.users a
where u.id = a.id;

-- Replace trigger function to maintain profile row with email and display_name
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce((new.raw_user_meta_data->>'full_name')::text, split_part(new.email, '@', 1))
  )
  on conflict (id) do update
  set email = excluded.email,
      display_name = coalesce(public.users.display_name, excluded.display_name);

  return new;
end;
$$;

-- Enable RLS on public.users with safe policies
alter table public.users enable row level security;

-- Drop existing policies if they exist, then recreate
drop policy if exists "authenticated can view users" on public.users;
drop policy if exists "admins manage users" on public.users;

-- Allow authenticated users to view users rows
create policy "authenticated can view users" on public.users
  for select using (auth.uid() is not null);

-- Allow admins to manage users (future-proofing)
create policy "admins manage users" on public.users
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

commit;

