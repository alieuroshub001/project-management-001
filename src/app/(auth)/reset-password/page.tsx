import ResetPasswordForm from "@/components/auth/resetpassword";

export default function ResetPasswordPage() {
  return (
    <div style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <h1>Reset Password</h1>
      <ResetPasswordForm />
    </div>
  );
}