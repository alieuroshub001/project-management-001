import SignupForm from "@/components/auth/signup";

export default function SignupPage() {
  return (
    <div style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <h1>Sign up</h1>
      <SignupForm />
    </div>
  );
}