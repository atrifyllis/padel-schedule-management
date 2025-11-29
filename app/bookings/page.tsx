import Link from 'next/link';
import BookingAvailabilityList from '@/components/booking-availability-list';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function BookingsPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Upcoming bookings</h1>
        <p className="mt-2 text-slate-600">Sign in to share your availability for each scheduled slot.</p>
        <Link className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white" href="/auth">
          Go to sign in
        </Link>
      </div>
    );
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: bookings = [], error: bookingsError } = await supabase
    .from('bookings')
    .select('id, start_time, end_time, status, courts(name), availabilities(probability, user_id)')
    .gte('start_time', todayStart.toISOString())
    .order('start_time');

  if (bookingsError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm" role="alert">
        <h2 className="text-xl font-semibold">Unable to load bookings</h2>
        <p className="mt-2 text-sm">{bookingsError.message}</p>
        <p className="mt-2 text-sm text-rose-700">Please try refreshing the page or checking your connection.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Upcoming bookings</h1>
        <p className="text-slate-600">
          Pick your availability per booking using quick presets or the probability slider. Everyone&apos;s responses are
          aggregated per slot.
        </p>
      </div>
      <BookingAvailabilityList bookings={bookings} currentUserId={user.id} />
    </div>
  );
}
