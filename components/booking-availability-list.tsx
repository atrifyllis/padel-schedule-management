'use client';

import { format } from 'date-fns';
import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setAvailabilityAction } from '@/app/actions/availabilities';

type Availability = {
  user_id: string;
  probability: number;
};

type Booking = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  courts?: {
    name?: string | null;
  } | null;
  availabilities?: Availability[] | null;
};

type BookingAvailabilityListProps = {
  bookings: Booking[];
  currentUserId: string;
};

import { getSlotStats } from '@/lib/utils/booking';

function BookingAvailabilityRow({ booking, currentUserId }: { booking: Booking; currentUserId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentAvailability = booking.availabilities?.find((item) => item.user_id === currentUserId);
  const [probability, setProbability] = useState<number>(currentAvailability?.probability ?? 0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  const stats = useMemo(() => getSlotStats(booking.availabilities ?? []), [booking.availabilities]);

  const formattedRange = useMemo(() => {
    const start = new Date(booking.start_time);
    const end = new Date(booking.end_time);

    return `${format(start, 'EEE, MMM d • p')} - ${format(end, 'p')}`;
  }, [booking.end_time, booking.start_time]);

  const handleSave = () => {
    setFeedback(null);
    setHasError(false);

    startTransition(async () => {
      const result = await setAvailabilityAction({ bookingId: booking.id, probability });

      if (!result.success) {
        setFeedback(result.error);
        setHasError(true);
        return;
      }

      setFeedback('Availability saved.');
      router.refresh();
    });
  };

  const presetOptions = [0, 25, 50, 75, 100];

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-slate-500">{formattedRange}</p>
          <p className="text-lg font-semibold text-slate-900">
            {booking.courts?.name ?? 'Court'} <span className="text-sm font-normal text-slate-500">({booking.status})</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
            Avg {stats.averageProbability}%
          </span>
          <span className="rounded-full bg-indigo-50 px-3 py-1 font-semibold text-indigo-700">
            {stats.responseCount} response{stats.responseCount === 1 ? '' : 's'}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
            {stats.availableCount} available
          </span>
          <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">
            {stats.unavailableCount} unavailable
          </span>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {presetOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setProbability(option)}
              aria-pressed={probability === option}
              className={`rounded-full border px-3 py-1 text-sm font-medium shadow-sm transition hover:border-indigo-300 hover:text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                probability === option ? 'border-indigo-500 bg-white text-indigo-700' : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              {option === 0 ? 'Unavailable' : option === 100 ? 'Available' : `${option}%`}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <label htmlFor={`probability-${booking.id}`}>Probability</label>
            <span className="font-semibold text-slate-900">{probability}%</span>
          </div>
          <input
            id={`probability-${booking.id}`}
            type="range"
            min={0}
            max={100}
            step={5}
            value={probability}
            onChange={(event) => setProbability(Number(event.target.value))}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={probability}
            aria-label="Availability probability"
            className="w-full accent-indigo-600"
          />
          <p className="text-sm text-slate-500">
            Drag the slider or pick a preset to mark your availability for this booking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? 'Saving...' : 'Save availability'}
          </button>
          <p className="text-sm text-slate-600">
            Your choice: <span className="font-semibold text-indigo-700">{probability}%</span>
          </p>
        </div>
        {feedback && (
          <p
            className={`text-sm ${hasError ? 'text-rose-700' : 'text-emerald-700'}`}
            role={hasError ? 'alert' : 'status'}
            aria-live="polite"
          >
            {feedback}
          </p>
        )}
      </div>
    </div>
  );
}

export default function BookingAvailabilityList({ bookings, currentUserId }: BookingAvailabilityListProps) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-slate-600">
        No upcoming bookings found. Check back later.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <BookingAvailabilityRow key={booking.id} booking={booking} currentUserId={currentUserId} />
      ))}
    </div>
  );
}
