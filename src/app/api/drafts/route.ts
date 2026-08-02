import { NextResponse } from "next/server";
import { parseDraftPicks } from "@/lib/drafts/parse";
import type { DraftData } from "@/lib/drafts/types";
import { TEAM_NAMES_BY_YEAR } from "@/lib/drafts/teamNames";

export const runtime = "nodejs";

// Put whatever years you actually have:
const YEARS = [
  2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019,
  2021, 2022, 2023, 2024, 2025, 2026,
];

export async function GET(req: Request) {
  try {
    const origin = new URL(req.url).origin;

    const picks = [];
    const yearsFound: number[] = [];

    for (const year of YEARS) {
      const r = await fetch(`${origin}/drafts/updated_draft_recap_${year}.json`, { next: { revalidate: 3600 } });
      if (!r.ok) continue;

      const raw = await r.json();
      const yearPicks = parseDraftPicks(year, raw);

      if (yearPicks.length) {
        yearsFound.push(year);
        picks.push(...yearPicks);
      }
    }

    // Build team list from TEAM_NAMES_BY_YEAR across found years
    const teamMap = new Map<number, string>();
    for (const y of yearsFound) {
      const m = TEAM_NAMES_BY_YEAR[y] ?? {};
      for (const [k, v] of Object.entries(m)) teamMap.set(Number(k), v);
    }

    const teams = [...teamMap.entries()]
      .map(([teamId, teamName]) => ({ teamId, teamName }))
      .sort((a, b) => a.teamName.localeCompare(b.teamName));

    const payload: DraftData = {
      years: yearsFound.sort((a, b) => b - a),
      teams,
      picks,
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}