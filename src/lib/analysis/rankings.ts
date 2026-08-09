import adpRankings from "@/data/half-ppr-adp-2026.json";
import harrisRankings from "@/data/harris-half-ppr-2026.json";
import type { KeeperValue, PlayerAnalysis } from "./types";
import type { EspnAnalysis } from "./espn";
import { calculateKeeperValue, getImpliedRound } from "./keeperValue";

const LEAGUE_SIZE = 10;
const SUFFIXES = new Set(["jr", "sr", "ii", "iii", "iv", "v"]);

function normalizeName(value: string): string {
  const words = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (SUFFIXES.has(words.at(-1) ?? "")) words.pop();
  return words.join(" ");
}

const adpByName = new Map(
  adpRankings.players.map((player) => [normalizeName(player.fullName), player]),
);
const harrisByName = new Map(
  harrisRankings.players.map((player) => [normalizeName(player.fullName), player]),
);

export function getPlayerAnalysis(
  fullName: string,
  espn: EspnAnalysis = { espnAdp: null, espnOverallRank: null },
): PlayerAnalysis | null {
  const key = normalizeName(fullName);
  const adp = adpByName.get(key);
  const ranking = harrisByName.get(key);
  if (!adp && !ranking && espn.espnAdp == null && espn.espnOverallRank == null) {
    return null;
  }

  return {
    adp: adp?.adp ?? null,
    adpRound: adp ? Math.ceil(adp.adp / LEAGUE_SIZE) : null,
    overallRank: ranking?.overallRank ?? null,
    positionRank: ranking?.positionRank ?? null,
    espnAdp: espn.espnAdp,
    espnOverallRank: espn.espnOverallRank,
    adpSource: adpRankings.source,
    adpSourceUrl: adpRankings.sourceUrl,
    adpUpdatedAt: adpRankings.updatedAt,
    rankingSource: harrisRankings.source,
    rankingSourceUrl: harrisRankings.sourceUrl,
    rankingsUpdatedAt: harrisRankings.updatedAt,
    espnSource: "ESPN Fantasy",
    espnSourceUrl: "https://fantasy.espn.com/football/players/projections",
    espnRankingFormat: "PPR",
  };
}

export function getKeeperValue(
  fullName: string,
  keeperRound: number | null,
  espn?: EspnAnalysis,
): KeeperValue | null {
  const analysis = getPlayerAnalysis(fullName, espn);
  if (!analysis || keeperRound == null) return null;

  const ffTodayValue = calculateKeeperValue(analysis.adpRound, keeperRound);
  const harrisValue = calculateKeeperValue(
    getImpliedRound(analysis.overallRank, LEAGUE_SIZE),
    keeperRound,
  );
  const espnValue = calculateKeeperValue(
    getImpliedRound(analysis.espnAdp, LEAGUE_SIZE),
    keeperRound,
  );

  return {
    ...analysis,
    keeperRoundValue: ffTodayValue.roundValue,
    valueLabel: ffTodayValue.valueLabel,
    harrisKeeperRoundValue: harrisValue.roundValue,
    harrisValueLabel: harrisValue.valueLabel,
    espnKeeperRoundValue: espnValue.roundValue,
    espnValueLabel: espnValue.valueLabel,
  };
}
