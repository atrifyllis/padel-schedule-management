# Padel schedule management plan

## Proposed stack (all free tiers)
- **Frontend & backend:** Next.js (App Router, TypeScript) with Tailwind CSS.
- **Auth:** Supabase Auth with email + Google OAuth (public schedules; simple admin/player role split).
- **Database:** Supabase Postgres with RLS policies for per-user availability edits; public read for schedules.
- **Hosting:** Vercel (hobby) for the Next.js app; Supabase hosted (free project) for auth/data.

## Context from stakeholder answers
- Users: ~10–15 players.
- Visibility: all bookings visible to any authenticated user.
- Notifications: not required.
- Constraint: must remain on free/open-source services.

## Implementation plan
1. **Bootstrap app**
   - Create Next.js app with Tailwind; set up Supabase client/env vars.
   - Add layout with navbar + session-aware auth controls.
2. **Schema & access control**
   - Tables: `users` (id, role), `bookings` (court_id, start/end), `availabilities` (booking_id, user_id, probability, updated_at), `courts`.
   - Enable RLS: public read on bookings; users can manage their own availability; admins manage bookings/courts.
3. **Auth flow**
   - Supabase Auth UI for email + Google; first login defaults to `player`; admin promoted manually in dashboard.
4. **Admin calendar**
   - Calendar page (React Big Calendar) to create/edit bookings; validate no overlap per court; server actions enforce `admin` role.
5. **Player availability**
   - List upcoming bookings; allow availability toggle or probability slider; users can update selections; show aggregated counts.
6. **Deployment**
   - Deploy to Vercel; configure Supabase project, RLS policies, and OAuth redirect URLs for local and production.
7. **QA & polish**
   - Loading/error states, basic accessibility, smoke tests for auth and CRUD flows.

## Status
- All stakeholder questions answered; no open clarifications.
- Ready to start implementation on the free-tier Next.js + Supabase stack.
