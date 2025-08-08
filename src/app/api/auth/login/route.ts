import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";
import { verifyPassword } from "@/lib/auth";
import { signJwt, setAuthCookie } from "@/lib/jwt";
import { loginSchema } from "@/lib/validation";
import { SessionModel } from "@/models/Session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
    }
    const { email, password } = parsed.data;

    await connectToDatabase();

    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }
    if (!user.isVerified) {
      return NextResponse.json({ success: false, error: "Account not verified" }, { status: 403 });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await SessionModel.create({
      userId: user._id,
      userAgent: req.headers.get("user-agent") || undefined,
      ip: undefined,
      active: true,
      expiresAt,
    });

    const token = await signJwt(
      { sub: String(user._id), role: user.role, email: user.email, sessionId: String(session._id) },
      60 * 60 * 24 * 7
    );
    await setAuthCookie(token);

    return NextResponse.json({ success: true, data: { token } });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}