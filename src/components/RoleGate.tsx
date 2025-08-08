"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

type AllowedRole = "admin" | "hr" | "team" | "client";

export default function RoleGate({ allowed, children }: { allowed: AllowedRole[]; children: React.ReactNode }) {
  const [role, setRole] = useState<AllowedRole | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (isMounted) {
          setRole(null);
          setLoading(false);
        }
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (isMounted) {
        setRole((profile?.role as AllowedRole) || null);
        setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [supabase]);

  if (loading) return <div className="p-4 text-sm">Loading...</div>;
  if (!role || !allowed.includes(role)) return <div className="p-8">Access denied</div>;
  return <>{children}</>;
}