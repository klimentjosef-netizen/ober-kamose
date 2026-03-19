import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { JWTPayload, AuthUser } from "@/types";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-secret-change-in-production-min-32"
);

const TOKEN_EXPIRY = "7d";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      username: payload.username as string,
    };
  } catch {
    return null;
  }
}

export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

export function getTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
  return match ? match[1] : null;
}

export function avatarInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

import { AVATAR_COLORS } from "./constants";

export { AVATAR_COLORS };

export function randomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}
