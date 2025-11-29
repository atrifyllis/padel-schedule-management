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

## Deploying to Vercel

The project is ready for Vercel's default Next.js build pipeline.

1. Create a new Vercel project and import this repository.
2. In **Project Settings → Environment Variables**, add the Supabase values used locally:

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<your-project>.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your project's anon public key |

   Re-run the production build after saving the variables so Vercel injects them into the deployment.
3. Deploy to generate a production URL such as `https://padel-schedule-management.vercel.app`.

## Supabase Auth redirect URLs

Supabase must allow both local and production redirects for magic links and OAuth callbacks.

1. In the Supabase dashboard, go to **Authentication → URL Configuration**.
2. Add the following entries to **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://<your-vercel-domain>/auth/callback`
3. Save. If you later attach a custom domain, add the domain's callback URL to the same list.

## Optional: custom domain on Vercel (free tier)

1. Purchase or transfer the domain to your registrar.
2. In Vercel, open **Domains** for the project and **Add a Domain** (custom domains are supported on the free tier).
3. Follow the prompted DNS steps—usually pointing the root domain's A/AAAA records to Vercel or using a `CNAME` for subdomains.
4. After DNS propagates, add `https://<your-custom-domain>/auth/callback` to Supabase's redirect URLs so Auth continues to work.

## Auth flow

- `/auth` offers email magic link and Google sign-in. Sessions are exchanged via `/auth/callback`.
- `middleware.ts` refreshes the Supabase session on each request.
- The navbar surfaces the current user and a server-action sign-out button.
