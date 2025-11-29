'use client';

import { useMemo, useState, useTransition, type FormEvent } from 'react';
import { Calendar, dateFnsLocalizer, type EventPropGetter } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import { useRouter } from 'next/navigation';
import { createBookingAction, updateBookingAction } from '@/app/actions/bookings';

import 'react-big-calendar/lib/css/react-big-calendar.css';

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
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: Booking;
};

const statusStyles: Record<string, string> = {
  confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  pending: 'bg-amber-100 text-amber-800 border-amber-300',
  cancelled: 'bg-rose-100 text-rose-800 border-rose-300'
};

function toLocalInputValue(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

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

  const events = useMemo<CalendarEvent[]>(
    () =>
      bookings.map((booking) => ({
        id: booking.id,
        title: `${booking.courts?.name ?? 'Court'} (${booking.status})`,
        start: new Date(booking.start_time),
        end: new Date(booking.end_time),
        resource: booking
      })),
    [bookings]
  );

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

  const eventPropGetter: EventPropGetter<CalendarEvent> = (event) => {
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
        <Calendar
          selectable
          popup
          defaultView="week"
          localizer={localizer}
          events={events}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          style={{ height: 650 }}
          eventPropGetter={eventPropGetter}
        />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">{form.id ? 'Edit booking' : 'Create booking'}</h3>
          <p className="text-sm text-slate-600">Update booking details and save to the schedule.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="court">
              Court
            </label>
            <select
              id="court"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          {message && <p className="text-sm text-rose-600">{message}</p>}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending || !form.courtId}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
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
                className="text-sm font-medium text-slate-700 hover:text-indigo-600"
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
