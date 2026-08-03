import type { DraftPick } from "./types";
import { teamNameFor } from "./teamNames";
import { positionStr } from "../players/positionStrMapper";
import { nflTeamStr } from "../players/nflTeamStrMapper";

type RawPick = {
  overallPickNumber: number;
  roundId: number;
  roundPickNumber: number;

  teamId: number;
  memberId?: string;

  playerId: number;
  fullName: string;
  firstName?: string;
  lastName?: string;

  lineupSlotId?: number;
  defaultPositionId: number;
  defaultPositionStr?: string;
  eligiblePositionIds?: number[];
  
  proTeamId: number;
  proTeamStr?: string;

  keeper?: boolean;

  [k: string]: unknown;
};

function isRawPick(x: any): x is RawPick {
  return (
    x &&
    typeof x === "object" &&
    typeof x.overallPickNumber === "number" &&
    typeof x.roundId === "number" &&
    typeof x.roundPickNumber === "number" &&
    typeof x.teamId === "number" &&
    typeof x.playerId === "number" &&
    typeof x.fullName === "string" &&
    typeof x.defaultPositionId === "number"
  );
}

export function extractPicksArray(raw: any): any[] {
  if (Array.isArray(raw)) return raw;

  // common containers
  if (Array.isArray(raw?.picks)) return raw.picks;
  if (Array.isArray(raw?.draftPicks)) return raw.draftPicks;
  if (Array.isArray(raw?.draft?.picks)) return raw.draft.picks;

  return [];
}

export function parseDraftPicks(year: number, raw: any): DraftPick[] {
  const arr = extractPicksArray(raw);

  const picks: DraftPick[] = [];
  for (const item of arr) {
    if (!isRawPick(item)) continue;

    const isKeeper = Boolean(item.keeper);
    

    picks.push({
      year,

      pickOverall: item.overallPickNumber,
      pick: item.roundId+'.'+item.roundPickNumber,
      round: item.roundId,
      pickInRound: item.roundPickNumber,

      teamId: item.teamId,
      teamName: teamNameFor(year, item.teamId),

      memberId: item.memberId,

      playerId: item.playerId,
      playerName: `${item.fullName}`,
      playerFirstName: item.firstName,
      playerLastName: item.lastName,
      
      lineupSlotId: item.lineupSlotId,
      defaultPositionId: item.defaultPositionId,
      defaultPositionStr: positionStr(item.defaultPositionId),
      eligiblePositionIds: item.eligiblePositionIds,

      proTeamId: item.proTeamId,
      proTeamStr: nflTeamStr(item.proTeamId),

      isKeeper,

      meta: item,
    });
  }

  // Ensure stable ordering
  picks.sort((a, b) => a.pickOverall - b.pickOverall);
  return picks;
}