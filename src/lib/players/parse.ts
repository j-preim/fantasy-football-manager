import type { Player } from "./types";
import { positionStr } from "./positionStrMapper";
import { mlbTeamStr } from "./mlbTeamStrMapper";

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

    const ownershipPct = item.ownership?.percentOwned ?? 0;
    if (ownershipPct > 0) {
      players.push({
        playerId: item.playerId,

        fullName: item.fullName,
        firstName: item.firstName,
        lastName: item.lastName,

        defaultPositionId: item.defaultPositionId,
        defaultPositionStr: positionStr(item.defaultPositionId),
        eligibleSlots: item.eligibleSlots,

        proTeamId: item.proTeamId,
        proTeamStr: mlbTeamStr(item.proTeamId),

        ownership: ownershipPct,
      });
    }
  }

  // Ensure stable ordering
  players.sort((a, b) => a.ownership - b.ownership);
  return players;
}
