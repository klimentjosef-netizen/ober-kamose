import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, badRequest, serverError } from "@/lib/middleware";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return unauthorized();

    const groups = await prisma.group.findMany({
      where: { members: { some: { userId: auth.userId } } },
      include: {
        members: {
          include: { user: { select: { id: true, username: true, avatarColor: true, email: true } } },
        },
        _count: { select: { games: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ groups });
  } catch (err) {
    console.error("[groups GET]", err);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return unauthorized();

    const body = await req.json();
    const { name, description } = body;

    if (!name || name.length < 2 || name.length > 40) {
      return badRequest("Group name must be 2-40 characters");
    }

    let slug = generateSlug(name);
    const existing = await prisma.group.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const group = await prisma.group.create({
      data: {
        name,
        slug,
        description: description ?? null,
        members: {
          create: {
            userId: auth.userId,
            role: "OWNER",
          },
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, username: true, avatarColor: true, email: true } } },
        },
        _count: { select: { games: true } },
      },
    });

    return NextResponse.json({ group }, { status: 201 });
  } catch (err) {
    console.error("[groups POST]", err);
    return serverError();
  }
}
