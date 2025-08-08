import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";
import { OtpTokenModel } from "@/models/OtpToken";
import { hashPassword } from "@/lib/auth";
import { signupSchema } from "@/lib/validation";
import { sendOtpEmail } from "@/lib/mailer";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
    }
    const { email, password, fullName, role } = parsed.data;

    await connectToDatabase();

    const existing = await UserModel.findOne({ email });
    if (existing) {
      return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await UserModel.create({
      email,
      passwordHash,
      role,
      isVerified: false,
      profile: { fullName },
    });

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await OtpTokenModel.create({ userId: user._id, email, code, purpose: "SIGNUP", expiresAt });

    await sendOtpEmail(email, code, "SIGNUP");

    return NextResponse.json({ success: true, data: { userId: String(user._id), email } });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}