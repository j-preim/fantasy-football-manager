import { getPotentialKeeperRound } from "./keepers";
import type { DraftLookupEntry } from "./draftLookup";
import type { NormalizedRosterPlayer } from "./normalizeRoster";

export type KeeperRosterPlayer = NormalizedRosterPlayer & {
  previousDraftRound: number | null;
  previousRoundPick: number | null;
  previousOverallPick: number | null;
  draftedLastYear: boolean;
  potentialKeeperRound: number | null;
};

export type KeeperRosterTeam = {
  teamId: number;
  teamName: string;
  teamAbbrev: string;
  teamLogo?: string;
  players: KeeperRosterPlayer[];
};

export function buildKeeperRosters(
  rosterPlayers: NormalizedRosterPlayer[],
  draftLookup: Record<number, DraftLookupEntry>
): KeeperRosterTeam[] {
  const merged: KeeperRosterPlayer[] = rosterPlayers.map((player) => {
    const draftInfo = draftLookup[player.playerId];

    const previousDraftRound = draftInfo?.roundId ?? null;
    const previousRoundPick = draftInfo?.roundPickNumber ?? null;
    const previousOverallPick = draftInfo?.overallPickNumber ?? null;
    const draftedLastYear = !!draftInfo;
    const potentialKeeperRound = getPotentialKeeperRound(previousDraftRound);

    return {
      ...player,
      previousDraftRound,
      previousRoundPick,
      previousOverallPick,
      draftedLastYear,
      potentialKeeperRound,
    };
  });

  const teamsMap = new Map<number, KeeperRosterTeam>();

  for (const player of merged) {
    if (!teamsMap.has(player.teamId)) {
      teamsMap.set(player.teamId, {
        teamId: player.teamId,
        teamName: player.teamName,
        teamAbbrev: player.teamAbbrev,
        teamLogo: player.teamLogo,
        players: [],
      });
    }

    teamsMap.get(player.teamId)!.players.push(player);
  }

  const teams = Array.from(teamsMap.values());

  for (const team of teams) {
    team.players.sort((a, b) => {
      const aRound = a.potentialKeeperRound ?? 999;
      const bRound = b.potentialKeeperRound ?? 999;

      if (aRound !== bRound) return aRound - bRound;
      return a.fullName.localeCompare(b.fullName);
    });
  }

  return teams.sort((a, b) => a.teamName.localeCompare(b.teamName));
}