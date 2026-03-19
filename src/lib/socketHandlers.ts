import { Server as SocketIOServer, Socket } from "socket.io";
import { prisma } from "./prisma";
import { verifyToken } from "./auth";
import {
  getRoom, setRoom, getClient, setClient, removeClient,
  getRoomPlayers, getUniqueRoomCode,
} from "./roomManager";
import {
  buildDraftOrder, createInitialRoomState, pickPlayer,
  addGoalEvent, undoLastEvent, swapPlayer as swapPlayerEngine,
  calculatePiggyBank,
} from "./gameEngine";
import { fetchUpcomingMatches, fetchSquadPlayers, fetchLineups } from "./footballApi";
import { GameStatus, DraftType, EventType } from "@prisma/client";
import { RoomState, PlayerSlot, FootballPlayerInfo } from "@/types";
import { v4 as uuidv4 } from "uuid";

export function registerSocketHandlers(io: SocketIOServer) {
  io.use(async (socket, next) => {
    const token =
      socket.handshake.auth?.token ??
      socket.handshake.headers?.cookie?.match(/token=([^;]+)/)?.[1];

    if (!token) return next(new Error("Authentication required"));

    const payload = await verifyToken(token);
    if (!payload) return next(new Error("Invalid token"));

    socket.data.userId = payload.userId;
    socket.data.username = payload.username;
    next();
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[WS] connected: ${socket.id} (${socket.data.username})`);

    socket.on("create_room", async (data) => {
      try {
        const { groupId, betPerGoal, betPerAssist, draftType, picksPerPlayer, customBetDescription } = data;
        const roomCode = getUniqueRoomCode();

        const game = await prisma.game.create({
          data: {
            roomCode,
            hostId: socket.data.userId,
            groupId: groupId ?? null,
            betPerGoal: betPerGoal ?? 100,
            betPerAssist: betPerAssist ?? 50,
            draftType: draftType ?? DraftType.MANUAL,
            picksPerPlayer: picksPerPlayer ?? 8,
            customBetDescription: customBetDescription ?? null,
            status: GameStatus.LOBBY,
          },
        });

        await prisma.gamePlayer.create({
          data: {
            gameId: game.id,
            userId: socket.data.userId,
            playerIndex: 0,
            isHost: true,
            isOnline: true,
          },
        });

        const user = await prisma.user.findUnique({
          where: { id: socket.data.userId },
          select: { id: true, username: true, avatarColor: true },
        });

        const hostSlot: PlayerSlot = {
          userId: socket.data.userId,
          username: socket.data.username,
          avatarColor: user?.avatarColor ?? "#22c55e",
          playerIndex: 0,
          isOnline: true,
          isHost: true,
        };

        const settings = {
          betPerGoal: game.betPerGoal,
          betPerAssist: game.betPerAssist,
          draftType: game.draftType,
          picksPerPlayer: game.picksPerPlayer,
          customBetDescription: game.customBetDescription ?? undefined,
        };

        const roomState = createInitialRoomState(game.id, roomCode, settings, hostSlot);
        setRoom(roomCode, roomState);
        setClient(socket.id, { roomCode, playerIndex: 0, userId: socket.data.userId, username: socket.data.username });

        socket.join(roomCode);

        const matches = await fetchUpcomingMatches();
        socket.emit("joined", { playerIndex: 0, roomCode, state: roomState, availableMatches: matches });
      } catch (err) {
        console.error("[create_room]", err);
        socket.emit("error", { text: "Failed to create room" });
      }
    });

    socket.on("join_room", async (data) => {
      try {
        const { roomCode } = data;
        const room = getRoom(roomCode);

        if (!room) {
          socket.emit("error", { text: "Room not found" });
          return;
        }
        if (room.status !== GameStatus.LOBBY) {
          socket.emit("error", { text: "Game already started" });
          return;
        }

        const existingPlayer = room.players.find((p) => p.userId === socket.data.userId);
        if (existingPlayer) {
          // Rejoin as existing player
          socket.join(roomCode);
          setClient(socket.id, { roomCode, playerIndex: existingPlayer.playerIndex, userId: socket.data.userId, username: socket.data.username });
          const matches = await fetchUpcomingMatches();
          socket.emit("joined", { playerIndex: existingPlayer.playerIndex, roomCode, state: room, availableMatches: matches });
          return;
        }

        const playerIndex = room.players.length;
        const user = await prisma.user.findUnique({
          where: { id: socket.data.userId },
          select: { id: true, username: true, avatarColor: true },
        });

        const newSlot: PlayerSlot = {
          userId: socket.data.userId,
          username: socket.data.username,
          avatarColor: user?.avatarColor ?? "#22c55e",
          playerIndex,
          isOnline: true,
          isHost: false,
        };

        await prisma.gamePlayer.create({
          data: {
            gameId: room.gameId,
            userId: socket.data.userId,
            playerIndex,
            isHost: false,
            isOnline: true,
          },
        });

        const updatedRoom: RoomState = {
          ...room,
          players: [...room.players, newSlot],
          rosters: [...room.rosters, []],
        };

        setRoom(roomCode, updatedRoom);
        setClient(socket.id, { roomCode, playerIndex, userId: socket.data.userId, username: socket.data.username });

        socket.join(roomCode);

        const matches = await fetchUpcomingMatches();
        socket.emit("joined", { playerIndex, roomCode, state: updatedRoom, availableMatches: matches });
        socket.to(roomCode).emit("state", { state: updatedRoom });
      } catch (err) {
        console.error("[join_room]", err);
        socket.emit("error", { text: "Failed to join room" });
      }
    });

    socket.on("select_match", async (data) => {
      const client = getClient(socket.id);
      if (!client) return;
      const room = getRoom(client.roomCode);
      if (!room || room.status !== GameStatus.LOBBY) return;
      if (client.playerIndex !== 0) return; // only host

      const { matchId, selected } = data;
      let selectedMatchIds = [...room.selectedMatchIds];

      if (selected && !selectedMatchIds.includes(matchId) && selectedMatchIds.length < 8) {
        selectedMatchIds.push(matchId);
      } else if (!selected) {
        selectedMatchIds = selectedMatchIds.filter((id) => id !== matchId);
      }

      const updated = { ...room, selectedMatchIds };
      setRoom(client.roomCode, updated);
      io.to(client.roomCode).emit("state", { state: updated });
    });

    socket.on("add_custom_match", async (data) => {
      const client = getClient(socket.id);
      if (!client) return;
      const room = getRoom(client.roomCode);
      if (!room || room.status !== GameStatus.LOBBY) return;
      if (client.playerIndex !== 0) return;

      const { home, away } = data;
      const customId = `custom_${uuidv4()}`;

      const dbMatch = await prisma.gameMatch.create({
        data: {
          gameId: room.gameId,
          isCustom: true,
          homeTeam: home,
          awayTeam: away,
        },
      });

      const customMatch = {
        id: customId,
        dbId: dbMatch.id,
        isCustom: true,
        homeTeam: home,
        awayTeam: away,
      };

      const updated = {
        ...room,
        matches: [...room.matches, customMatch],
        selectedMatchIds: [...room.selectedMatchIds, customId],
      };
      setRoom(client.roomCode, updated);
      io.to(client.roomCode).emit("state", { state: updated });
    });

    socket.on("start_game", async () => {
      const client = getClient(socket.id);
      if (!client) return;
      const room = getRoom(client.roomCode);
      if (!room || room.status !== GameStatus.LOBBY) return;
      if (client.playerIndex !== 0) return;
      if (room.selectedMatchIds.length === 0) {
        socket.emit("error", { text: "Select at least one match" });
        return;
      }

      try {
        // Fetch all players from selected matches
        const allPlayers: FootballPlayerInfo[] = [];
        for (const matchId of room.selectedMatchIds) {
          if (matchId.startsWith("custom_")) continue;
          const squadPlayers = await fetchSquadPlayers(matchId);
          allPlayers.push(...squadPlayers);
        }

        const playerCount = room.players.length;
        const startingPlayer = Math.floor(Math.random() * playerCount);
        const draftOrder = buildDraftOrder(
          room.settings.draftType,
          playerCount,
          room.settings.picksPerPlayer,
          startingPlayer
        );

        const updated: RoomState = {
          ...room,
          status: GameStatus.DRAFT,
          allPlayers,
          drafted: new Array(allPlayers.length).fill(false),
          draftOrder,
          draftPos: 0,
          startingPlayer,
        };

        await prisma.game.update({
          where: { id: room.gameId },
          data: { status: GameStatus.DRAFT, startedAt: new Date() },
        });

        setRoom(client.roomCode, updated);
        io.to(client.roomCode).emit("state", { state: updated });
      } catch (err) {
        console.error("[start_game]", err);
        socket.emit("error", { text: "Failed to start game" });
      }
    });

    socket.on("draft_pick", async (data) => {
      const client = getClient(socket.id);
      if (!client) return;
      const room = getRoom(client.roomCode);
      if (!room || room.status !== GameStatus.DRAFT) return;

      const currentDrafter = room.draftOrder[room.draftPos];
      if (client.playerIndex !== currentDrafter) return;

      const { playerIdx } = data;
      if (room.drafted[playerIdx]) return;

      const fp = room.allPlayers[playerIdx];
      if (!fp) return;

      const updated = pickPlayer(room, playerIdx, socket.data.userId, socket.data.username);

      // Persist draft pick
      await prisma.draftPick.create({
        data: {
          gameId: room.gameId,
          userId: socket.data.userId,
          footballPlayerId: fp.id,
          pickNumber: room.draftPos + 1,
          playerIndex: client.playerIndex,
        },
      }).catch(console.error);

      if (updated.status === GameStatus.ACTIVE) {
        await prisma.game.update({
          where: { id: room.gameId },
          data: { status: GameStatus.ACTIVE },
        }).catch(console.error);
      }

      setRoom(client.roomCode, updated);
      io.to(client.roomCode).emit("state", { state: updated });
    });

    socket.on("add_goal", async (data) => {
      const client = getClient(socket.id);
      if (!client) return;
      const room = getRoom(client.roomCode);
      if (!room || room.status !== GameStatus.ACTIVE) return;

      const { footballPlayerId, playerName, owner } = data;
      const updated = addGoalEvent(room, EventType.GOAL, owner, footballPlayerId, playerName, "");

      await prisma.goalEvent.create({
        data: {
          gameId: room.gameId,
          scoredById: socket.data.userId,
          footballPlayerId,
          eventType: EventType.GOAL,
          playerIndex: owner,
          playerName,
          team: "",
        },
      }).catch(console.error);

      setRoom(client.roomCode, updated);
      io.to(client.roomCode).emit("state", { state: updated });
    });

    socket.on("add_assist", async (data) => {
      const client = getClient(socket.id);
      if (!client) return;
      const room = getRoom(client.roomCode);
      if (!room || room.status !== GameStatus.ACTIVE) return;

      const { footballPlayerId, playerName, owner } = data;
      const updated = addGoalEvent(room, EventType.ASSIST, owner, footballPlayerId, playerName, "");

      await prisma.goalEvent.create({
        data: {
          gameId: room.gameId,
          scoredById: socket.data.userId,
          footballPlayerId,
          eventType: EventType.ASSIST,
          playerIndex: owner,
          playerName,
          team: "",
        },
      }).catch(console.error);

      setRoom(client.roomCode, updated);
      io.to(client.roomCode).emit("state", { state: updated });
    });

    socket.on("undo_last_event", async () => {
      const client = getClient(socket.id);
      if (!client) return;
      const room = getRoom(client.roomCode);
      if (!room || room.status !== GameStatus.ACTIVE) return;

      const updated = undoLastEvent(room);
      const undoneEvent = room.goalEvents.filter((e) => !e.undone).slice(-1)[0];

      if (undoneEvent) {
        await prisma.goalEvent.update({
          where: { id: undoneEvent.id },
          data: { undone: true },
        }).catch(console.error);
      }

      setRoom(client.roomCode, updated);
      io.to(client.roomCode).emit("state", { state: updated });
    });

    socket.on("swap_player", async (data) => {
      const client = getClient(socket.id);
      if (!client) return;
      const room = getRoom(client.roomCode);
      if (!room || room.status !== GameStatus.ACTIVE) return;

      const { rosterIdx, newPlayerIdx } = data;
      const updated = swapPlayerEngine(room, client.playerIndex, rosterIdx, newPlayerIdx);

      setRoom(client.roomCode, updated);
      io.to(client.roomCode).emit("state", { state: updated });
    });

    socket.on("check_lineups", async () => {
      const client = getClient(socket.id);
      if (!client) return;
      const room = getRoom(client.roomCode);
      if (!room) return;

      try {
        const lineups: Record<string, any> = {};
        for (const matchId of room.selectedMatchIds) {
          if (!matchId.startsWith("custom_")) {
            const data = await fetchLineups(matchId);
            if (data) lineups[matchId] = data;
          }
        }

        const updated = { ...room, lineups };
        setRoom(client.roomCode, updated);
        socket.emit("toast", { text: "Sestavy aktualizovány", isError: false });
        io.to(client.roomCode).emit("state", { state: updated });
      } catch (err) {
        socket.emit("toast", { text: "Nepodařilo se načíst sestavy", isError: true });
      }
    });

    socket.on("mark_not_starting", (data) => {
      const client = getClient(socket.id);
      if (!client) return;
      const room = getRoom(client.roomCode);
      if (!room) return;

      const key = `${data.playerName}|${data.teamName}`;
      const manualNotStarting = room.manualNotStarting.includes(key)
        ? room.manualNotStarting.filter((k) => k !== key)
        : [...room.manualNotStarting, key];

      const updated = { ...room, manualNotStarting };
      setRoom(client.roomCode, updated);
      io.to(client.roomCode).emit("state", { state: updated });
    });

    socket.on("chat", async (data) => {
      const client = getClient(socket.id);
      if (!client) return;
      const room = getRoom(client.roomCode);
      if (!room) return;

      const msg = {
        username: socket.data.username,
        text: data.text.slice(0, 200),
        time: new Date().toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" }),
        playerIndex: client.playerIndex,
      };

      await prisma.chatMessage.create({
        data: {
          gameId: room.gameId,
          userId: socket.data.userId,
          text: msg.text,
          playerIndex: client.playerIndex,
        },
      }).catch(console.error);

      io.to(client.roomCode).emit("chat", msg);
    });

    socket.on("ping", () => socket.emit("pong"));

    socket.on("disconnect", async () => {
      const client = getClient(socket.id);
      if (!client) return;

      const room = getRoom(client.roomCode);
      if (room) {
        const updated: RoomState = {
          ...room,
          players: room.players.map((p) =>
            p.userId === client.userId ? { ...p, isOnline: false } : p
          ),
        };
        setRoom(client.roomCode, updated);
        socket.to(client.roomCode).emit("state", { state: updated });
      }

      await prisma.gamePlayer.updateMany({
        where: { gameId: room?.gameId, userId: client.userId },
        data: { isOnline: false },
      }).catch(console.error);

      removeClient(socket.id);
      console.log(`[WS] disconnected: ${socket.id} (${client.username})`);
    });
  });
}
