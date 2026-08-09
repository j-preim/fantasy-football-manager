import type { Player } from "./types";
import { positionStr } from "./positionStrMapper";
import { nflTeamStr } from "./nflTeamStrMapper";

type RawPlayer = {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  defaultPositionId: number;
  defaultPositionStr?: string;
  eligibleSlots?: number[];
  proTeamId: number;
  proTeamStr?: string;
  ownership?: { percentOwned?: number };
  meta?: Record<string, unknown>;
};

const ALLOWED_POSITIONS = new Set(["QB", "RB", "WR", "TE", "D/ST"]);

function isRawPlayer(x: unknown): x is RawPlayer {
  if (!x || typeof x !== "object") return false;
  const player = x as Record<string, unknown>;

  return (
    typeof player.id === "number" &&
    typeof player.fullName === "string" &&
    typeof player.defaultPositionId === "number" &&
    typeof player.proTeamId === "number"
  );
}

export function extractPlayersArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;

  return [];
}

export function parsePlayers(raw: unknown): Player[] {
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
        playerId: item.id,

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
