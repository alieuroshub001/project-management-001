"use client";
import { useState } from "react";

type Purpose = "SIGNUP" | "FORGOT_PASSWORD";

export default function VerifyOtpForm({ defaultPurpose = "SIGNUP" as Purpose }: { defaultPurpose?: Purpose }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [purpose, setPurpose] = useState<Purpose>(defaultPurpose);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, purpose }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Verification failed");
      setMessage("OTP verified successfully.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        placeholder="OTP Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        minLength={6}
        maxLength={6}
        required
      />
      <select value={purpose} onChange={(e) => setPurpose(e.target.value as Purpose)}>
        <option value="SIGNUP">SIGNUP</option>
        <option value="FORGOT_PASSWORD">FORGOT_PASSWORD</option>
      </select>
      <button disabled={loading} type="submit">{loading ? "..." : "Verify OTP"}</button>
      {message && <p>{message}</p>}
    </form>
  );
}