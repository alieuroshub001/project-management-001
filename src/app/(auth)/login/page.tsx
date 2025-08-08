"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const supabase = getSupabaseClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return setMessage(error.message);
      window.location.href = "/";
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) return setMessage(error.message);
      setMessage("Check your email to confirm sign up.");
    }
  }

  return (
    <div className="max-w-sm mx-auto p-6 border rounded mt-10">
      <h1 className="text-xl font-medium mb-4">{mode === "signin" ? "Sign In" : "Sign Up"}</h1>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border px-3 py-2 rounded" required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border px-3 py-2 rounded" required />
        <button type="submit" className="border px-3 py-2 rounded bg-black text-white">{mode === "signin" ? "Sign In" : "Sign Up"}</button>
      </form>
      <div className="mt-3 text-sm">
        {mode === "signin" ? (
          <button className="underline" onClick={() => setMode("signup")}>Create an account</button>
        ) : (
          <button className="underline" onClick={() => setMode("signin")}>Have an account? Sign in</button>
        )}
      </div>
      {message && <p className="mt-3 text-sm text-gray-600">{message}</p>}
    </div>
  );
}