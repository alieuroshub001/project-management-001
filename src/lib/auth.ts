import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { NextRequest } from "next/server";
import { JwtPayload, UserRole } from "@/types";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me");
const JWT_ISSUER = process.env.JWT_ISSUER || "app";
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || "web";

export async function hashPassword(plain: string): Promise<string> {
  const bcrypt = await import("bcryptjs");
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.compare(plain, hash);
}

export async function signJwt(payload: Omit<JwtPayload, "iat" | "exp">, expiresInSeconds: number): Promise<string> {
  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(`${expiresInSeconds}s`)
    .sign(JWT_SECRET);
}

export async function verifyJwt<T extends JWTPayload = JwtPayload>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return payload as T;
  } catch {
    return null;
  }
}

export async function requireRole(req: NextRequest, roles: UserRole[]): Promise<JwtPayload | null> {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return null;
  const payload = await verifyJwt<JwtPayload>(token);
  if (!payload) return null;
  if (!roles.includes(payload.role)) return null;
  return payload;
}