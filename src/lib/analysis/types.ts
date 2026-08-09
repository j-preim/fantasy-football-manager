import type { KeeperValueLabel } from "./keeperValue";

export type { KeeperValueLabel } from "./keeperValue";

export type PlayerAnalysis = {
  adp: number | null;
  adpRound: number | null;
  overallRank: number | null;
  positionRank: number | null;
  espnAdp: number | null;
  espnOverallRank: number | null;
  adpSource: string;
  adpSourceUrl: string;
  adpUpdatedAt: string;
  rankingSource: string;
  rankingSourceUrl: string;
  rankingsUpdatedAt: string;
  espnSource: string;
  espnSourceUrl: string;
  espnRankingFormat: "PPR";
};

export type KeeperValue = PlayerAnalysis & {
  keeperRoundValue: number | null;
  valueLabel: KeeperValueLabel;
  harrisKeeperRoundValue: number | null;
  harrisValueLabel: KeeperValueLabel;
  espnKeeperRoundValue: number | null;
  espnValueLabel: KeeperValueLabel;
};
