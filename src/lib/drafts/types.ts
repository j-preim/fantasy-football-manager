export type DraftPick = {
  year: number;

  pickOverall: number;
  pick: string;
  round: number;
  pickInRound: number;

  teamId: number;
  teamName: string;

  memberId?: string;

  playerId: number;
  playerName: string;
  playerFirstName?: string;
  playerLastName?: string;

  lineupSlotId?: number;
  defaultPositionId?: number;
  defaultPositionStr: string;
  eligiblePositionIds?: number[];

  proTeamId?: number;
  proTeamStr?: string;

  isKeeper: boolean;

  // raw for future fields (bidAmount, autoDraftTypeId, etc.)
  meta?: Record<string, unknown>;
};

export type DraftData = {
  years: number[];
  teams: Array<{ teamId: number; teamName: string }>;
  picks: DraftPick[];
};