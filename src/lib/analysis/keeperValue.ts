export type KeeperValueLabel =
  | "Elite value"
  | "Strong value"
  | "Value"
  | "Fair"
  | "Reach"
  | null;

export type KeeperSourceValue = {
  impliedRound: number | null;
  roundValue: number | null;
  valueLabel: KeeperValueLabel;
};

export function getImpliedRound(
  overallRankOrAdp: number | null,
  leagueSize: number,
): number | null {
  if (overallRankOrAdp == null) return null;
  return Math.ceil(overallRankOrAdp / leagueSize);
}

export function calculateKeeperValue(
  impliedRound: number | null,
  keeperRound: number | null,
): KeeperSourceValue {
  if (impliedRound == null || keeperRound == null) {
    return { impliedRound, roundValue: null, valueLabel: null };
  }

  // A later keeper round is a cheaper cost, so it represents positive value.
  const roundValue = keeperRound - impliedRound;
  const valueLabel =
    roundValue >= 4
      ? "Elite value"
      : roundValue >= 2
        ? "Strong value"
        : roundValue === 1
          ? "Value"
          : roundValue === 0
            ? "Fair"
            : "Reach";

  return { impliedRound, roundValue, valueLabel };
}
