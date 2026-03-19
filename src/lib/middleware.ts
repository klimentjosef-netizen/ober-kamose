import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromCookie, getTokenFromHeader } from "./auth";
import { JWTPayload } from "@/types";

export async function getAuthUser(req: NextRequest): Promise<JWTPayload | null> {
  const cookieToken = getTokenFromCookie(req.headers.get("cookie"));
  const headerToken = getTokenFromHeader(req.headers.get("authorization"));
  const token = cookieToken ?? headerToken;
  if (!token) return null;
  return verifyToken(token);
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}
