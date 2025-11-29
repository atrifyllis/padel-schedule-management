import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Navbar from '@/components/navbar';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Padel Schedule Management',
  description: 'Manage padel schedules with Supabase authentication.'
};

export default async function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900">
        <div className="min-h-screen flex flex-col">
          <Navbar user={user} />
          <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
