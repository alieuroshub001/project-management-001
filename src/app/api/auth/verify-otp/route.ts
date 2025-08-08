import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { OtpTokenModel } from "@/models/OtpToken";
import { UserModel } from "@/models/User";
import { verifyOtpSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = verifyOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
    }
    const { email, code, purpose } = parsed.data;

    await connectToDatabase();

    const token = await OtpTokenModel.findOne({ email, code, purpose, consumedAt: { $exists: false } });
    if (!token) {
      return NextResponse.json({ success: false, error: "Invalid or expired OTP" }, { status: 400 });
    }
    if (token.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ success: false, error: "OTP expired" }, { status: 400 });
    }
    token.consumedAt = new Date();
    await token.save();

    if (purpose === "SIGNUP") {
      await UserModel.updateOne({ _id: token.userId }, { $set: { isVerified: true } });
    }

    return NextResponse.json({ success: true, data: { email, purpose } });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}