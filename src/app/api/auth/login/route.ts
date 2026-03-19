import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";
import { badRequest, serverError } from "@/lib/middleware";
import { LoginRequest } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: LoginRequest = await req.json();
    const { email, password } = body;

    if (!email || !password) return badRequest("Email and password are required");

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) return badRequest("Invalid email or password");

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return badRequest("Invalid email or password");

    const token = await signToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, username: user.username, avatarColor: user.avatarColor },
      token,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[login]", error);
    return serverError();
  }
}
