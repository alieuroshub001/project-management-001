import { NextResponse } from "next/server";
import { clearAuthCookie, verifyJwt } from "@/lib/jwt";
import { connectToDatabase } from "@/lib/db";
import { SessionModel } from "@/models/Session";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("cookie")?.match(/auth_token=([^;]+)/)?.[1];
    if (token) {
      const payload = await verifyJwt(token);
      if (payload) {
        await connectToDatabase();
        await SessionModel.updateOne({ _id: payload.sessionId }, { $set: { active: false } });
      }
    }
    await clearAuthCookie();
    return NextResponse.json({ success: true, data: true });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}