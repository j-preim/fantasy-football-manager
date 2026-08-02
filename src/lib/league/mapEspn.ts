import type { League, Team, Matchup } from "./types";

type EspnMember = {
  id: string; // "{GUID}"
  firstName?: string;
  lastName?: string;
};

type EspnTeam = {
  id: number;
  location?: string;
  nickname?: string;
  name?: string;
  abbrev?: string;
  logo?: string;

  owners?: string[];
  primaryOwner?: string;

  playoffSeed: number,
  record?: {
    overall?: {
      wins?: number;
      losses?: number;
      ties?: number;
    };
  };
};

type EspnScheduleItem = {
  id?: number | string;
  matchupPeriodId?: number;
  home?: { teamId?: number };
  away?: { teamId?: number };
  winner?: "HOME" | "AWAY" | "TIE";
};

type EspnRaw = {
  id: number;
  gameId?: number;
  settings?: { name?: string };
  status?: { currentMatchupPeriod?: number; currentScoringPeriodId?: number };
  scoringPeriodId?: number;

  members?: EspnMember[];
  teams?: EspnTeam[];
  schedule?: EspnScheduleItem[];
};

function safeNum(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function buildTeamName(t: EspnTeam): string {
  const byParts = [t.location, t.nickname].filter(Boolean).join(" ").trim();
  return t.name?.trim() || byParts || `Team ${t.id}`;
}

function pickOwnerId(t: EspnTeam): string | undefined {
  // Prefer owners[0], then primaryOwner, then owner
  const fromOwners = Array.isArray(t.owners) && t.owners.length ? t.owners[0] : undefined;
  return fromOwners ?? t.primaryOwner;
}

function toOwner(ownerId: string | undefined, memberById: Map<string, EspnMember>): string | undefined {
  if (!ownerId) return undefined;
  const m = memberById.get(ownerId);
  const ownerName = `${m?.firstName} ${m?.lastName}`;
  return ownerName;
}

function uniqBy<T>(arr: T[], key: (t: T) => string | number): T[] {
  const seen = new Set<string | number>();
  const out: T[] = [];
  for (const item of arr) {
    const k = key(item);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(item);
    }
  }
  return out;
}

export function mapEspnLeague(raw: unknown, season: number): League {
  const r = raw as EspnRaw;

  const memberById = new Map<string, EspnMember>();
  for (const m of r.members ?? []) {
    if (m?.id) memberById.set(m.id, m);
  }

  const currentScoringPeriodId =
    safeNum(r.status?.currentScoringPeriodId) ??
    safeNum(r.scoringPeriodId) ??
    safeNum(r.status?.currentMatchupPeriod);

  // Teams
  let teams: Team[] = (r.teams ?? []).map((t) => {
    const overall = t.record?.overall;
    const ownerId = pickOwnerId(t);

    return {
      id: t.id,
      name: buildTeamName(t),
      abbrev: t.abbrev,
      logoUrl: t.logo,
      ownerName: toOwner(ownerId, memberById),

      playoffSeed: safeNum(t.playoffSeed),
      wins: safeNum(overall?.wins),
      losses: safeNum(overall?.losses),
      ties: safeNum(overall?.ties),

    };
  });

  // Matchups
  const matchups: Matchup[] = (r.schedule ?? [])
    .filter((m) => m.home?.teamId != null && m.away?.teamId != null)
    .map((m, idx) => {
      const homeId = m.home!.teamId!;
      const awayId = m.away!.teamId!;
      return {
        id: String(m.id ?? `${m.matchupPeriodId ?? "?"}-${homeId}-${awayId}-${idx}`),
        matchupPeriodId: safeNum(m.matchupPeriodId),
        home: { teamId: homeId },
        away: { teamId: awayId },
        winner: m.winner,
      };
    });

  // Fallback if teams absent
  if (teams.length === 0) {
    const derived = matchups.flatMap((m) => [m.home.teamId, m.away.teamId]);
    teams = uniqBy(
      derived.map((id) => ({ id, name: `Team ${id}` })),
      (t) => t.id
    );
  }

  return {
    id: r.id,
    season,
    gameId: r.gameId,
    name: r.settings?.name,
    currentScoringPeriodId,
    teams,
    matchups,
  };
}