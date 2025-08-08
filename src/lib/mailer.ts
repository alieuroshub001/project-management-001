import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const MAIL_FROM = process.env.MAIL_FROM || "no-reply@example.com";

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  // Allow missing in dev; will throw on send
}

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

export async function sendOtpEmail(to: string, code: string, purpose: string) {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP configuration is missing");
  }
  const subject = purpose === "SIGNUP" ? "Your Signup OTP" : "Your Password Reset OTP";
  const html = `<div style="font-family:sans-serif">
    <h2>${subject}</h2>
    <p>Use the following OTP code to proceed:</p>
    <div style="font-size:24px;font-weight:bold;letter-spacing:4px">${code}</div>
    <p>This code will expire in 10 minutes.</p>
  </div>`;
  await transporter.sendMail({ from: MAIL_FROM, to, subject, html });
}