"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) setMsg(data.error || "Login failed");
    else setMsg("Logged in");
    setLoading(false);
  };

  return (
    <div style={{ padding: 24, maxWidth: 420, margin: "0 auto" }}>
      <h1>Login</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button disabled={loading} type="submit">{loading ? "..." : "Login"}</button>
      </form>
      {msg && <p>{msg}</p>}
      <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
        <a href="/admin">Go Admin</a>
        <a href="/team">Go Team</a>
        <a href="/hr">Go HR</a>
        <a href="/client">Go Client</a>
      </div>
    </div>
  );
}