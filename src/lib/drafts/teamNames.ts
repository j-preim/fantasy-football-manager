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
  2026: { 1: "Team Critzer", 2: "The Legend", 3: "I'm Better at Scratch Offs", 4: "Bower Rangers", 5: "Team All-Madden", 6: "I've Fallen And I Can't Get Up!", 7: "A-B-CeeDee", 8: "Password Is Taco", 9: "Wait'll Ya See Mike Vick", 10: "Magic Skol Bus" },
  2025: { 1: "Team Critzer", 2: "The Legend", 3: "I'm Better at Scratch Offs", 4: "Bower Rangers", 5: "Team All-Madden", 6: "I've Fallen And I Can't Get Up!", 7: "A-B-CeeDee", 8: "Password Is Taco", 9: "Wait'll Ya See Mike Vick", 10: "Magic Skol Bus" },
  2024: { 1: "Team Critzer", 2: "The Legend", 3: "I'm Better at Scratch Offs", 4: "Bower Rangers", 5: "Team All-Madden", 6: "I've Fallen And I Can't Get Up!", 7: "A-B-CeeDee", 8: "Password Is Taco", 9: "Wait'll Ya See Mike Vick", 10: "Magic Skol Bus" },
  2023: { 1: "Team Critzer", 2: "The Legend", 3: "I'm Better at Scratch Offs", 4: "Bower Rangers", 5: "Team All-Madden", 6: "I've Fallen And I Can't Get Up!", 7: "A-B-CeeDee", 8: "Password Is Taco", 9: "Wait'll Ya See Mike Vick", 10: "Magic Skol Bus" },
  2022: { 1: "Team Critzer", 2: "The Legend", 3: "I'm Better at Scratch Offs", 4: "Bower Rangers", 5: "Team All-Madden", 6: "I've Fallen And I Can't Get Up!", 7: "A-B-CeeDee", 8: "Password Is Taco", 9: "Wait'll Ya See Mike Vick", 10: "Magic Skol Bus" },
  2021: { 1: "Team Critzer", 2: "The Legend", 3: "I'm Better at Scratch Offs", 4: "Bower Rangers", 5: "Team All-Madden", 6: "I've Fallen And I Can't Get Up!", 7: "A-B-CeeDee", 8: "Password Is Taco", 9: "Wait'll Ya See Mike Vick", 10: "Magic Skol Bus" },
  2019: { 1: "Team Critzer", 2: "The Legend", 3: "I'm Better at Scratch Offs", 4: "Bower Rangers", 5: "Team All-Madden", 6: "I've Fallen And I Can't Get Up!", 7: "A-B-CeeDee", 8: "Password Is Taco", 9: "Wait'll Ya See Mike Vick", 10: "Magic Skol Bus" },
  2018: { 1: "Team Critzer", 2: "The Legend", 3: "I'm Better at Scratch Offs", 4: "Bower Rangers", 5: "Team All-Madden", 6: "I've Fallen And I Can't Get Up!", 7: "A-B-CeeDee", 8: "Password Is Taco", 9: "Wait'll Ya See Mike Vick", 10: "Magic Skol Bus" },
  2015: { 1: "Team Critzer", 2: "The Legend", 3: "I'm Better at Scratch Offs", 4: "Bower Rangers", 5: "Team All-Madden", 6: "I've Fallen And I Can't Get Up!", 7: "A-B-CeeDee", 8: "Password Is Taco", 9: "Wait'll Ya See Mike Vick", 10: "Magic Skol Bus" },
  2014: { 1: "Team Critzer", 2: "The Legend", 3: "I'm Better at Scratch Offs", 4: "Bower Rangers", 5: "Team All-Madden", 6: "I've Fallen And I Can't Get Up!", 7: "A-B-CeeDee", 8: "Password Is Taco", 9: "Wait'll Ya See Mike Vick", 10: "Magic Skol Bus" },
  2013: { 1: "Team Critzer", 2: "The Legend", 3: "I'm Better at Scratch Offs", 4: "Bower Rangers", 5: "Team All-Madden", 6: "I've Fallen And I Can't Get Up!", 7: "A-B-CeeDee", 8: "Password Is Taco", 9: "Wait'll Ya See Mike Vick", 10: "Magic Skol Bus" },
  2012: { 1: "Team Critzer", 2: "The Legend", 3: "I'm Better at Scratch Offs", 4: "Bower Rangers", 5: "Team All-Madden", 6: "I've Fallen And I Can't Get Up!", 7: "A-B-CeeDee", 8: "Password Is Taco", 9: "Wait'll Ya See Mike Vick", 10: "Magic Skol Bus" },
  2011: { 1: "Team Critzer", 2: "The Legend", 3: "I'm Better at Scratch Offs", 4: "Bower Rangers", 5: "Team All-Madden", 6: "I've Fallen And I Can't Get Up!", 7: "A-B-CeeDee", 8: "Password Is Taco", 9: "Wait'll Ya See Mike Vick", 10: "Magic Skol Bus" },
  2010: { 1: "Team Critzer", 2: "The Legend", 3: "I'm Better at Scratch Offs", 4: "Bower Rangers", 5: "Team All-Madden", 6: "I've Fallen And I Can't Get Up!", 7: "A-B-CeeDee", 8: "Password Is Taco", 9: "Wait'll Ya See Mike Vick", 10: "Magic Skol Bus" },
  2009: { 1: "Team Critzer", 2: "The Legend", 3: "I'm Better at Scratch Offs", 4: "Bower Rangers", 5: "Team All-Madden", 6: "I've Fallen And I Can't Get Up!", 7: "A-B-CeeDee", 8: "Password Is Taco", 9: "Wait'll Ya See Mike Vick", 10: "Magic Skol Bus" },
};

export function teamNameFor(year: number, teamId: number): string {
  return TEAM_NAMES_BY_YEAR[year]?.[teamId] ?? `Team ${teamId}`;
}