import AuthForm from '@/components/auth/auth-form';
import { createClient } from '@/lib/supabase/server';

export default async function AuthPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col gap-8">
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-900">Authentication</h1>
        <p className="mt-2 text-lg text-slate-600">
          Sign in with email or Google to access your padel schedules using Supabase's Auth UI. Sessions are persisted via middleware so you can stay logged in across the app, and new accounts automatically receive the default player role.
        </p>
      </div>
      <div className="flex flex-wrap items-start gap-8">
        <AuthForm />
        <div className="max-w-md rounded-2xl border border-indigo-100 bg-indigo-50 px-6 py-5 text-sm text-slate-800 shadow-sm">
          <h2 className="text-base font-semibold text-indigo-900">Session info</h2>
          {user ? (
            <ul className="mt-3 space-y-2">
              <li>
                <span className="font-medium">Email:</span> {user.email}
              </li>
              <li>
                <span className="font-medium">ID:</span> {user.id}
              </li>
            </ul>
          ) : (
            <p className="mt-3 text-slate-700">Not signed in yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
