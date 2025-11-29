import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import BookingCalendar from '@/components/admin/booking-calendar';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Admin area</h1>
        <p className="mt-2 text-slate-600">You must be signed in as an admin to manage bookings.</p>
        <Link className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white" href="/auth">
          Go to sign in
        </Link>
      </div>
    );
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

  const { data: courts = [], error: courtsError } = await supabase.from('courts').select('id, name').order('name');
  const { data: bookings = [], error: bookingsError } = await supabase
    .from('bookings')
    .select('id, court_id, start_time, end_time, status, courts(name)')
    .order('start_time');

  if (courtsError || bookingsError) {
    const message = courtsError?.message ?? bookingsError?.message ?? 'Unknown error';
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-rose-800 shadow-sm" role="alert">
        <h2 className="text-2xl font-semibold">Unable to load admin data</h2>
        <p className="mt-2 text-sm">{message}</p>
        <p className="mt-2 text-sm text-rose-700">Try reloading the page or verifying your database connection.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold text-slate-900">Admin bookings</h1>
        <p className="text-slate-600">Manage court bookings with an interactive calendar and overlap validation.</p>
      </div>
      <BookingCalendar courts={(courts as any) ?? []} bookings={(bookings as any) ?? []} />
    </div>
  );
}
