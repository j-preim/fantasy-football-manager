export function getPotentialKeeperRound(previousRound: number | null): number | null {
  if (previousRound == null || previousRound > 8) {
    return 8; // undrafted or after 8th round previous year
  }

  if (previousRound >= 6 && previousRound <= 8) return Math.max(1, previousRound - 2);
  if (previousRound >= 3 && previousRound <= 5) return Math.max(1, previousRound - 1);
  if (previousRound === 1 || previousRound === 2) return previousRound;

  return null;
}