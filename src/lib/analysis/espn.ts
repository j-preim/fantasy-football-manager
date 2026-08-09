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
