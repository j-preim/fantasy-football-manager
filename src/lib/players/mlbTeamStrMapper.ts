/**
 * Map proTeamId -> proTeamStr
 */
export const PRO_TEAM_ID_TO_STR: Record<number, string> = {
  0: "FA",
  1: "Bal",
  2: "Bos",
  3: "LAA",
  4: "ChW",
  5: "Cle",
  6: "Det",
  7: "KC",
  8: "Mil",
  9: "Min",
  10: "NYY",
  11: "Ath",
  12: "Sea",
  13: "Tex",
  14: "Tor",
  15: "Atl",
  16: "ChC",
  17: "Cin",
  18: "Hou",
  19: "LAD",
  20: "Wsh",
  21: "NYM",
  22: "Phi",
  23: "Pit",
  24: "Stl",
  25: "SD",
  26: "SF",
  27: "Col",
  28: "Mia",
  29: "Ari",
  30: "TB",
};

// console.log("Pro Team ID to String mapping:", mlbTeamStr(1));

export function mlbTeamStr(proTeamId: number): string {
  return PRO_TEAM_ID_TO_STR[proTeamId] ?? "Unknown";
}