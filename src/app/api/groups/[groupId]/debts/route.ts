import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, notFound, serverError } from "@/lib/middleware";
import { netDebts } from "@/lib/gameEngine";

export async function GET(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return unauthorized();

    const group = await prisma.group.findUnique({
      where: { id: params.groupId },
      include: { members: { include: { user: { select: { id: true, username: true, avatarColor: true, email: true } } } } },
    });
    if (!group) return notFound();

    const isMember = group.members.some((m) => m.userId === auth.userId);
    if (!isMember) return unauthorized();

    const debts = await prisma.debt.findMany({
      where: { groupId: params.groupId, status: { not: "SETTLED" } },
      include: {
        from: { select: { id: true, username: true, avatarColor: true } },
        to: { select: { id: true, username: true, avatarColor: true } },
        game: { select: { roomCode: true, finishedAt: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Build user map
    const userMap = Object.fromEntries(
      group.members.map((m) => [m.userId, m.user])
    );

    const rawDebts = debts.map((d) => ({
      fromId: d.fromId,
      fromUsername: d.from.username,
      toId: d.toId,
      toUsername: d.to.username,
      amount: d.amount,
    }));

    const netted = netDebts(rawDebts);

    // Attach usernames to netted results
    const nettedWithNames = netted.map((n) => ({
      ...n,
      fromUsername: userMap[n.fromId]?.username ?? n.fromId,
      fromAvatarColor: userMap[n.fromId]?.avatarColor ?? "#22c55e",
      toUsername: userMap[n.toId]?.username ?? n.toId,
      toAvatarColor: userMap[n.toId]?.avatarColor ?? "#22c55e",
    }));

    // Per-member summary
    const members = group.members.map((m) => {
      const owes = rawDebts
        .filter((d) => d.fromId === m.userId)
        .reduce((s, d) => s + d.amount, 0);
      const owed = rawDebts
        .filter((d) => d.toId === m.userId)
        .reduce((s, d) => s + d.amount, 0);
      return {
        userId: m.userId,
        username: m.user.username,
        avatarColor: m.user.avatarColor,
        owes,
        owed,
        net: owed - owes,
      };
    });

    return NextResponse.json({ debts: nettedWithNames, members, raw: debts });
  } catch (err) {
    console.error("[debts GET]", err);
    return serverError();
  }
}
