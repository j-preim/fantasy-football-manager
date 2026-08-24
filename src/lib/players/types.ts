import type { PlayerAnalysis } from "@/lib/analysis/types";

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

  analysis?: PlayerAnalysis;

  // raw for future fields (bidAmount, autoDraftTypeId, etc.)
  meta?: Record<string, unknown>;
};

export type PlayerData = {
  season: number;
  players: Player[];
};