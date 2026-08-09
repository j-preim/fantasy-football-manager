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

function positiveNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
}

export function getEspnAnalysis(raw: unknown): EspnAnalysis {
  const player = raw as EspnPlayer;

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
  if (Array.isArray(payload)) return payload;
  if (
    payload &&
    typeof payload === "object" &&
    "players" in payload &&
    Array.isArray(payload.players)
  ) {
    return payload.players;
  }

  throw new Error("ESPN player response did not contain a player array");
}
