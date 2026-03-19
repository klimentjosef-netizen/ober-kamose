import { GameStatus, DraftType, EventType, DebtStatus, GroupMemberRole, BetStatus } from "@prisma/client";

export type { GameStatus, DraftType, EventType, DebtStatus, GroupMemberRole, BetStatus };

// ─── AUTH ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  avatarColor: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

// ─── GROUPS ──────────────────────────────────────────────────────────────────

export interface GroupWithMembers {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatarColor: string;
  inviteCode: string;
  createdAt: Date;
  members: GroupMemberWithUser[];
  _count: { games: number };
}

export interface GroupMemberWithUser {
  id: string;
  role: GroupMemberRole;
  joinedAt: Date;
  user: AuthUser;
}

// ─── GAME STATE (WebSocket, in-memory + DB sync) ──────────────────────────────

export interface PlayerSlot {
  userId: string;
  username: string;
  avatarColor: string;
  playerIndex: number;
  isOnline: boolean;
  isHost: boolean;
}

export interface MatchInfo {
  id: string;
  apiMatchId?: string;
  isCustom: boolean;
  homeTeam: string;
  awayTeam: string;
  matchDate?: string;
  competition?: string;
}

export interface FootballPlayerInfo {
  id: string;
  name: string;
  team: string;
  position?: string;
  matchId: string;
  isCustom: boolean;
  allPlayersIdx: number;
}

export interface RosterPlayer extends FootballPlayerInfo {
  goals: number;
  assists: number;
  draftPickId: string;
}

export interface GameSettings {
  betPerGoal: number;
  betPerAssist: number;
  draftType: DraftType;
  picksPerPlayer: number;
  customBetDescription?: string;
}

export interface GoalEventInfo {
  id: string;
  eventType: EventType;
  playerIndex: number;
  playerName: string;
  team: string;
  recordedAt: string;
  undone: boolean;
  footballPlayerId: string;
}

export interface RoomState {
  gameId: string;
  roomCode: string;
  status: GameStatus;
  settings: GameSettings;
  players: PlayerSlot[];
  selectedMatchIds: string[];
  matches: MatchInfo[];
  allPlayers: FootballPlayerInfo[];
  drafted: boolean[];
  rosters: RosterPlayer[][];
  draftOrder: number[];
  draftPos: number;
  startingPlayer: number;
  draftHistory: DraftHistoryEntry[];
  goalEvents: GoalEventInfo[];
  lineups: Record<string, LineupData>;
  manualNotStarting: string[];
  swapHistory: SwapHistoryEntry[];
}

export interface DraftHistoryEntry {
  pick: number;
  playerIndex: number;
  username: string;
  playerName: string;
  team: string;
}

export interface SwapHistoryEntry {
  playerIndex: number;
  oldPlayer: string;
  newPlayer: string;
  time: string;
}

export interface LineupData {
  home: TeamLineup;
  away: TeamLineup;
}

export interface TeamLineup {
  team: string;
  formation: string;
  lineup: LineupPlayer[];
  bench: LineupPlayer[];
}

export interface LineupPlayer {
  name: string;
  position: string;
  shirtNumber?: number;
}

// ─── WEBSOCKET MESSAGES ───────────────────────────────────────────────────────

export type ClientToServerEvents = {
  // Room
  create_room: (data: CreateRoomPayload) => void;
  join_room: (data: JoinRoomPayload) => void;
  rejoin_room: (data: RejoinRoomPayload) => void;
  // Lobby
  select_match: (data: { matchId: string; selected: boolean }) => void;
  add_custom_match: (data: { home: string; away: string }) => void;
  start_game: () => void;
  // Draft
  draft_pick: (data: { playerIdx: number }) => void;
  // Game
  add_goal: (data: { footballPlayerId: string; playerName: string; owner: number }) => void;
  add_assist: (data: { footballPlayerId: string; playerName: string; owner: number }) => void;
  undo_last_event: () => void;
  check_lineups: () => void;
  swap_player: (data: { rosterIdx: number; newPlayerIdx: number }) => void;
  mark_not_starting: (data: { playerName: string; teamName: string }) => void;
  // Chat
  chat: (data: { text: string }) => void;
  ping: () => void;
};

export type ServerToClientEvents = {
  joined: (data: { playerIndex: number; roomCode: string; state: RoomState; availableMatches: MatchInfo[] }) => void;
  state: (data: { state: RoomState }) => void;
  chat: (data: { username: string; text: string; time: string; playerIndex: number }) => void;
  toast: (data: { text: string; isError: boolean }) => void;
  error: (data: { text: string }) => void;
  pong: () => void;
};

export interface CreateRoomPayload {
  groupId?: string;
  betPerGoal: number;
  betPerAssist: number;
  draftType: DraftType;
  picksPerPlayer: number;
  customBetDescription?: string;
}

export interface JoinRoomPayload {
  roomCode: string;
}

export interface RejoinRoomPayload {
  roomCode: string;
  playerIndex: number;
}

// ─── BETS ─────────────────────────────────────────────────────────────────────

export interface BetInfo {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  status: BetStatus;
  createdAt: string;
  resolvedAt: string | null;
  createdBy: { id: string; username: string; avatarColor: string };
  participants: BetParticipantInfo[];
  group: { id: string; name: string };
}

export interface BetParticipantInfo {
  id: string;
  side: string;
  isWinner: boolean | null;
  user: { id: string; username: string; avatarColor: string };
}

export interface CreateBetRequest {
  title: string;
  description?: string;
  amount: number;
  participants: { userId: string; side: string }[];
}

export interface ResolveBetRequest {
  winnerSide: string;
}

// ─── DEBT & STATS ─────────────────────────────────────────────────────────────

export interface DebtSummary {
  userId: string;
  username: string;
  avatarColor: string;
  owes: number;
  owed: number;
  net: number;
}

export interface GroupDebtOverview {
  groupId: string;
  members: DebtSummary[];
  pairs: DebtPair[];
}

export interface DebtPair {
  fromId: string;
  fromUsername: string;
  toId: string;
  toUsername: string;
  amount: number;
}

export interface UserStats {
  userId: string;
  username: string;
  totalGames: number;
  totalGoalsScored: number;
  totalAssistsScored: number;
  totalPaid: number;
  totalReceived: number;
  netBalance: number;
  favoritePlayer: string | null;
  winRate: number;
  recentGames: RecentGame[];
}

export interface RecentGame {
  gameId: string;
  roomCode: string;
  groupName: string | null;
  finishedAt: Date | null;
  myGoals: number;
  myAssists: number;
  myEarnings: number;
  myPayments: number;
  opponents: string[];
}
