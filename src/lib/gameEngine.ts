import { DraftType, GameStatus, EventType } from "@prisma/client";
import {
  RoomState, PlayerSlot, FootballPlayerInfo, RosterPlayer,
  GoalEventInfo, DraftHistoryEntry, SwapHistoryEntry,
  GameSettings, MatchInfo, LineupData,
} from "@/types";
import { v4 as uuidv4 } from "uuid";

// ─── DRAFT ORDER ─────────────────────────────────────────────────────────────

export function buildDraftOrder(
  type: DraftType,
  playerCount: number,
  picksPerPlayer: number,
  startingPlayer: number
): number[] {
  const order: number[] = [];
  const players = Array.from({ length: playerCount }, (_, i) => i);
  const rotated = [...players.slice(startingPlayer), ...players.slice(0, startingPlayer)];

  if (type === DraftType.MANUAL) {
    for (let i = 0; i < picksPerPlayer; i++) {
      for (const p of rotated) order.push(p);
    }
  } else {
    // Snake: A-B-C-C-B-A-A-B-C-...
    for (let round = 0; round < picksPerPlayer; round++) {
      const roundOrder = round % 2 === 0 ? rotated : [...rotated].reverse();
      for (const p of roundOrder) order.push(p);
    }
  }
  return order;
}

// ─── PIGGY BANK CALCULATION ───────────────────────────────────────────────────

export interface PiggyBankEntry {
  fromPlayerIndex: number;
  toPlayerIndex: number;
  amount: number;
  goals: number;
  assists: number;
}

export interface PiggyBankSummary {
  entries: PiggyBankEntry[];
  totals: Record<number, { pays: number; receives: number; net: number }>;
}

export function calculatePiggyBank(
  state: RoomState
): PiggyBankSummary {
  const { players, rosters, goalEvents, settings } = state;
  const activeEvents = goalEvents.filter((e) => !e.undone);
  const entries: PiggyBankEntry[] = [];

  // For each pair of players, calculate what each owes the other
  for (let i = 0; i < players.length; i++) {
    for (let j = 0; j < players.length; j++) {
      if (i === j) continue;

      // Player i pays for goals/assists scored by player j's roster
      // (because player j's goals mean player i loses)
      const jEvents = activeEvents.filter((e) => e.playerIndex === j);
      const goals = jEvents.filter((e) => e.eventType === EventType.GOAL).length;
      const assists = jEvents.filter((e) => e.eventType === EventType.ASSIST).length;
      const amount = goals * settings.betPerGoal + assists * settings.betPerAssist;

      if (amount > 0) {
        entries.push({ fromPlayerIndex: i, toPlayerIndex: j, amount, goals, assists });
      }
    }
  }

  // Calculate totals per player
  const totals: Record<number, { pays: number; receives: number; net: number }> = {};
  for (let i = 0; i < players.length; i++) {
    const pays = entries.filter((e) => e.fromPlayerIndex === i).reduce((s, e) => s + e.amount, 0);
    const receives = entries.filter((e) => e.toPlayerIndex === i).reduce((s, e) => s + e.amount, 0);
    totals[i] = { pays, receives, net: receives - pays };
  }

  return { entries, totals };
}

// ─── DEBT NETTING (for group debt overview) ───────────────────────────────────

export interface NetDebt {
  fromId: string;
  fromUsername: string;
  toId: string;
  toUsername: string;
  amount: number;
}

export function netDebts(
  rawDebts: Array<{ fromId: string; fromUsername: string; toId: string; toUsername: string; amount: number }>
): NetDebt[] {
  const balances: Record<string, Record<string, number>> = {};

  for (const debt of rawDebts) {
    if (!balances[debt.fromId]) balances[debt.fromId] = {};
    if (!balances[debt.toId]) balances[debt.toId] = {};
    balances[debt.fromId][debt.toId] = (balances[debt.fromId][debt.toId] ?? 0) + debt.amount;
  }

  // Net bilateral debts
  const netted: NetDebt[] = [];
  const processed = new Set<string>();

  for (const fromId of Object.keys(balances)) {
    for (const toId of Object.keys(balances[fromId] ?? {})) {
      const key = [fromId, toId].sort().join("-");
      if (processed.has(key)) continue;
      processed.add(key);

      const ab = balances[fromId]?.[toId] ?? 0;
      const ba = balances[toId]?.[fromId] ?? 0;
      const net = ab - ba;

      if (net > 0) {
        netted.push({
          fromId,
          fromUsername: "",
          toId,
          toUsername: "",
          amount: net,
        });
      } else if (net < 0) {
        netted.push({
          fromId: toId,
          fromUsername: "",
          toId: fromId,
          toUsername: "",
          amount: Math.abs(net),
        });
      }
    }
  }

  return netted;
}

// ─── ROOM STATE FACTORY ───────────────────────────────────────────────────────

export function createInitialRoomState(
  gameId: string,
  roomCode: string,
  settings: GameSettings,
  host: PlayerSlot
): RoomState {
  return {
    gameId,
    roomCode,
    status: GameStatus.LOBBY,
    settings,
    players: [host],
    selectedMatchIds: [],
    matches: [],
    allPlayers: [],
    drafted: [],
    rosters: [[]],
    draftOrder: [],
    draftPos: 0,
    startingPlayer: 0,
    draftHistory: [],
    goalEvents: [],
    lineups: {},
    manualNotStarting: [],
    swapHistory: [],
  };
}

// ─── DRAFT HELPERS ────────────────────────────────────────────────────────────

export function getCurrentDrafter(state: RoomState): number {
  return state.draftOrder[state.draftPos] ?? 0;
}

export function isDraftComplete(state: RoomState): boolean {
  return state.draftPos >= state.draftOrder.length;
}

export function pickPlayer(
  state: RoomState,
  playerIdx: number,
  userId: string,
  username: string
): RoomState {
  if (state.drafted[playerIdx]) return state;

  const playerIndex = getCurrentDrafter(state);
  const fp = state.allPlayers[playerIdx];
  if (!fp) return state;

  const rosterPlayer: RosterPlayer = {
    ...fp,
    goals: 0,
    assists: 0,
    draftPickId: uuidv4(),
    allPlayersIdx: playerIdx,
  };

  const newDrafted = [...state.drafted];
  newDrafted[playerIdx] = true;

  const newRosters = state.rosters.map((r, i) =>
    i === playerIndex ? [...r, rosterPlayer] : r
  );

  const historyEntry: DraftHistoryEntry = {
    pick: state.draftPos + 1,
    playerIndex,
    username,
    playerName: fp.name,
    team: fp.team,
  };

  return {
    ...state,
    drafted: newDrafted,
    rosters: newRosters,
    draftPos: state.draftPos + 1,
    draftHistory: [...state.draftHistory, historyEntry],
    status: state.draftPos + 1 >= state.draftOrder.length
      ? GameStatus.ACTIVE
      : GameStatus.DRAFT,
  };
}

// ─── GOAL/ASSIST HELPERS ──────────────────────────────────────────────────────

export function addGoalEvent(
  state: RoomState,
  eventType: EventType,
  playerIndex: number,
  footballPlayerId: string,
  playerName: string,
  team: string
): RoomState {
  const event: GoalEventInfo = {
    id: uuidv4(),
    eventType,
    playerIndex,
    playerName,
    team,
    recordedAt: new Date().toISOString(),
    undone: false,
    footballPlayerId,
  };

  // Update roster counts
  const newRosters = state.rosters.map((roster, rIdx) => {
    if (rIdx !== playerIndex) return roster;
    return roster.map((p) => {
      if (p.id !== footballPlayerId) return p;
      return {
        ...p,
        goals: eventType === EventType.GOAL ? p.goals + 1 : p.goals,
        assists: eventType === EventType.ASSIST ? p.assists + 1 : p.assists,
      };
    });
  });

  return {
    ...state,
    goalEvents: [...state.goalEvents, event],
    rosters: newRosters,
  };
}

export function undoLastEvent(state: RoomState): RoomState {
  const lastActive = [...state.goalEvents]
    .reverse()
    .find((e) => !e.undone);
  if (!lastActive) return state;

  const newRosters = state.rosters.map((roster, rIdx) => {
    if (rIdx !== lastActive.playerIndex) return roster;
    return roster.map((p) => {
      if (p.id !== lastActive.footballPlayerId) return p;
      return {
        ...p,
        goals: lastActive.eventType === EventType.GOAL ? Math.max(0, p.goals - 1) : p.goals,
        assists: lastActive.eventType === EventType.ASSIST ? Math.max(0, p.assists - 1) : p.assists,
      };
    });
  });

  return {
    ...state,
    goalEvents: state.goalEvents.map((e) =>
      e.id === lastActive.id ? { ...e, undone: true } : e
    ),
    rosters: newRosters,
  };
}

// ─── SWAP HELPER ──────────────────────────────────────────────────────────────

export function swapPlayer(
  state: RoomState,
  playerIndex: number,
  rosterIdx: number,
  newPlayerIdx: number
): RoomState {
  const oldPlayer = state.rosters[playerIndex]?.[rosterIdx];
  const newFp = state.allPlayers[newPlayerIdx];
  if (!oldPlayer || !newFp) return state;

  const newRosterPlayer: RosterPlayer = {
    ...newFp,
    goals: 0,
    assists: 0,
    draftPickId: uuidv4(),
    allPlayersIdx: newPlayerIdx,
  };

  const newDrafted = [...state.drafted];
  newDrafted[oldPlayer.allPlayersIdx] = false;
  newDrafted[newPlayerIdx] = true;

  const newRosters = state.rosters.map((roster, i) => {
    if (i !== playerIndex) return roster;
    return roster.map((p, j) => (j === rosterIdx ? newRosterPlayer : p));
  });

  const swapEntry: SwapHistoryEntry = {
    playerIndex,
    oldPlayer: oldPlayer.name,
    newPlayer: newFp.name,
    time: new Date().toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" }),
  };

  return {
    ...state,
    drafted: newDrafted,
    rosters: newRosters,
    swapHistory: [...state.swapHistory, swapEntry],
  };
}
