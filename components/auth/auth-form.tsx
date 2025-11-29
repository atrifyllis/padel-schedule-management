'use client';

import { useEffect, useMemo, useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@/lib/supabase/client';

export default function AuthForm() {
  const supabase = useMemo(() => createClient(), []);
  const [redirectTo, setRedirectTo] = useState<string>();

  useEffect(() => {
    setRedirectTo(`${window.location.origin}/auth/callback`);
  }, []);

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Sign in</h2>
      <p className="mb-6 text-sm text-slate-600">
        Use the magic link flow or continue with Google via Supabase Auth UI.
      </p>
      <Auth
        supabaseClient={supabase as any}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#4f46e5',
                brandAccent: '#4338ca'
              }
            }
          }
        }}
        providers={['google']}
        redirectTo={redirectTo}
        magicLink
        queryParams={{ next: '/' }}
      />
      <p className="mt-4 text-xs text-slate-600">
        We create your player profile on first sign-in. Organizers can promote accounts to admin using the Supabase dashboard.
      </p>
    </div>
  );
}
