import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";

const DEV_EMAIL = "dev@oberkamose.cz";
const DEV_USERNAME = "Developer";
const DEV_PASSWORD = "dev123456";

export async function POST() {
  try {
    let user = await prisma.user.findUnique({ where: { email: DEV_EMAIL } });

    if (!user) {
      const passwordHash = await hashPassword(DEV_PASSWORD);
      user = await prisma.user.create({
        data: {
          email: DEV_EMAIL,
          username: DEV_USERNAME,
          passwordHash,
          avatarColor: "#22c55e",
        },
      });

      // Auto-create a default group for dev
      await prisma.group.create({
        data: {
          name: "Dev Party",
          slug: "dev-party",
          description: "Testovací skupina pro vývoj",
          avatarColor: "#3b82f6",
          members: { create: { userId: user.id, role: "OWNER" } },
        },
      });
    }

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
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[dev auth]", error);
    return NextResponse.json({ error: "Failed to create dev user" }, { status: 500 });
  }
}
