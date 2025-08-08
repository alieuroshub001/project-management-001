"use client";

import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function DashboardsLayout({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-4 py-3 flex gap-4 items-center justify-between">
        <nav className="flex gap-3 text-sm">
          <Link href="/admin">Admin</Link>
          <Link href="/hr">HR</Link>
          <Link href="/team">Team</Link>
          <Link href="/client">Client</Link>
        </nav>
        <button onClick={handleSignOut} className="text-sm border px-3 py-1 rounded">Sign out</button>
      </header>
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}