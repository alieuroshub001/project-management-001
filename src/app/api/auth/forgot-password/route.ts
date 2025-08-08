import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";
import { OtpTokenModel } from "@/models/OtpToken";
import { forgotPasswordSchema } from "@/lib/validation";
import { sendOtpEmail } from "@/lib/mailer";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
    }

    const { email } = parsed.data;
    await connectToDatabase();
    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: true, data: true });
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await OtpTokenModel.create({ userId: user._id, email, code, purpose: "FORGOT_PASSWORD", expiresAt });
    await sendOtpEmail(email, code, "FORGOT_PASSWORD");

    return NextResponse.json({ success: true, data: true });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}