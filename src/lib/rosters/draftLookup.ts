export type DraftPick = {
  id: number;
  keeper?: boolean;
  lineupSlotId?: number;
  memberId?: string;
  overallPickNumber: number;
  playerId: number;
  roundId: number;
  roundPickNumber: number;
  teamId: number;
  fullName: string;
};

export type DraftLookupEntry = {
  playerId: number;
  fullName: string;
  roundId: number;
  roundPickNumber: number;
  overallPickNumber: number;
  draftedByTeamId: number;
};

export function buildDraftLookup(picks: DraftPick[]): Record<number, DraftLookupEntry> {
  return picks.reduce<Record<number, DraftLookupEntry>>((acc, pick) => {
    acc[pick.playerId] = {
      playerId: pick.playerId,
      fullName: pick.fullName,
      roundId: pick.roundId,
      roundPickNumber: pick.roundPickNumber,
      overallPickNumber: pick.overallPickNumber,
      draftedByTeamId: pick.teamId,
    };
    return acc;
  }, {});
}