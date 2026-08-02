/**
 * Map teamId -> teamName by year.
 * If team names are stable, you can move mappings into "default" and reuse.
 *
 * Fill this in gradually:
 * - Start with 2026 team names (from your league API teams[])
 * - Add older years as needed
 */
export const TEAM_NAMES_BY_YEAR: Record<number, Record<number, string>> = {
  // Example:
  2026: { 1: "The Dyna$ty", 2: "Balls Deep", 3: "Preim Time", 4: "Team Critzer", 5: "Kenosha Kickers", 6: "Older Than Jamie Moyer", 7: "Ohtani Betts", 8: "Rickey's Aviators", 9: "Inconspicuous Duffel Bags", 10: "BIG DUMPER!" },
  2025: { 1: "The Dyna$ty", 2: "Balls Deep", 3: "Preim Time", 4: "Team Critzer", 5: "Kenosha Kickers", 6: "Older Than Jamie Moyer", 7: "Ohtani Betts", 8: "Rickey's Aviators", 9: "Inconspicuous Duffel Bags", 10: "BIG DUMPER!" },
  2024: { 1: "The Dyna$ty", 2: "Balls Deep", 3: "Preim Time", 4: "Team Critzer", 5: "Kenosha Kickers", 6: "Older Than Jamie Moyer", 7: "Ohtani Betts", 8: "Rickey's Aviators", 9: "Inconspicuous Duffel Bags", 10: "BIG DUMPER!" },
  2023: { 1: "The Dyna$ty", 2: "Balls Deep", 3: "Preim Time", 4: "Team Critzer", 5: "Kenosha Kickers", 6: "Older Than Jamie Moyer", 7: "Ohtani Betts", 8: "Rickey's Aviators", 9: "Inconspicuous Duffel Bags", 10: "BIG DUMPER!" },
  2022: { 1: "The Dyna$ty", 2: "Balls Deep", 3: "Preim Time", 4: "Team Critzer", 5: "Kenosha Kickers", 6: "Older Than Jamie Moyer", 7: "Ohtani Betts", 8: "Rickey's Aviators", 9: "Inconspicuous Duffel Bags", 10: "BIG DUMPER!" },
  2021: { 1: "The Dyna$ty", 2: "Balls Deep", 3: "Preim Time", 4: "Team Critzer", 5: "Kenosha Kickers", 6: "Older Than Jamie Moyer", 7: "Ohtani Betts", 8: "Rickey's Aviators", 9: "Inconspicuous Duffel Bags", 10: "BIG DUMPER!" },
  2019: { 1: "The Dyna$ty", 2: "Balls Deep", 3: "Preim Time", 4: "Team Critzer", 5: "Kenosha Kickers", 6: "Older Than Jamie Moyer", 7: "Ohtani Betts", 8: "Rickey's Aviators", 9: "Inconspicuous Duffel Bags", 10: "BIG DUMPER!" },
  2018: { 1: "The Dyna$ty", 2: "Balls Deep", 3: "Preim Time", 4: "Team Critzer", 5: "Kenosha Kickers", 6: "Older Than Jamie Moyer", 7: "Ohtani Betts", 8: "Rickey's Aviators", 9: "Inconspicuous Duffel Bags", 10: "BIG DUMPER!" },
  2017: { 1: "The Dyna$ty", 2: "Balls Deep", 3: "Preim Time", 4: "Team Critzer", 5: "Kenosha Kickers", 6: "Older Than Jamie Moyer", 7: "Ohtani Betts", 8: "Rickey's Aviators", 9: "Inconspicuous Duffel Bags", 10: "BIG DUMPER!" },
  2016: { 1: "The Dyna$ty", 2: "Balls Deep", 3: "Preim Time", 4: "Team Critzer", 5: "Kenosha Kickers", 6: "Older Than Jamie Moyer", 7: "Ohtani Betts", 8: "Rickey's Aviators", 9: "Inconspicuous Duffel Bags", 10: "BIG DUMPER!" },
  2015: { 1: "The Dyna$ty", 2: "Balls Deep", 3: "Preim Time", 4: "Team Critzer", 5: "Kenosha Kickers", 6: "Older Than Jamie Moyer", 7: "Ohtani Betts", 8: "Rickey's Aviators", 9: "Inconspicuous Duffel Bags", 10: "BIG DUMPER!" },
  2014: { 1: "The Dyna$ty", 2: "Balls Deep", 3: "Preim Time", 4: "Team Critzer", 5: "Kenosha Kickers", 6: "Older Than Jamie Moyer", 7: "Ohtani Betts", 8: "Rickey's Aviators", 9: "Inconspicuous Duffel Bags", 10: "BIG DUMPER!" },
  2013: { 1: "The Dyna$ty", 2: "Balls Deep", 3: "Preim Time", 4: "Team Critzer", 5: "Kenosha Kickers", 6: "Older Than Jamie Moyer", 7: "Ohtani Betts", 8: "Rickey's Aviators", 9: "Inconspicuous Duffel Bags", 10: "BIG DUMPER!" },
  2012: { 1: "The Dyna$ty", 2: "Balls Deep", 3: "Preim Time", 4: "Team Critzer", 5: "Kenosha Kickers", 6: "Older Than Jamie Moyer", 7: "Ohtani Betts", 8: "Rickey's Aviators", 9: "Inconspicuous Duffel Bags", 10: "BIG DUMPER!" },
  2011: { 1: "The Dyna$ty", 2: "Balls Deep", 3: "Preim Time", 4: "Team Critzer", 5: "Kenosha Kickers", 6: "Older Than Jamie Moyer", 7: "Ohtani Betts", 8: "Rickey's Aviators", 9: "Inconspicuous Duffel Bags", 10: "BIG DUMPER!" },
  2010: { 1: "The Dyna$ty", 2: "Balls Deep", 3: "Preim Time", 4: "Team Critzer", 5: "Kenosha Kickers", 6: "Older Than Jamie Moyer", 7: "Ohtani Betts", 8: "Rickey's Aviators", 9: "Inconspicuous Duffel Bags", 10: "BIG DUMPER!" },
  2009: { 1: "The Dyna$ty", 2: "Balls Deep", 3: "Preim Time", 4: "Team Critzer", 5: "Kenosha Kickers", 6: "Older Than Jamie Moyer", 7: "Ohtani Betts", 8: "Rickey's Aviators", 9: "Inconspicuous Duffel Bags", 10: "BIG DUMPER!" },
};

export function teamNameFor(year: number, teamId: number): string {
  return TEAM_NAMES_BY_YEAR[year]?.[teamId] ?? `Team ${teamId}`;
}