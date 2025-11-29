-- Minimal demo data for local development
insert into public.courts (id, name)
values
  ('00000000-0000-0000-0000-000000000001', 'Center Court'),
  ('00000000-0000-0000-0000-000000000002', 'Practice Court')
on conflict (id) do nothing;

insert into public.bookings (id, court_id, start_time, end_time, status)
values
  (
    '00000000-0000-0000-0000-00000000000a',
    '00000000-0000-0000-0000-000000000001',
    timezone('utc', now()) + interval '1 day',
    timezone('utc', now()) + interval '1 day 1 hour',
    'confirmed'
  ),
  (
    '00000000-0000-0000-0000-00000000000b',
    '00000000-0000-0000-0000-000000000002',
    timezone('utc', now()) + interval '1 day 2 hours',
    timezone('utc', now()) + interval '1 day 3 hours',
    'pending'
  )
on conflict (id) do nothing;
