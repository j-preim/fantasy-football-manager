export type EspnAnalysis = {
  espnAdp: number | null;
  espnOverallRank: number | null;
};

type EspnDraftRank = {
  rank?: number;
};

type EspnPlayer = {
  id?: number;
  ownership?: {
    averageDraftPosition?: number;
  };
  draftRanksByRankType?: {
    PPR?: EspnDraftRank;
  };
};

type EspnPlayerPoolEntry = {
  player?: unknown;
};

/**
 * ESPN's kona player endpoint returns player-pool entries whose actual player
 * record is nested under `player`. Some ESPN responses return the player
 * record directly, so accept both shapes and expose one consistent object to
 * the rest of the app.
 */
export function unwrapEspnPlayer(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;

  const entry = raw as EspnPlayerPoolEntry;
  return entry.player && typeof entry.player === "object" ? entry.player : raw;
}

function positiveNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
}

export function getEspnAnalysis(raw: unknown): EspnAnalysis {
  const player = unwrapEspnPlayer(raw) as EspnPlayer;

  return {
    espnAdp: positiveNumber(player.ownership?.averageDraftPosition),
    espnOverallRank: positiveNumber(player.draftRanksByRankType?.PPR?.rank),
  };
}

/**
 * Build ESPN analysis from the PPR-sorted player feed.
 *
 * ESPN's current draft-rank field contains gaps that are not present in its
 * published PPR rankings (for example, it reports Josh Allen as 36 and Kyren
 * Williams as 69 even though they are 36 and 37 in the same sorted feed).
 * The feed order matches ESPN's published Top 300, so derive the displayed
 * overall rank from that order while counting every ranked position.
 */
export function buildEspnAnalysisById(
  rawPlayers: readonly unknown[],
): Map<number, EspnAnalysis> {
  const analysisById = new Map<number, EspnAnalysis>();
  let overallRank = 0;

  for (const raw of rawPlayers) {
    const player = unwrapEspnPlayer(raw) as EspnPlayer;
    const reportedRank = positiveNumber(
      player.draftRanksByRankType?.PPR?.rank,
    );
    const normalizedRank = reportedRank == null ? null : ++overallRank;

    if (typeof player.id !== "number") continue;

    analysisById.set(player.id, {
      espnAdp: positiveNumber(player.ownership?.averageDraftPosition),
      espnOverallRank: normalizedRank,
    });
  }

  return analysisById;
}

export async function fetchEspnPlayerPool(season: number): Promise<unknown[]> {
  const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leaguedefaults/3?view=kona_player_info`;
  const response = await fetch(url, {
    headers: {
      "X-Fantasy-Filter": JSON.stringify({
        players: {
          filterActive: { value: true },
          limit: 3000,
          sortDraftRanks: {
            sortAsc: true,
            sortPriority: 100,
            value: "PPR",
          },
        },
      }),
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`ESPN player request failed: ${response.status}`);
  }

  const payload: unknown = await response.json();
  if (Array.isArray(payload)) return payload.map(unwrapEspnPlayer);
  if (
    payload &&
    typeof payload === "object" &&
    "players" in payload &&
    Array.isArray(payload.players)
  ) {
    return payload.players.map(unwrapEspnPlayer);
  }

  throw new Error("ESPN player response did not contain a player array");
}
