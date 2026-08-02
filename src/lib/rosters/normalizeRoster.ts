import { positionStr } from "../players/positionStrMapper";
import { mlbTeamStr } from "../players/mlbTeamStrMapper";
import {lineupSlotStr} from "./lineupSlotStrMapper";

export type EspnRosterEntry = {
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

export type EspnTeam = {
  id: number;
  name: string;
  abbrev?: string;
  logo?: string;
  roster?: {
    entries?: EspnRosterEntry[];
  };
};

export type NormalizedRosterPlayer = {
  teamId: number;
  teamName: string;
  teamAbbrev: string;
  teamLogo?: string;
  playerId: number;
  fullName: string;
  defaultPositionId: number | null;
  defaultPosition: string;
  proTeamId: number | null;
  proTeam: string;
  eligibleSlots: number[];
  lineupSlotId: number | null;
  lineupSlot: string;
  espnAcquisitionType: string | null;
};

export function normalizeEspnRosterData(teams: EspnTeam[]): NormalizedRosterPlayer[] {
  const players: NormalizedRosterPlayer[] = [];

  for (const team of teams) {
    const entries = team.roster?.entries ?? [];

    for (const entry of entries) {
      const player = entry.playerPoolEntry?.player;
      const playerId = entry.playerId ?? player?.id;

      if (!player || playerId == null) continue;

      players.push({
        teamId: team.id,
        teamName: team.name,
        teamAbbrev: team.abbrev ?? "",
        teamLogo: team.logo,
        playerId,
        fullName: player.fullName ?? `Player ${playerId}`,
        defaultPositionId: player.defaultPositionId ?? null,
        defaultPosition: positionStr(player.defaultPositionId ?? 0),
        proTeamId: player.proTeamId ?? null,
        proTeam: mlbTeamStr(player.proTeamId ?? 0),
        eligibleSlots: player.eligibleSlots ?? [],
        lineupSlotId: entry.lineupSlotId ?? null,
        lineupSlot: lineupSlotStr(entry.lineupSlotId ?? 0),
        espnAcquisitionType: entry.acquisitionType ?? null,
      });
    }
  }

  return players;
}