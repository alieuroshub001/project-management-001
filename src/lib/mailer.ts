import nodemailer from "nodemailer";

const EMAIL_SERVICE = process.env.EMAIL_SERVICE; // gmail
const EMAIL_USER = process.env.EMAIL_USERNAME;
const EMAIL_PASS = process.env.EMAIL_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM || "no-reply@example.com";

if (!EMAIL_SERVICE || !EMAIL_USER || !EMAIL_PASS) {
  throw new Error("Email configuration is missing in environment variables.");
}

export const transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export async function sendOtpEmail(to: string, code: string, purpose: "SIGNUP" | "FORGOT_PASSWORD") {
  const subject = purpose === "SIGNUP" ? "Your Signup OTP" : "Your Password Reset OTP";

  const html = `<div style="font-family:sans-serif">
    <h2>${subject}</h2>
    <p>Use the following OTP code to proceed:</p>
    <div style="font-size:24px;font-weight:bold;letter-spacing:4px">${code}</div>
    <p>This code will expire in 10 minutes.</p>
  </div>`;

  await transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject,
    html,
  });
}
