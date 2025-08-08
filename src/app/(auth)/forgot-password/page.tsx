import ForgotPasswordForm from "@/components/auth/forgetpassword";

export default function ForgotPasswordPage() {
  return (
    <div style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <h1>Forgot Password</h1>
      <ForgotPasswordForm />
    </div>
  );
}