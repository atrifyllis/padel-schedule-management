import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import SignOutButton from './sign-out-button';

export default function Navbar({ user }: { user: User | null }) {
  return (
    <header className="border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white font-semibold">
            PS
          </div>
          <div>
            <p className="text-lg font-semibold">Padel Schedule</p>
            <p className="text-sm text-slate-500">Play smarter with organized courts</p>
          </div>
        </div>
        <nav className="flex items-center gap-4">
          <Link className="text-sm font-medium text-slate-700 hover:text-indigo-600" href="/">
            Home
          </Link>
          <Link className="text-sm font-medium text-slate-700 hover:text-indigo-600" href="/bookings">
            Bookings
          </Link>
          <Link className="text-sm font-medium text-slate-700 hover:text-indigo-600" href="/auth">
            Auth
          </Link>
          <Link className="text-sm font-medium text-slate-700 hover:text-indigo-600" href="/admin">
            Admin
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-600 sm:inline">{user.email}</span>
              <SignOutButton />
            </div>
          ) : (
            <Link
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500"
              href="/auth"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
