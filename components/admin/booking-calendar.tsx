'use client';

import { useMemo, useState, useTransition, type FormEvent } from 'react';
import dynamic from 'next/dynamic';
import { dateFnsLocalizer } from 'react-big-calendar';
// Provide ambient module declaration fallback
// @ts-ignore - module types provided via custom d.ts
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
// Add date helpers
import { addDays, addMonths } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import { useRouter } from 'next/navigation';
import { createBookingAction, updateBookingAction } from '@/app/actions/bookings';
import { toLocalInputValue } from '@/lib/utils/booking';

// Remove inline module declaration (now handled via root d.ts)

import 'react-big-calendar/lib/css/react-big-calendar.css';

const BigCalendar = dynamic<any>(() => import('react-big-calendar').then((module) => module.Calendar), { ssr: false });

type Court = {
  id: string;
  name: string;
};

type Booking = {
  id: string;
  court_id: string;
  start_time: string;
  end_time: string;
  status: string;
  courts?: {
    name?: string | null;
  } | null;
};

type BookingFormState = {
  id?: string;
  courtId: string;
  start: string;
  end: string;
  status: string;
};

type AdminBookingCalendarProps = {
  courts: Court[];
  bookings: Booking[];
};

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

type CalendarEvent = {
  id?: string;
  title?: string;
  start: Date;
  end: Date;
  resource?: Booking;
};

const statusStyles: Record<string, string> = {
  confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  pending: 'bg-amber-100 text-amber-800 border-amber-300',
  cancelled: 'bg-rose-100 text-rose-800 border-rose-300'
};

// Define local event prop getter type
type LocalEventPropGetter<T> = (event: T) => { className?: string; style?: React.CSSProperties } | undefined;

export default function BookingCalendar({ courts, bookings }: AdminBookingCalendarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const defaultCourt = courts[0]?.id ?? '';
  const initialStart = useMemo(() => toLocalInputValue(new Date()), []);
  const initialEnd = useMemo(() => toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000)), []);

  const [form, setForm] = useState<BookingFormState>({
    id: undefined,
    courtId: defaultCourt,
    start: initialStart,
    end: initialEnd,
    status: 'pending'
  });
  const [message, setMessage] = useState<string | null>(null);

  // Controlled calendar state for date and view to ensure navigation works
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<string>('week');

  const events = useMemo<CalendarEvent[]>(
    () =>
      bookings.flatMap((booking) => {
        const start = new Date(booking.start_time);
        const end = new Date(booking.end_time);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];

        return [
          {
            id: booking.id,
            title: `${booking.courts?.name ?? 'Court'} (${booking.status})`,
            start,
            end,
            resource: booking
          }
        ];
      }),
    [bookings]
  );

  const computeLabel = (): string => {
    if (currentView === 'month') {
      return format(currentDate, 'MMMM yyyy');
    }
    if (currentView === 'day') {
      return format(currentDate, 'MMM d');
    }
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const end = addDays(start, currentView === 'week' || currentView === 'agenda' ? 6 : 0);
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const payload = {
      id: form.id,
      courtId: form.courtId,
      startTime: new Date(form.start).toISOString(),
      endTime: new Date(form.end).toISOString(),
      status: form.status
    };

    startTransition(async () => {
      const result = form.id
        ? await updateBookingAction(payload)
        : await createBookingAction(payload);

      if (!result.success) {
        setMessage(result.error);
        return;
      }

      setMessage(form.id ? 'Booking updated successfully.' : 'Booking created successfully.');
      setForm({
        id: undefined,
        courtId: defaultCourt,
        start: initialStart,
        end: initialEnd,
        status: 'pending'
      });
      router.refresh();
    });
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setForm({
      id: undefined,
      courtId: defaultCourt,
      start: toLocalInputValue(start),
      end: toLocalInputValue(end),
      status: 'pending'
    });
    setMessage(null);
  };

  const handleSelectEvent = (event: { resource?: Booking }) => {
    if (!event.resource) return;

    setForm({
      id: event.resource.id,
      courtId: event.resource.court_id,
      start: toLocalInputValue(new Date(event.resource.start_time)),
      end: toLocalInputValue(new Date(event.resource.end_time)),
      status: event.resource.status
    });
    setMessage(null);
  };

  const eventPropGetter: LocalEventPropGetter<CalendarEvent> = (event: CalendarEvent) => {
    const booking = event.resource;
    const styleKey = booking?.status ?? 'pending';
    const classes = statusStyles[styleKey] ?? 'bg-slate-100 text-slate-800 border-slate-200';

    return {
      className: classes,
      style: {
        borderWidth: 1,
        borderStyle: 'solid'
      }
    };
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Bookings calendar</h2>
            <p className="text-sm text-slate-600">Select a slot to create a booking or click an event to edit.</p>
          </div>
          <div className="flex gap-2 text-xs">
            {Object.entries(statusStyles).map(([key, value]) => (
              <span
                key={key}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 capitalize ${value}`}
              >
                {key}
              </span>
            ))}
          </div>
        </div>
        <BigCalendar
          selectable
          popup
          toolbar={false}
          date={currentDate}
          view={currentView as any}
          defaultView="week"
          views={['month', 'week', 'day', 'agenda']}
          // Use built-in toolbar for now (removed custom version to restore functionality)
          localizer={localizer}
          events={events}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          style={{ height: 650 }}
          eventPropGetter={eventPropGetter}
          onNavigate={(newDate: Date) => {
            // Align date to appropriate period basis
            let aligned = newDate;
            if (currentView === 'week' || currentView === 'agenda') {
              aligned = startOfWeek(newDate, { weekStartsOn: 0 });
            }
            setCurrentDate(aligned);
          }}
          onView={(newView: string) => {
            if (process.env.NODE_ENV !== 'production') {
              // eslint-disable-next-line no-console
              console.log('[Calendar] view change', { from: currentView, to: newView });
            }
            setCurrentView(newView);
          }}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCurrentDate(startOfWeek(new Date(), { weekStartsOn: 0 }))}
            className="rounded border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Today
          </button>
          <div className="flex items-center divide-x divide-slate-200 rounded border border-slate-200 text-slate-700 shadow-sm">
            <button
              type="button"
              onClick={() => {
                let next: Date;
                if (currentView === 'month') next = addMonths(currentDate, -1);
                else if (currentView === 'week' || currentView === 'agenda') next = addDays(currentDate, -7);
                else next = addDays(currentDate, -1);
                setCurrentDate(next);
              }}
              className="px-2 py-1 text-xs font-medium transition hover:bg-slate-50"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => {
                let next: Date;
                if (currentView === 'month') next = addMonths(currentDate, 1);
                else if (currentView === 'week' || currentView === 'agenda') next = addDays(currentDate, 7);
                else next = addDays(currentDate, 1);
                setCurrentDate(next);
              }}
              className="px-2 py-1 text-xs font-medium transition hover:bg-slate-50"
            >
              →
            </button>
          </div>
          {['month', 'week', 'day', 'agenda'].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setCurrentView(v)}
              className={`rounded-lg border px-3 py-1 text-xs font-medium shadow-sm transition ${
                currentView === v ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
          <span className="ml-auto text-xs font-semibold text-slate-900">{computeLabel()}</span>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">{form.id ? 'Edit booking' : 'Create booking'}</h3>
          <p className="text-sm text-slate-600">Update booking details and save to the schedule.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit} aria-busy={isPending}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="court">
              Court
            </label>
            <select
              id="court"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              value={form.courtId}
              onChange={(event) => setForm((prev) => ({ ...prev, courtId: event.target.value }))}
            >
              {courts.map((court) => (
                <option key={court.id} value={court.id}>
                  {court.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="start">
                Start time
              </label>
              <input
                id="start"
                type="datetime-local"
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                value={form.start}
                onChange={(event) => setForm((prev) => ({ ...prev, start: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="end">
                End time
              </label>
              <input
                id="end"
                type="datetime-local"
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                value={form.end}
                onChange={(event) => setForm((prev) => ({ ...prev, end: event.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          {message && (
            <p className="text-sm text-rose-600" role="alert" aria-live="assertive">
              {message}
            </p>
          )}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending || !form.courtId}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? 'Saving...' : form.id ? 'Update booking' : 'Create booking'}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={() => setForm({
                  id: undefined,
                  courtId: defaultCourt,
                  start: initialStart,
                  end: initialEnd,
                  status: 'pending'
                })}
                className="text-sm font-medium text-slate-700 hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
