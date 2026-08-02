export function getPotentialKeeperRound(previousRound: number | null): number | null {
  if (previousRound == null || previousRound > 18) {
    return 18; // undrafted or after 18th round previous year
  }

  if (previousRound >= 15 && previousRound <= 18) return Math.max(1, previousRound - 3);
  if (previousRound >= 9 && previousRound <= 14) return Math.max(1, previousRound - 2);
  if (previousRound >= 3 && previousRound <= 8) return Math.max(1, previousRound - 1);
  if (previousRound === 1 || previousRound === 2) return previousRound;

  return null;
}