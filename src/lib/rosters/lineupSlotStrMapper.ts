export const LINEUP_SLOT_MAP: Record<number, string> = {
  0: "C",
  1: "1B",
  2: "2B",
  3: "3B",
  4: "SS",
  5: "OF",
  6: "2B/SS",
  7: "1B/3B",
  11: "RP",
  12: "UTIL",
  13: "P",
  14: "SP",
  15: "UTIL",
  16: "BN",
  17: "IL",
};

export function lineupSlotStr(lineupSlotId: number): string {
  return LINEUP_SLOT_MAP[lineupSlotId] ?? "UNK";
}