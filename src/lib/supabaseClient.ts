"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (typeof window === "undefined") {
    return new Proxy({} as SupabaseClient, {
      get() {
        throw new Error("Supabase client cannot be used on the server");
      },
    });
  }
  if (cachedClient) return cachedClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !key) {
    console.warn("Supabase env vars are not set");
  }
  cachedClient = createBrowserClient(url || "", key || "");
  return cachedClient;
}