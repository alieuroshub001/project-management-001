import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/jwt";

const ROLE_PATH_PREFIX: Record<string, string> = {
  ADMIN: "/admin",
  TEAM: "/team",
  HR: "/hr",
  CLIENT: "/client",
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard dashboard namespaces
  const guarded = ["/admin", "/team", "/hr", "/client"];
  const needsGuard = guarded.some((p) => pathname.startsWith(p));
  if (!needsGuard) return NextResponse.next();

  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  const payload = await verifyJwt(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Role-path enforcement
  const allowedPrefix = ROLE_PATH_PREFIX[payload.role];
  if (!allowedPrefix || !pathname.startsWith(allowedPrefix)) {
    return NextResponse.redirect(new URL(allowedPrefix || "/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/team/:path*", "/hr/:path*", "/client/:path*"],
};