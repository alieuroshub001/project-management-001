import VerifyOtpForm from "@/components/auth/verifyOTP";

export default function VerifyOtpPage() {
  return (
    <div style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <h1>Verify OTP</h1>
      <VerifyOtpForm />
    </div>
  );
}