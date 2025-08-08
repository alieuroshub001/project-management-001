"use client";

import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function Home() {
  const supabase = getSupabaseClient();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, [supabase]);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-3">Project Management Suite</h1>
      <p className="text-gray-600 mb-6">Next.js + Supabase with role-based dashboards.</p>
      <div className="flex gap-3 mb-8">
        <Link className="border px-3 py-2 rounded" href="/admin">Admin</Link>
        <Link className="border px-3 py-2 rounded" href="/hr">HR</Link>
        <Link className="border px-3 py-2 rounded" href="/team">Team</Link>
        <Link className="border px-3 py-2 rounded" href="/client">Client</Link>
      </div>
      {email ? (
        <p className="text-sm">Signed in as {email}. Go to your dashboard above.</p>
      ) : (
        <Link className="underline" href="/login">Sign in</Link>
      )}
    </div>
  );
}
