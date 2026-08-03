/**
 * Map defaultPositionId -> defaultPositionStr
 */
export const POSITION_ID_TO_STR: Record<number, string> = {
  1: "QB",
  2: "RB",
  3: "WR",
  4: "TE",
  5: "K",
  6: "SS",
  7: "P",
  8: "DL",
  9: "OF",
  10: "DE",
  11: "LB",
  12: "DB",
  13: "DT",
  14: "Coach",
  15: "TQB",
  16: "D/ST",
  17: "IL",
  18: "IR",
};

// console.log("Position ID to String mapping:", positionStr(1));

export function positionStr(defaultPositionId: number): string {
  return POSITION_ID_TO_STR[defaultPositionId] ?? "Unknown";
}