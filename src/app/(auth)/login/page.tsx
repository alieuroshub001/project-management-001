"use client";
import LoginForm from "@/components/auth/login";

export default function LoginPage() {
  return (
    <div style={{ padding: 24, maxWidth: 420, margin: "0 auto" }}>
      <h1>Login</h1>
      <LoginForm />
      <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
        <a href="/signup">Create account</a>
        <a href="/forgot-password">Forgot password?</a>
        <a href="/verify-otp">Verify OTP</a>
      </div>
    </div>
  );
}