'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AuthForm() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSignIn = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`
      }
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Check your email for a magic sign-in link.');
      setEmail('');
    }

    setIsSubmitting(false);
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setMessage(null);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`
      }
    });

    if (error) {
      setMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    if (data?.url) {
      window.location.assign(data.url);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Sign in</h2>
      <p className="mb-6 text-sm text-slate-600">
        Use your email for a magic link or sign in with Google.
      </p>
      <form className="space-y-4" onSubmit={handleEmailSignIn}>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Sending link...' : 'Send magic link'}
        </button>
      </form>
      <div className="my-6 flex items-center gap-3 text-sm text-slate-500">
        <div className="h-px flex-1 bg-slate-200" />
        <span>or</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M23.04 12.261c0-.815-.074-1.6-.211-2.355H12v4.456h6.196a5.297 5.297 0 0 1-2.302 3.47v2.885h3.713c2.176-2.004 3.433-4.958 3.433-8.456Z"
            fill="#4285F4"
          />
          <path
            d="M12 24c3.105 0 5.712-1.026 7.616-2.782l-3.713-2.885c-1.027.688-2.34 1.095-3.903 1.095-2.999 0-5.54-2.022-6.444-4.734H1.746v2.978A11.998 11.998 0 0 0 12 24Z"
            fill="#34A853"
          />
          <path
            d="M5.556 14.694A7.198 7.198 0 0 1 5.18 12c0-.93.16-1.831.376-2.694V6.328H1.746A11.998 11.998 0 0 0 0 12c0 1.94.465 3.77 1.746 5.672l3.81-2.978Z"
            fill="#FBBC05"
          />
          <path
            d="M12 4.75c1.69 0 3.2.582 4.39 1.726l3.293-3.293C17.708 1.164 15.102 0 12 0 7.313 0 3.28 2.69 1.746 6.328L5.556 9.306C6.46 6.996 9.001 4.75 12 4.75Z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </button>
      {message && <p className="mt-4 text-sm text-slate-700">{message}</p>}
    </div>
  );
}
