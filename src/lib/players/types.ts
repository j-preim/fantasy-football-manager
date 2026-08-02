export type Player = {
  playerId: number;
  fullName: string;
  firstName: string;
  lastName: string;
  
  defaultPositionId: number;
  defaultPositionStr: string;
  eligibleSlots?: number[];
  
  proTeamId: number;
  proTeamStr: string;

  ownership: number;

  // raw for future fields (bidAmount, autoDraftTypeId, etc.)
  meta?: Record<string, unknown>;
};

export type PlayerData = {
  players: Player[];
};