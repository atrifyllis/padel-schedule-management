import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createBookingAction, updateBookingAction } from './bookings';
import { setAvailabilityAction } from './availabilities';
import { signOut } from './auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn()
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn()
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}));

type BuildMockOptions = {
  user?: { id: string } | null;
  role?: string;
  overlapData?: unknown[];
  insertError?: { message: string } | null;
  updateError?: { message: string } | null;
  upsertError?: { message: string } | null;
};

function buildSupabaseMock({
  user = { id: 'user-1' },
  role = 'admin',
  overlapData = [],
  insertError = null,
  updateError = null,
  upsertError = null
}: BuildMockOptions = {}) {
  const inserts: unknown[] = [];
  const updates: unknown[] = [];
  const upserts: unknown[] = [];

  const supabase = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
      signOut: vi.fn().mockResolvedValue({})
    },
    from: vi.fn((table: string) => {
      if (table === 'users') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: user ? { role } : null, error: null })
        } as never;
      }

      if (table === 'bookings') {
        const select = vi.fn(() => {
          const query: any = {
            eq: vi.fn().mockReturnThis(),
            lt: vi.fn().mockReturnThis(),
            gt: vi.fn().mockReturnThis(),
            neq: vi.fn().mockReturnThis(),
            then: (resolve: any) => Promise.resolve({ data: overlapData, error: null }).then(resolve)
          };
          return query;
        });

        const insert = vi.fn(async (payload: unknown) => {
          inserts.push(payload);
          return { error: insertError };
        });

        const update = vi.fn((payload: unknown) => {
          updates.push(payload);
          return { eq: vi.fn().mockResolvedValue({ error: updateError }) } as never;
        });

        return { select, insert, update } as never;
      }

      if (table === 'availabilities') {
        const upsert = vi.fn(async (payload: unknown) => {
          upserts.push(payload);
          return { error: upsertError };
        });

        return { upsert } as never;
      }

      return {} as never;
    }),
    calls: { inserts, updates, upserts }
  };

  return supabase;
}

const createClientMock = createClient as unknown as vi.Mock;
const redirectMock = redirect as unknown as vi.Mock;
const revalidateMock = revalidatePath as unknown as vi.Mock;

beforeEach(() => {
  createClientMock.mockReset();
  redirectMock.mockReset();
  revalidateMock.mockReset();
});

describe('auth actions', () => {
  it('signs out and redirects to home', async () => {
    const supabase = buildSupabaseMock();
    createClientMock.mockReturnValue(supabase);

    await signOut();

    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith('/');
  });
});

describe('availability actions', () => {
  it('requires an authenticated user', async () => {
    const supabase = buildSupabaseMock({ user: null });
    createClientMock.mockReturnValue(supabase);

    const result = await setAvailabilityAction({ bookingId: '1', probability: 50 });
    expect(result).toEqual({ success: false, error: 'You must be signed in to set your availability.' });
  });

  it('saves availability and revalidates bookings', async () => {
    const supabase = buildSupabaseMock();
    createClientMock.mockReturnValue(supabase);

    const result = await setAvailabilityAction({ bookingId: '1', probability: 75 });

    expect(result).toEqual({ success: true });
    expect(supabase.calls.upserts).toHaveLength(1);
    expect(revalidateMock).toHaveBeenCalledWith('/bookings');
  });
});

describe('booking actions', () => {
  const payload = {
    courtId: 'court-1',
    startTime: new Date('2024-01-01T10:00:00Z').toISOString(),
    endTime: new Date('2024-01-01T11:00:00Z').toISOString(),
    status: 'pending'
  };

  it('rejects non-admin users', async () => {
    const supabase = buildSupabaseMock({ role: 'player' });
    createClientMock.mockReturnValue(supabase);

    const result = await createBookingAction(payload);
    expect(result).toEqual({ success: false, error: 'Admin access required.' });
  });

  it('prevents creating overlapping bookings', async () => {
    const supabase = buildSupabaseMock({ overlapData: [{ id: 'existing' }] });
    createClientMock.mockReturnValue(supabase);

    const result = await createBookingAction(payload);
    expect(result).toEqual({ success: false, error: 'This court already has a booking in the selected time range.' });
  });

  it('creates new bookings and revalidates the admin page', async () => {
    const supabase = buildSupabaseMock();
    createClientMock.mockReturnValue(supabase);

    const result = await createBookingAction(payload);

    expect(result).toEqual({ success: true });
    expect(supabase.calls.inserts).toHaveLength(1);
    expect(revalidateMock).toHaveBeenCalledWith('/admin');
  });

  it('requires an id for updates', async () => {
    const result = await updateBookingAction({ ...payload, id: undefined });
    expect(result).toEqual({ success: false, error: 'A booking ID is required to update a booking.' });
  });

  it('updates existing bookings', async () => {
    const supabase = buildSupabaseMock();
    createClientMock.mockReturnValue(supabase);

    const result = await updateBookingAction({ ...payload, id: 'booking-1' });

    expect(result).toEqual({ success: true });
    expect(supabase.calls.updates).toHaveLength(1);
    expect(revalidateMock).toHaveBeenCalledWith('/admin');
  });
});
