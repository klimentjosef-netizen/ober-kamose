import { MatchInfo, FootballPlayerInfo, LineupData, TeamLineup, LineupPlayer } from "@/types";

const API_KEY = process.env.FOOTBALL_DATA_API_KEY ?? "";
const BASE_URL = "https://api.football-data.org/v4";

const headers = {
  "X-Auth-Token": API_KEY,
};

// ─── CACHE ────────────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

let matchCacheEntry: CacheEntry<MatchInfo[]> | null = null;
const squadCache = new Map<string, CacheEntry<FootballPlayerInfo[]>>();
const lineupCache = new Map<string, CacheEntry<LineupData>>();

const MATCH_CACHE_TTL = 6 * 60 * 60 * 1000;      // 6 hours
const LINEUP_CACHE_TTL = 5 * 60 * 1000;            // 5 minutes
const SQUAD_CACHE_TTL = 999 * 24 * 60 * 60 * 1000; // forever (effectively)

// Rate limiting — free tier: 10 req/min
const REQUEST_DELAY_MS = 6500;
let lastRequestTime = 0;

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < REQUEST_DELAY_MS && lastRequestTime > 0) {
    await sleep(REQUEST_DELAY_MS - elapsed);
  }
  lastRequestTime = Date.now();
  return fetch(url, { headers });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── UPCOMING MATCHES ─────────────────────────────────────────────────────────

export async function fetchUpcomingMatches(): Promise<MatchInfo[]> {
  if (matchCacheEntry && Date.now() - matchCacheEntry.fetchedAt < MATCH_CACHE_TTL) {
    return matchCacheEntry.data;
  }

  try {
    const today = new Date();
    const future = new Date(today);
    future.setDate(future.getDate() + 7);

    const dateFrom = today.toISOString().split("T")[0];
    const dateTo = future.toISOString().split("T")[0];

    const res = await rateLimitedFetch(
      `${BASE_URL}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}&status=SCHEDULED,TIMED`
    );

    if (!res.ok) {
      console.error("[footballApi] fetchUpcomingMatches failed:", res.status);
      return matchCacheEntry?.data ?? [];
    }

    const json = await res.json();
    const matches: MatchInfo[] = (json.matches ?? []).map((m: any) => ({
      id: `api_${m.id}`,
      apiMatchId: String(m.id),
      isCustom: false,
      homeTeam: m.homeTeam?.shortName ?? m.homeTeam?.name ?? "Home",
      awayTeam: m.awayTeam?.shortName ?? m.awayTeam?.name ?? "Away",
      matchDate: m.utcDate,
      competition: m.competition?.name ?? null,
    }));

    matchCacheEntry = { data: matches, fetchedAt: Date.now() };
    return matches;
  } catch (err) {
    console.error("[footballApi] fetchUpcomingMatches error:", err);
    return matchCacheEntry?.data ?? [];
  }
}

// ─── SQUAD PLAYERS ────────────────────────────────────────────────────────────

export async function fetchSquadPlayers(matchId: string): Promise<FootballPlayerInfo[]> {
  const cached = squadCache.get(matchId);
  if (cached && Date.now() - cached.fetchedAt < SQUAD_CACHE_TTL) {
    return cached.data;
  }

  try {
    const apiMatchId = matchId.replace("api_", "");

    // First get match details to find team IDs
    const matchRes = await rateLimitedFetch(`${BASE_URL}/matches/${apiMatchId}`);
    if (!matchRes.ok) return [];

    const matchJson = await matchRes.json();
    const homeTeamId = matchJson.homeTeam?.id;
    const awayTeamId = matchJson.awayTeam?.id;
    const homeTeamName = matchJson.homeTeam?.shortName ?? matchJson.homeTeam?.name ?? "Home";
    const awayTeamName = matchJson.awayTeam?.shortName ?? matchJson.awayTeam?.name ?? "Away";

    const players: FootballPlayerInfo[] = [];

    // Fetch home squad
    if (homeTeamId) {
      const homePlayers = await fetchTeamSquad(homeTeamId, homeTeamName, matchId);
      players.push(...homePlayers);
    }

    await sleep(REQUEST_DELAY_MS);

    // Fetch away squad
    if (awayTeamId) {
      const awayPlayers = await fetchTeamSquad(awayTeamId, awayTeamName, matchId);
      players.push(...awayPlayers);
    }

    // Add index
    const indexed = players.map((p, i) => ({ ...p, allPlayersIdx: i }));
    squadCache.set(matchId, { data: indexed, fetchedAt: Date.now() });
    return indexed;
  } catch (err) {
    console.error("[footballApi] fetchSquadPlayers error:", err);
    return [];
  }
}

async function fetchTeamSquad(
  teamId: number,
  teamName: string,
  matchId: string
): Promise<FootballPlayerInfo[]> {
  try {
    const res = await rateLimitedFetch(`${BASE_URL}/teams/${teamId}`);
    if (!res.ok) return [];

    const json = await res.json();
    const squad = json.squad ?? [];

    return squad.map((p: any) => ({
      id: `fp_${teamId}_${p.id}`,
      name: p.name ?? p.firstName + " " + p.lastName,
      team: teamName,
      position: mapPosition(p.section ?? p.position),
      matchId,
      isCustom: false,
      allPlayersIdx: 0,
    }));
  } catch (err) {
    console.error("[footballApi] fetchTeamSquad error:", err);
    return [];
  }
}

// ─── LINEUPS ──────────────────────────────────────────────────────────────────

export async function fetchLineups(matchId: string): Promise<LineupData | null> {
  const cached = lineupCache.get(matchId);
  if (cached && Date.now() - cached.fetchedAt < LINEUP_CACHE_TTL) {
    return cached.data;
  }

  try {
    const apiMatchId = matchId.replace("api_", "");
    const res = await rateLimitedFetch(`${BASE_URL}/matches/${apiMatchId}`);
    if (!res.ok) return null;

    const json = await res.json();

    const homeLineup = parseLineup(json.homeTeam);
    const awayLineup = parseLineup(json.awayTeam);

    if (!homeLineup || !awayLineup) return null;

    const data: LineupData = { home: homeLineup, away: awayLineup };
    lineupCache.set(matchId, { data, fetchedAt: Date.now() });
    return data;
  } catch (err) {
    console.error("[footballApi] fetchLineups error:", err);
    return null;
  }
}

function parseLineup(teamData: any): TeamLineup | null {
  if (!teamData) return null;

  const lineup: LineupPlayer[] = (teamData.lineup ?? []).map((p: any) => ({
    name: p.name,
    position: mapDetailedPosition(p.position),
    shirtNumber: p.shirtNumber,
  }));

  const bench: LineupPlayer[] = (teamData.bench ?? []).map((p: any) => ({
    name: p.name,
    position: mapDetailedPosition(p.position),
    shirtNumber: p.shirtNumber,
  }));

  return {
    team: teamData.shortName ?? teamData.name ?? "",
    formation: teamData.formation ?? "",
    lineup,
    bench,
  };
}

// ─── POSITION MAPPING ─────────────────────────────────────────────────────────

function mapPosition(section: string | null | undefined): string {
  if (!section) return "Unknown";
  const map: Record<string, string> = {
    Goalkeeper: "Brankář",
    Defence: "Obránce",
    Midfield: "Záložník",
    Offence: "Útočník",
  };
  return map[section] ?? section;
}

function mapDetailedPosition(position: string | null | undefined): string {
  if (!position) return "Unknown";
  const map: Record<string, string> = {
    Goalkeeper: "Brankář",
    "Centre-Back": "Stoper",
    "Left-Back": "Levý obránce",
    "Right-Back": "Pravý obránce",
    "Defensive Midfield": "Defenzivní záložník",
    "Central Midfield": "Středový záložník",
    "Attacking Midfield": "Ofenzivní záložník",
    "Left Midfield": "Levý záložník",
    "Right Midfield": "Pravý záložník",
    "Left Winger": "Levé křídlo",
    "Right Winger": "Pravé křídlo",
    "Centre-Forward": "Útočník",
    "Second Striker": "Druhý útočník",
  };
  return map[position] ?? position;
}
