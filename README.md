# Padel Schedule Management

A Next.js (App Router, TypeScript) starter configured with Tailwind CSS and Supabase authentication (email magic link + Google OAuth). Middleware keeps user sessions fresh across the app.

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Provide Supabase credentials in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. Run the dev server:

```bash
npm run dev
```

4. Run unit tests with Vitest:

```bash
npm test
```

## Auth flow

- `/auth` offers email magic link and Google sign-in. Sessions are exchanged via `/auth/callback`.
- `middleware.ts` refreshes the Supabase session on each request.
- The navbar surfaces the current user and a server-action sign-out button.
