# Deployment guide (free tiers)

This app is designed for the Next.js + Supabase stack from `docs/PLAN.md`. Follow these steps to deploy it for free:

## 1) Prepare Supabase
1. Create a free project at https://supabase.com/.
2. In **Authentication → Providers**, enable **Email** and **Google**.
   - In **Authentication → Configuration**, ensure **Allow new users to sign up** is enabled so players can register.
   - For **Google**, paste your OAuth **Client ID** and **Client Secret** and set the callback URL Supabase provides (format: `https://<your-project>.supabase.co/auth/v1/callback`). Google also needs the following authorized origins/redirects in the Cloud Console:
     - Authorized JavaScript origins: your local dev URL (`http://localhost:3000`) and production Vercel URL.
     - Authorized redirect URIs: the Supabase callback above, plus app routes that handle OAuth, e.g., `http://localhost:3000/auth/callback` and `https://your-app.vercel.app/auth/callback`.
3. Copy the **Project URL** and **anon public key** from **Project settings → API**.
4. In **Database → SQL**, apply the schema/RLS from `docs/PLAN.md` (tables: `users`, `courts`, `bookings`, `availabilities`).

### Set an admin user (one-time setup)
After your first user signs up, promote them to `admin` so they can manage bookings:

1. Go to **Database → SQL** in Supabase.
2. Run the following, replacing `<user-uuid>` with the user ID from **Authentication → Users**:
   ```sql
   update users set role = 'admin' where id = '<user-uuid>';
   ```
3. Alternatively, add a policy to restrict admin updates to trusted contexts and use the Supabase Dashboard **Table editor** to set `role = admin`.

Notes:
- New users should default to `player`; only a small, trusted set needs `admin`.
- If you use server actions with the service key, ensure the service key is **not** exposed client-side.

## 2) Configure environment variables
Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>
``` 

If you use server actions/route handlers with the service role, add:

```
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
``` 

Never commit `.env.local`; it is already ignored by `.gitignore`.

## 3) Local verification
1. Install dependencies: `npm install` (or `pnpm install`).
2. Run the dev server: `npm run dev`.
3. Sign in with email or Google and verify you can see bookings and set availability.

## 4) Deploy to Vercel (free hobby tier)
1. Push your code to GitHub/GitLab/Bitbucket.
2. In Vercel, **Import Project** from your repo.
3. Set the environment variables above in **Project Settings → Environment Variables**.
4. Deploy the project (Vercel builds and hosts the Next.js app automatically).

## 5) Post-deploy checks
- Confirm OAuth redirect URLs in Supabase match the Vercel domain.
- Verify admin-only pages are protected (RLS + server-side role checks).
- Test availability edits with a non-admin account.

## 6) Keeping it free
- Stay within Supabase free limits (10–15 users is fine).
- Vercel hobby tier is free; avoid long-running background jobs.

If you need us to handle the deployment, share Supabase and Vercel access or invite us to the repo so we can trigger the deploy steps above.

## Why this environment cannot self-deploy
- Deploying requires access to your Supabase project URL/keys and Vercel account, which are not available inside this sandbox.
- OAuth redirect URLs must be configured on your Supabase project, which only an account owner can set.
- Vercel deployments must be initiated from your account and linked repo; this environment cannot grant itself that access.
