

export default function Home() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Project Management System</h1>
      <p>Use the API endpoints for signup, OTP verification, login, and reset password.</p>
      <ul>
        <li><a href="/login">Login</a></li>
        <li><a href="/admin">Admin Dashboard</a></li>
        <li><a href="/team">Team Dashboard</a></li>
        <li><a href="/hr">HR Dashboard</a></li>
        <li><a href="/client">Client Dashboard</a></li>
      </ul>
    </div>
  );
}
