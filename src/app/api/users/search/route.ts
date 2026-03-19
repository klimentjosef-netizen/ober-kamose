import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, badRequest, serverError } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return unauthorized();

    const q = req.nextUrl.searchParams.get("q")?.trim();
    if (!q || q.length < 2) return badRequest("Hledaný výraz musí mít alespoň 2 znaky");

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: auth.userId } },
          {
            OR: [
              { username: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          },
        ],
      },
      select: { id: true, username: true, email: true, avatarColor: true },
      take: 10,
    });

    return NextResponse.json({ users });
  } catch (err) {
    console.error("[users/search]", err);
    return serverError();
  }
}
