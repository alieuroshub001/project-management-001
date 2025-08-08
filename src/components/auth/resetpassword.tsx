"use client";
import { useState } from "react";

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Reset failed");
      setMessage("Password reset successfully. You can now log in.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Reset failed";
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
      <input
        placeholder="New Password"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />
      <button disabled={loading} type="submit">{loading ? "..." : "Reset Password"}</button>
      {message && <p>{message}</p>}
    </form>
  );
}