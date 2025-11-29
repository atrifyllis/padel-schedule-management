'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

type AvailabilityPayload = {
  bookingId: string;
  probability: number;
};

type ActionResult = { success: true } | { success: false; error: string };

export async function setAvailabilityAction(payload: AvailabilityPayload): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'You must be signed in to set your availability.' };
  }

  if (!payload.bookingId) {
    return { success: false, error: 'A booking is required.' };
  }

  if (!Number.isFinite(payload.probability) || payload.probability < 0 || payload.probability > 100) {
    return { success: false, error: 'Probability must be between 0 and 100.' };
  }

  const probability = Math.round(payload.probability);

  const { error } = await supabase.from('availabilities').upsert(
    {
      booking_id: payload.bookingId,
      user_id: user.id,
      probability
    },
    { onConflict: 'booking_id,user_id' }
  );

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/bookings');
  return { success: true };
}
