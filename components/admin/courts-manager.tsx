'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createCourtAction, updateCourtAction, deleteCourtAction } from '@/app/actions/courts';

type Court = {
  id: string;
  name: string;
};

type CourtsManagerProps = {
  courts: Court[];
};

export default function CourtsManager({ courts }: CourtsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCourtName, setNewCourtName] = useState('');
  const [editCourtName, setEditCourtName] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourtName.trim()) return;

    setMessage(null);
    startTransition(async () => {
      const result = await createCourtAction({ name: newCourtName.trim() });
      if (!result.success) {
        setMessage({ type: 'error', text: result.error });
        return;
      }
      setMessage({ type: 'success', text: 'Court created successfully.' });
      setNewCourtName('');
      router.refresh();
    });
  };

  const handleUpdate = (id: string) => {
    if (!editCourtName.trim()) return;

    setMessage(null);
    startTransition(async () => {
      const result = await updateCourtAction({ id, name: editCourtName.trim() });
      if (!result.success) {
        setMessage({ type: 'error', text: result.error });
        return;
      }
      setMessage({ type: 'success', text: 'Court updated successfully.' });
      setEditingId(null);
      setEditCourtName('');
      router.refresh();
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also delete all associated bookings.`)) {
      return;
    }

    setMessage(null);
    startTransition(async () => {
      const result = await deleteCourtAction({ id });
      if (!result.success) {
        setMessage({ type: 'error', text: result.error });
        return;
      }
      setMessage({ type: 'success', text: 'Court deleted successfully.' });
      router.refresh();
    });
  };

  const startEdit = (court: Court) => {
    setEditingId(court.id);
    setEditCourtName(court.name);
    setMessage(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditCourtName('');
    setMessage(null);
  };

  return (
    <div className="space-y-6">
      {/* Create new court */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Add New Court</h2>
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            placeholder="Court name"
            value={newCourtName}
            onChange={(e) => setNewCourtName(e.target.value)}
            disabled={isPending}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isPending || !newCourtName.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? 'Adding...' : 'Add Court'}
          </button>
        </form>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`rounded-lg border p-4 ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      {/* Courts list */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Existing Courts</h2>
          <p className="text-sm text-slate-600">Manage your court inventory</p>
        </div>
        <div className="divide-y divide-slate-200">
          {courts.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              No courts found. Add your first court above.
            </div>
          ) : (
            courts.map((court) => (
              <div key={court.id} className="flex items-center justify-between p-4">
                {editingId === court.id ? (
                  <div className="flex flex-1 items-center gap-3">
                    <input
                      type="text"
                      value={editCourtName}
                      onChange={(e) => setEditCourtName(e.target.value)}
                      disabled={isPending}
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdate(court.id)}
                      disabled={isPending || !editCourtName.trim()}
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={isPending}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                        <svg
                          className="h-5 w-5 text-indigo-600"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                      <span className="font-medium text-slate-900">{court.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(court)}
                        disabled={isPending}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(court.id, court.name)}
                        disabled={isPending}
                        className="rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

