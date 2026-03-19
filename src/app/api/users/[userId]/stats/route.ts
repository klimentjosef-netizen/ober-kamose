import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, notFound, serverError } from "@/lib/middleware";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return unauthorized();

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { id: true, username: true, avatarColor: true },
    });
    if (!user) return notFound("User not found");

    // Game participation
    const gamePlayers = await prisma.gamePlayer.findMany({
      where: { userId: params.userId },
      include: {
        game: {
          include: {
            players: { include: { user: { select: { username: true } } } },
            goalEvents: true,
            _count: { select: { goalEvents: true } },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
      take: 20,
    });

    const totalGames = gamePlayers.length;

    // Goals and assists
    const goalEvents = await prisma.goalEvent.findMany({
      where: {
        game: { players: { some: { userId: params.userId } } },
        undone: false,
      },
      include: { footballPlayer: true },
    });

    // Find which playerIndex this user was in each game
    const gameIndexMap = Object.fromEntries(
      gamePlayers.map((gp) => [gp.gameId, gp.playerIndex])
    );

    const myGoals = goalEvents.filter(
      (e) => gameIndexMap[e.gameId] === e.playerIndex && e.eventType === "GOAL"
    ).length;

    const myAssists = goalEvents.filter(
      (e) => gameIndexMap[e.gameId] === e.playerIndex && e.eventType === "ASSIST"
    ).length;

    // Favorite player (most drafted)
    const draftPicks = await prisma.draftPick.findMany({
      where: { userId: params.userId },
      include: { footballPlayer: true },
    });

    const playerCounts: Record<string, { name: string; count: number }> = {};
    for (const pick of draftPicks) {
      const name = pick.footballPlayer.name;
      if (!playerCounts[name]) playerCounts[name] = { name, count: 0 };
      playerCounts[name].count++;
    }
    const favoritePlayer = Object.values(playerCounts)
      .sort((a, b) => b.count - a.count)[0]?.name ?? null;

    // Debts
    const debts = await prisma.debt.findMany({
      where: { OR: [{ fromId: params.userId }, { toId: params.userId }] },
    });

    const totalPaid = debts
      .filter((d) => d.fromId === params.userId)
      .reduce((s, d) => s + d.amount, 0);
    const totalReceived = debts
      .filter((d) => d.toId === params.userId)
      .reduce((s, d) => s + d.amount, 0);

    // Recent games
    const recentGames = gamePlayers.slice(0, 5).map((gp) => {
      const myIdx = gp.playerIndex;
      const myGoalsInGame = gp.game.goalEvents.filter(
        (e) => e.playerIndex === myIdx && e.eventType === "GOAL" && !e.undone
      ).length;
      const myAssistsInGame = gp.game.goalEvents.filter(
        (e) => e.playerIndex === myIdx && e.eventType === "ASSIST" && !e.undone
      ).length;
      const opponents = gp.game.players
        .filter((p) => p.userId !== params.userId)
        .map((p) => p.user.username);

      return {
        gameId: gp.gameId,
        roomCode: gp.game.roomCode,
        groupName: null,
        finishedAt: gp.game.finishedAt,
        myGoals: myGoalsInGame,
        myAssists: myAssistsInGame,
        myEarnings: 0,
        myPayments: 0,
        opponents,
      };
    });

    return NextResponse.json({
      userId: user.id,
      username: user.username,
      avatarColor: user.avatarColor,
      totalGames,
      totalGoalsScored: myGoals,
      totalAssistsScored: myAssists,
      totalPaid,
      totalReceived,
      netBalance: totalReceived - totalPaid,
      favoritePlayer,
      winRate: 0,
      recentGames,
    });
  } catch (err) {
    console.error("[stats GET]", err);
    return serverError();
  }
}
