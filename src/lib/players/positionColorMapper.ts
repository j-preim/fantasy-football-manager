/**
 * Map defaultPositionId -> color
 */
export const POSITION_ID_TO_COLOR: Record<string, string> = {
  "C": "blueviolet", //"C":
  "1B": "blue", //"1B"
  "2B": "magenta", //"2B"
  "3B": "green", //"3B"
  "SS": "slateblue", //"SS"
  "OF": "royalblue", //"OF"
  "DH": "indianred", //"DH"
  "SP": "red", //"SP"
  "RP": "orange", //"RP"
  "IL": "red", //"IL"
};

// console.log("Position ID to Color mapping:", positionColor(1));

export function positionColor(defaultPositionStr: string): string {
  return POSITION_ID_TO_COLOR[defaultPositionStr] ?? "Unknown";
}