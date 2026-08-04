import type { Player } from "./types";
import { positionStr } from "./positionStrMapper";
import { nflTeamStr } from "./nflTeamStrMapper";

type RawPlayer = {
  playerId: number;
  fullName: string;
  firstName: string;
  lastName: string;
  defaultPositionId: number;
  defaultPositionStr?: string;
  eligibleSlots?: number[];
  proTeamId: number;
  proTeamStr?: string;
  ownership: { percentOwned: number };
  meta?: Record<string, unknown>;
};

const ALLOWED_POSITIONS = new Set(["QB", "RB", "WR", "TE", "D/ST"]);

function isRawPlayer(x: any): x is RawPlayer {
  return (
    x &&
    typeof x === "object" &&
    typeof x.id === "number" &&
    typeof x.fullName === "string" &&
    typeof x.defaultPositionId === "number" &&
    typeof x.proTeamId === "number"
  );
}

export function extractPlayersArray(raw: any): any[] {
  if (Array.isArray(raw)) return raw;

  return [];
}

export function parsePlayers(raw: any): Player[] {
  const arr = extractPlayersArray(raw);

  const players: Player[] = [];
  for (const item of arr) {
    if (!isRawPlayer(item)) continue;

    const defaultPositionStr = positionStr(item.defaultPositionId);

    if (!ALLOWED_POSITIONS.has(defaultPositionStr)) {
      continue;
    }

    const ownershipPct = item.ownership?.percentOwned ?? 0;

    if (ownershipPct > 0) {
      players.push({
        playerId: item.playerId,

        fullName: item.fullName,
        firstName: item.firstName,
        lastName: item.lastName,

        defaultPositionId: item.defaultPositionId,
        defaultPositionStr,
        eligibleSlots: item.eligibleSlots,

        proTeamId: item.proTeamId,
        proTeamStr: nflTeamStr(item.proTeamId),

        ownership: ownershipPct,
      });
    }
  }

  // Ensure stable ordering
  players.sort((a, b) => a.ownership - b.ownership);
  return players;
}
