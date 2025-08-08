import nodemailer from "nodemailer";

const EMAIL_SERVICE = process.env.EMAIL_SERVICE;
const EMAIL_USERNAME = process.env.EMAIL_USERNAME;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM || process.env.MAIL_FROM || "no-reply@example.com";
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || EMAIL_USERNAME;
const SMTP_PASS = process.env.SMTP_PASS || EMAIL_PASSWORD;

if (!SMTP_USER || !SMTP_PASS) {
  // Allow missing in dev; will throw on send
}

export const transporter = nodemailer.createTransport(
  EMAIL_SERVICE
    ? { service: EMAIL_SERVICE, auth: { user: SMTP_USER, pass: SMTP_PASS } }
    : { host: SMTP_HOST, port: SMTP_PORT, secure: SMTP_PORT === 465, auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined }
);

export async function sendOtpEmail(to: string, code: string, purpose: string) {
  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error("Email configuration is missing");
  }
  const subject = purpose === "SIGNUP" ? "Your Signup OTP" : "Your Password Reset OTP";
  const html = `<div style="font-family:sans-serif">
    <h2>${subject}</h2>
    <p>Use the following OTP code to proceed:</p>
    <div style="font-size:24px;font-weight:bold;letter-spacing:4px">${code}</div>
    <p>This code will expire in 10 minutes.</p>
  </div>`;
  await transporter.sendMail({ from: EMAIL_FROM, to, subject, html });
}