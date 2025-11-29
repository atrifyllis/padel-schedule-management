'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

type BookingPayload = {
  id?: string;
  courtId: string;
  startTime: string;
  endTime: string;
  status: string;
};

type ActionResult = { success: true } | { success: false; error: string };

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, error: 'You must be signed in to perform this action.' } as const;
  }

  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || data?.role !== 'admin') {
    return { supabase, error: 'Admin access required.' } as const;
  }

  return { supabase, error: null };
}

async function hasOverlap(
  supabaseClient: ReturnType<typeof createClient>,
  payload: BookingPayload
) {
  const overlapQuery = supabaseClient
    .from('bookings')
    .select('id')
    .eq('court_id', payload.courtId)
    .lt('start_time', payload.endTime)
    .gt('end_time', payload.startTime);

  if (payload.id) {
    overlapQuery.neq('id', payload.id);
  }

  const { data, error } = await overlapQuery;

  if (error) {
    throw error;
  }

  return (data?.length ?? 0) > 0;
}

export async function createBookingAction(payload: BookingPayload): Promise<ActionResult> {
  const { supabase, error } = await requireAdmin();

  if (error) {
    return { success: false, error };
  }

  if (await hasOverlap(supabase, payload)) {
    return { success: false, error: 'This court already has a booking in the selected time range.' };
  }

  const { error: insertError } = await supabase.from('bookings').insert({
    court_id: payload.courtId,
    start_time: payload.startTime,
    end_time: payload.endTime,
    status: payload.status || 'pending'
  });

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  // Revalidate both admin and public bookings views so the new booking appears immediately.
  revalidatePath('/admin');
  revalidatePath('/bookings');
  return { success: true };
}

export async function updateBookingAction(payload: BookingPayload): Promise<ActionResult> {
  if (!payload.id) {
    return { success: false, error: 'A booking ID is required to update a booking.' };
  }

  const { supabase, error } = await requireAdmin();

  if (error) {
    return { success: false, error };
  }

  if (await hasOverlap(supabase, payload)) {
    return { success: false, error: 'This court already has a booking in the selected time range.' };
  }

  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      court_id: payload.courtId,
      start_time: payload.startTime,
      end_time: payload.endTime,
      status: payload.status || 'pending'
    })
    .eq('id', payload.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Revalidate both pages so updates propagate everywhere.
  revalidatePath('/admin');
  revalidatePath('/bookings');
  return { success: true };
}
