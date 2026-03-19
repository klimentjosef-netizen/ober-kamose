import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, badRequest, notFound, serverError } from "@/lib/middleware";

export async function POST(
  req: NextRequest,
  { params }: { params: { groupId: string; betId: string } }
) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return unauthorized();

    const bet = await prisma.bet.findUnique({
      where: { id: params.betId },
      include: { participants: true },
    });

    if (!bet) return notFound("Bet not found");
    if (bet.groupId !== params.groupId) return notFound("Bet not found in this group");
    if (bet.status !== "OPEN") return badRequest("Bet is already resolved or cancelled");

    const body = await req.json();
    const { action, winnerSide } = body;

    if (action === "cancel") {
      const updated = await prisma.bet.update({
        where: { id: params.betId },
        data: { status: "CANCELLED", resolvedAt: new Date() },
        include: {
          createdBy: { select: { id: true, username: true, avatarColor: true } },
          participants: {
            include: { user: { select: { id: true, username: true, avatarColor: true } } },
          },
          group: { select: { id: true, name: true } },
        },
      });
      return NextResponse.json({ bet: updated });
    }

    if (!winnerSide) return badRequest("winnerSide is required to resolve");

    // Mark winners and losers
    await prisma.$transaction(async (tx) => {
      for (const p of bet.participants) {
        await tx.betParticipant.update({
          where: { id: p.id },
          data: { isWinner: p.side === winnerSide },
        });
      }

      await tx.bet.update({
        where: { id: params.betId },
        data: { status: "RESOLVED", resolvedAt: new Date() },
      });

      // Create debt entries if amount > 0
      if (bet.amount > 0) {
        const winners = bet.participants.filter((p) => p.side === winnerSide);
        const losers = bet.participants.filter((p) => p.side !== winnerSide);

        for (const loser of losers) {
          for (const winner of winners) {
            const perPersonAmount = Math.round(bet.amount / winners.length);
            await tx.debt.create({
              data: {
                amount: perPersonAmount,
                description: `Sázka: ${bet.title}`,
                groupId: bet.groupId,
                fromId: loser.userId,
                toId: winner.userId,
              },
            });
          }
        }
      }
    });

    const updated = await prisma.bet.findUnique({
      where: { id: params.betId },
      include: {
        createdBy: { select: { id: true, username: true, avatarColor: true } },
        participants: {
          include: { user: { select: { id: true, username: true, avatarColor: true } } },
        },
        group: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ bet: updated });
  } catch (err) {
    console.error("[bets resolve POST]", err);
    return serverError();
  }
}
