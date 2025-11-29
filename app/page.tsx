import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Supabase Auth ready
            </p>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-slate-900">Padel schedule management</h1>
              <p className="text-lg text-slate-600">
                Start with a secure authentication layer featuring Supabase email magic links and Google sign-ins.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth"
                className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-500"
              >
                View auth flow
              </Link>
              <a
                href="https://supabase.com/docs/guides/auth" target="_blank" rel="noreferrer"
                className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-800 hover:border-indigo-200 hover:text-indigo-600"
              >
                Supabase auth docs
              </a>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 p-6 text-white shadow-lg">
            <p className="text-sm uppercase tracking-wide text-indigo-100">Signed-in status</p>
            <p className="mt-2 text-2xl font-semibold">{user ? 'You are signed in' : 'No active session'}</p>
            {user && (
              <div className="mt-4 space-y-1 text-sm text-indigo-50">
                <p>Email: {user.email}</p>
                <p>User ID: {user.id}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
