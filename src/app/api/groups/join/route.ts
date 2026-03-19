import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, badRequest, notFound, serverError } from "@/lib/middleware";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return unauthorized();

    const body = await req.json();
    const { inviteCode } = body;
    if (!inviteCode) return badRequest("Invite code is required");

    const group = await prisma.group.findUnique({ where: { inviteCode } });
    if (!group) return notFound("Invalid invite code");

    const existing = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId: auth.userId, groupId: group.id } },
    });
    if (existing) return badRequest("Already a member of this group");

    await prisma.groupMember.create({
      data: { userId: auth.userId, groupId: group.id, role: "MEMBER" },
    });

    const updated = await prisma.group.findUnique({
      where: { id: group.id },
      include: {
        members: {
          include: { user: { select: { id: true, username: true, avatarColor: true, email: true } } },
        },
        _count: { select: { games: true } },
      },
    });

    return NextResponse.json({ group: updated });
  } catch (err) {
    console.error("[groups/join POST]", err);
    return serverError();
  }
}
