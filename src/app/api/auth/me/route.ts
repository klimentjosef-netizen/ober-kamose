import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, serverError } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return unauthorized();

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { id: true, email: true, username: true, avatarColor: true },
    });
    if (!user) return unauthorized();

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[me]", error);
    return serverError();
  }
}
