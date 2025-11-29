import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CourtsManager from '@/components/admin/courts-manager';

export const dynamic = 'force-dynamic';

export default async function AdminCourtsPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();

  if (profile?.role !== 'admin') {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-amber-900 shadow-sm">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-2 text-amber-800">You need administrator permissions to view this page.</p>
        <Link className="mt-4 inline-flex rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white" href="/">
          Return home
        </Link>
      </div>
    );
  }

  const { data: courts = [], error: courtsError } = await supabase
    .from('courts')
    .select('id, name')
    .order('name');

  if (courtsError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-rose-800 shadow-sm" role="alert">
        <h2 className="text-2xl font-semibold">Unable to load courts</h2>
        <p className="mt-2 text-sm">{courtsError.message}</p>
        <p className="mt-2 text-sm text-rose-700">Try reloading the page or verifying your database connection.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold text-slate-900">Manage Courts</h1>
        <p className="text-slate-600">Add, edit, or remove courts from your scheduling system.</p>
      </div>
      <CourtsManager courts={courts} />
    </div>
  );
}

