export type Team = {
  id: number;
  name: string;
  abbrev?: string;
  logoUrl?: string;
  ownerName?: string;

  playoffSeed?: number;
  wins?: number;
  losses?: number;
  ties?: number;
};

export type MatchupTeam = {
  teamId: number;
  score?: number;
};

export type Matchup = {
  id: string;
  matchupPeriodId?: number; // ESPN often uses matchupPeriodId for the week
  home: MatchupTeam;
  away: MatchupTeam;
  winner?: "HOME" | "AWAY" | "TIE";
};

export type League = {
  id: number;
  season: number;
  gameId?: number;
  name?: string;

  currentScoringPeriodId?: number;
  teams: Team[];
  matchups: Matchup[];
};