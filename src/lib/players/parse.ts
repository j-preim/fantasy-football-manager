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
  ownership?: {
    percentOwned?: number;
  };
  meta?: Record<string, unknown>;
};

const ALLOWED_POSITIONS = new Set(["QB", "RB", "WR", "TE", "D/ST"]);

function isRawPlayer(value: unknown): value is RawPlayer {
  if (!value || typeof value !== "object") {
    return false;
  }

  const player = value as Partial<RawPlayer>;

  return (
    typeof player.playerId === "number" &&
    typeof player.fullName === "string" &&
    typeof player.firstName === "string" &&
    typeof player.lastName === "string" &&
    typeof player.defaultPositionId === "number" &&
    typeof player.proTeamId === "number"
  );
}

export function extractPlayersArray(raw: unknown): unknown[] {
  return Array.isArray(raw) ? raw : [];
}

export function parsePlayers(raw: unknown): Player[] {
  const players: Player[] = [];

  for (const item of extractPlayersArray(raw)) {
    if (!isRawPlayer(item)) {
      continue;
    }

    const defaultPositionStr = positionStr(item.defaultPositionId);

    if (!ALLOWED_POSITIONS.has(defaultPositionStr)) {
      continue;
    }

    const ownershipPct = item.ownership?.percentOwned ?? 0;

    if (ownershipPct <= 0) {
      continue;
    }

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

  players.sort((a, b) => b.ownership - a.ownership);

  return players;
}