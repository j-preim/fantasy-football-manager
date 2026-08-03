/**
 * Map defaultPositionId -> color
 */
export const POSITION_ID_TO_COLOR: Record<string, string> = {
  "QB": "royalblue", //"QB":
  // "1B": "blue", //"1B"
  "RB": "red", //"RB"
  "WR": "green", //"WR"
  "TE": "indianred", //"TE"
  "D/ST": "orange", //"D/ST"
  // "OF": "royalblue", //"OF"
  // "SP": "red", //"SP"
  // "RP": "orange", //"RP"
  "IR": "red", //"IR"
};

// console.log("Position ID to Color mapping:", positionColor(1));

export function positionColor(defaultPositionStr: string): string {
  return POSITION_ID_TO_COLOR[defaultPositionStr] ?? "Unknown";
}