import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { OtpTokenModel } from "@/models/OtpToken";
import { UserModel } from "@/models/User";
import { resetPasswordSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
    }
    const { email, code, newPassword } = parsed.data;

    await connectToDatabase();

    const token = await OtpTokenModel.findOne({ email, code, purpose: "FORGOT_PASSWORD", consumedAt: { $exists: false } });
    if (!token || token.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ success: false, error: "Invalid or expired OTP" }, { status: 400 });
    }

    const user = await UserModel.findOne({ _id: token.userId, email });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    token.consumedAt = new Date();
    await token.save();

    return NextResponse.json({ success: true, data: true });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}