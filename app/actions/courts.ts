'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

type CourtPayload = {
  id?: string;
  name: string;
};

type ActionResult = { success: true } | { success: false; error: string };

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, error: 'You must be signed in to perform this action.' };
  }

  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || data?.role !== 'admin') {
    return { supabase, error: 'Admin access required.' };
  }

  return { supabase, error: null };
}

export async function createCourtAction(payload: CourtPayload): Promise<ActionResult> {
  const { supabase, error } = await requireAdmin();

  if (error) {
    return { success: false, error };
  }

  if (!payload.name || !payload.name.trim()) {
    return { success: false, error: 'Court name is required.' };
  }

  const { error: insertError } = await supabase.from('courts').insert({
    name: payload.name.trim()
  });

  if (insertError) {
    if (insertError.code === '23505') {
      return { success: false, error: 'A court with this name already exists.' };
    }
    return { success: false, error: insertError.message };
  }

  revalidatePath('/admin/courts');
  revalidatePath('/admin');
  return { success: true };
}

export async function updateCourtAction(payload: CourtPayload): Promise<ActionResult> {
  const { supabase, error } = await requireAdmin();

  if (error) {
    return { success: false, error };
  }

  if (!payload.id) {
    return { success: false, error: 'Court ID is required.' };
  }

  if (!payload.name || !payload.name.trim()) {
    return { success: false, error: 'Court name is required.' };
  }

  const { error: updateError } = await supabase
    .from('courts')
    .update({ name: payload.name.trim() })
    .eq('id', payload.id);

  if (updateError) {
    if (updateError.code === '23505') {
      return { success: false, error: 'A court with this name already exists.' };
    }
    return { success: false, error: updateError.message };
  }

  revalidatePath('/admin/courts');
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteCourtAction(payload: { id: string }): Promise<ActionResult> {
  const { supabase, error } = await requireAdmin();

  if (error) {
    return { success: false, error };
  }

  if (!payload.id) {
    return { success: false, error: 'Court ID is required.' };
  }

  const { error: deleteError } = await supabase
    .from('courts')
    .delete()
    .eq('id', payload.id);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  revalidatePath('/admin/courts');
  revalidatePath('/admin');
  return { success: true };
}

