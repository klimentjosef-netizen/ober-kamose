import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, badRequest, notFound, serverError } from "@/lib/middleware";

export async function GET(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return unauthorized();

    const group = await prisma.group.findUnique({
      where: { id: params.groupId },
      include: { members: true },
    });
    if (!group) return notFound("Group not found");

    const isMember = group.members.some((m) => m.userId === auth.userId);
    if (!isMember) return unauthorized();

    const bets = await prisma.bet.findMany({
      where: { groupId: params.groupId },
      include: {
        createdBy: { select: { id: true, username: true, avatarColor: true } },
        participants: {
          include: { user: { select: { id: true, username: true, avatarColor: true } } },
        },
        group: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bets });
  } catch (err) {
    console.error("[bets GET]", err);
    return serverError();
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return unauthorized();

    const group = await prisma.group.findUnique({
      where: { id: params.groupId },
      include: { members: true },
    });
    if (!group) return notFound("Group not found");

    const isMember = group.members.some((m) => m.userId === auth.userId);
    if (!isMember) return unauthorized();

    const body = await req.json();
    const { title, description, amount, participants } = body;

    if (!title || title.length < 2) return badRequest("Title must be at least 2 characters");
    if (amount < 0) return badRequest("Amount cannot be negative");

    // Validate all participants are group members
    const memberIds = group.members.map((m) => m.userId);
    const participantList = participants ?? [];
    for (const p of participantList) {
      if (!memberIds.includes(p.userId)) {
        return badRequest(`User ${p.userId} is not a member of this group`);
      }
    }

    // Always include creator as participant if not already in list
    const creatorInList = participantList.some((p: any) => p.userId === auth.userId);

    const bet = await prisma.bet.create({
      data: {
        title,
        description: description ?? null,
        amount: amount ?? 0,
        groupId: params.groupId,
        createdById: auth.userId,
        participants: {
          create: [
            ...(!creatorInList
              ? [{ userId: auth.userId, side: participantList[0]?.side ?? "Za" }]
              : []),
            ...participantList.map((p: any) => ({
              userId: p.userId,
              side: p.side ?? "Proti",
            })),
          ],
        },
      },
      include: {
        createdBy: { select: { id: true, username: true, avatarColor: true } },
        participants: {
          include: { user: { select: { id: true, username: true, avatarColor: true } } },
        },
        group: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ bet }, { status: 201 });
  } catch (err) {
    console.error("[bets POST]", err);
    return serverError();
  }
}
