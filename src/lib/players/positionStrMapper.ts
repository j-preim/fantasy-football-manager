/**
 * Map defaultPositionId -> defaultPositionStr
 */
export const POSITION_ID_TO_STR: Record<number, string> = {
  0: "C",
  1: "QB",
  2: "RB",
  3: "WR",
  4: "TE",
  5: "3B",
  6: "SS",
  7: "OF",
  8: "OF",
  9: "OF",
  10: "DH",
  11: "RP",
  14: "SP",
  15: "RP",
  17: "IL",
};

// console.log("Position ID to String mapping:", positionStr(1));

export function positionStr(defaultPositionId: number): string {
  return POSITION_ID_TO_STR[defaultPositionId] ?? "Unknown";
}