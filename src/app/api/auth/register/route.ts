import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, randomAvatarColor } from "@/lib/auth";
import { badRequest, serverError } from "@/lib/middleware";
import { RegisterRequest } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: RegisterRequest = await req.json();
    const { email, username, password } = body;

    if (!email || !username || !password) {
      return badRequest("Email, username and password are required");
    }
    if (password.length < 6) {
      return badRequest("Password must be at least 6 characters");
    }
    if (username.length < 3 || username.length > 20) {
      return badRequest("Username must be 3-20 characters");
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return badRequest("Username can only contain letters, numbers and underscores");
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: email.toLowerCase() }, { username }] },
    });
    if (existing) {
      return badRequest(
        existing.email === email.toLowerCase() ? "Email already in use" : "Username already taken"
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username,
        passwordHash,
        avatarColor: randomAvatarColor(),
      },
    });

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
    console.error("[register]", error);
    return serverError();
  }
}
