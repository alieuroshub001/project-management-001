import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";
import { verifyJwt } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const payload = await verifyJwt(token);
    if (!payload) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const user = await UserModel.findById(payload.sub).select("email role isVerified profile createdAt updatedAt");
    if (!user) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: user });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const payload = await verifyJwt(token);
    if (!payload) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const body = await req.json();
    const { updateProfileSchema } = await import("@/lib/validation");
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (parsed.data.fullName !== undefined) updates["profile.fullName"] = parsed.data.fullName;
    if (parsed.data.phone !== undefined) updates["profile.phone"] = parsed.data.phone;
    if (parsed.data.department !== undefined) updates["profile.department"] = parsed.data.department;

    if (parsed.data.avatarBase64) {
      const { uploadImage } = await import("@/lib/cloudinary");
      const { url } = await uploadImage(parsed.data.avatarBase64, "avatars");
      updates["profile.avatarUrl"] = url;
    }

    const user = await UserModel.findByIdAndUpdate(payload.sub, { $set: updates }, { new: true }).select(
      "email role isVerified profile createdAt updatedAt"
    );

    return NextResponse.json({ success: true, data: user });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}