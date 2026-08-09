import fs from "fs/promises";
import path from "path";
// import { buildDraftLookup, DraftPick } from "@/lib/rosters/draftLookup";
// import { buildKeeperRosters } from "@/lib/rosters/buildKeeperRosters";
// import {
//   normalizeEspnRosterData,
//   EspnTeam,
// } from "@/lib/rosters/normalizeRoster";
import { nflTeamStr } from "@/lib/players/nflTeamStrMapper";
import { positionStr } from "@/lib/players/positionStrMapper";
import { lineupSlotStr } from "@/lib/rosters/lineupSlotStrMapper";
import { getPotentialKeeperRound } from "@/lib/rosters/keepers";
import { getKeeperValue } from "@/lib/analysis/rankings";
import type { KeeperValue } from "@/lib/analysis/types";
import {
  fetchEspnPlayerPool,
  getEspnAnalysis,
  type EspnAnalysis,
} from "@/lib/analysis/espn";

type EspnRosterEntry = {
  acquisitionType?: string | null;
  lineupSlotId?: number | null;
  playerId?: number | null;
  playerPoolEntry?: {
    player?: {
      id?: number;
      fullName?: string;
      defaultPositionId?: number | null;
      proTeamId?: number | null;
      eligibleSlots?: number[];
    };
  };
};

type EspnTeam = {
  id: number;
  name: string;
  abbrev?: string;
  logo?: string;
  roster?: {
    entries?: EspnRosterEntry[];
  };
};

type DraftPick = {
  id: number;
  keeper?: boolean;
  lineupSlotId?: number;
  memberId?: string;
  overallPickNumber: number;
  playerId: number;
  roundId: number;
  roundPickNumber: number;
  teamId: number;
  fullName: string;
};

type KeeperApiPlayer = {
  teamId: number;
  teamName: string;
  teamAbbrev: string;
  teamLogo: string;
  playerId: number;
  fullName: string;
  defaultPosition: string;
  defaultPositionId: number;
  proTeam: string;
  proTeamId: number | null;
  lineupSlot: string;
  lineupSlotId: number | null;
  previousDraftRound: number | null;
  previousRoundPick: number | null;
  previousOverallPick: number | null;
  draftedLastYear: boolean;
  potentialKeeperRound: number | null;
  analysis: KeeperValue | null;
};

type KeeperApiResponse = {
  season: number;
  basedOnDraftSeason: number;
  teams: Array<{
    teamId: number;
    teamName: string;
    teamAbbrev: string;
    teamLogo: string;
    players: KeeperApiPlayer[];
  }>;
};

function buildDraftLookup(picks: DraftPick[]) {
  return picks.reduce<Record<number, DraftPick>>((acc, pick) => {
    acc[pick.playerId] = pick;
    return acc;
  }, {});
}

async function loadDraftPicks(): Promise<DraftPick[]> {
  const filePath = path.join(
    process.cwd(),
    "public",
    "drafts",
    "updated_draft_recap_2025.json",
  );
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

async function fetchEspnTeams(): Promise<EspnTeam[]> {
  const leagueId = mustGetEnv("ESPN_LEAGUE_ID");
  const seasonStr = mustGetEnv("ESPN_SEASON");
  const season = Number(seasonStr);
  const espnS2 = mustGetEnv("ESPN_S2");
  const swid = mustGetEnv("ESPN_SWID");

  const cookieHeader = `espn_s2=${espnS2}; SWID=${encodeURIComponent(swid)};`;

  const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}?view=mTeam&view=mRoster`;

  const response = await fetch(url, {
    credentials: "include",
    headers: {
      Cookie: cookieHeader,
    },
    // ✅ Cache on Vercel/Next for 60s (reduces ESPN calls massively)
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ESPN league data: ${response.status}`);
  }

  const data = await response.json();
  // console.log(data);

  // If your ESPN endpoint returns the whole league object, use data.teams
  return data.teams ?? data;
}

function buildKeeperResponse(
  espnTeams: EspnTeam[],
  draftLookup: Record<number, DraftPick>,
  espnAnalysisById: Map<number, EspnAnalysis>,
): KeeperApiResponse {
  const teams = espnTeams
    .map((team) => {
      const players = (team.roster?.entries ?? [])
        .map((entry): KeeperApiPlayer | null => {
          const player = entry.playerPoolEntry?.player;
          const playerId = entry.playerId ?? player?.id;

          if (!player || playerId == null) return null;

          const draftInfo = draftLookup[playerId];
          const previousDraftRound = draftInfo?.roundId ?? null;
          const previousRoundPick = draftInfo?.roundPickNumber ?? null;
          const previousOverallPick = draftInfo?.overallPickNumber ?? null;
          const draftedLastYear = !!draftInfo;
          const potentialKeeperRound = getPotentialKeeperRound(previousDraftRound);

          return {
            teamId: team.id,
            teamName: team.name,
            teamAbbrev: team.abbrev ?? "",
            teamLogo: team.logo ?? "",
            playerId,
            fullName: player.fullName ?? `Player ${playerId}`,
            defaultPosition: positionStr(player.defaultPositionId ?? 0),
            defaultPositionId: player.defaultPositionId ?? 0,
            proTeam: nflTeamStr(player.proTeamId ?? 0),
            proTeamId: player.proTeamId ?? null,
            lineupSlot: lineupSlotStr(entry.lineupSlotId ?? 0),
            lineupSlotId: entry.lineupSlotId ?? null,
            previousDraftRound,
            previousRoundPick,
            previousOverallPick,
            draftedLastYear,
            potentialKeeperRound,
            analysis: getKeeperValue(
              player.fullName ?? "",
              potentialKeeperRound,
              espnAnalysisById.get(playerId),
            ),
          } satisfies KeeperApiPlayer;
        })
        .filter((p): p is KeeperApiPlayer => p !== null)
        .sort((a, b) => {
          const roundDiff =
            (a.potentialKeeperRound ?? 999) - (b.potentialKeeperRound ?? 999);
          if (roundDiff !== 0) return roundDiff;
          return a.fullName.localeCompare(b.fullName);
        }) as KeeperApiPlayer[];

      return {
        teamId: team.id,
        teamName: team.name,
        teamAbbrev: team.abbrev ?? "",
        teamLogo: team.logo ?? "",
        players,
      };
    })
    .sort((a, b) => a.teamName.localeCompare(b.teamName));

  return {
    season: 2026,
    basedOnDraftSeason: 2025,
    teams,
  };
}

export async function GET() {
  try {
    const season = Number(mustGetEnv("ESPN_SEASON"));
    const [espnTeams, draftPicks, espnPlayers] = await Promise.all([
      fetchEspnTeams(),
      loadDraftPicks(),
      fetchEspnPlayerPool(season),
    ]);

    const draftLookup = buildDraftLookup(draftPicks);
    const espnAnalysisById = new Map(
      espnPlayers.flatMap((item) => {
        const id = item && typeof item === "object" && "id" in item ? item.id : null;
        return typeof id === "number" ? [[id, getEspnAnalysis(item)] as const] : [];
      }),
    );
    const response = buildKeeperResponse(
      espnTeams,
      draftLookup,
      espnAnalysisById,
    );

    return Response.json(response);
  } catch (error) {
    console.error("Failed to build keeper API response", error);

    return new Response(
      JSON.stringify({
        error: "Failed to build keeper data",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
