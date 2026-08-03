import { NextResponse } from "next/server";
import { mapEspnLeague } from "@/lib/league/mapEspn";

export const runtime = "nodejs"; // ensures Node runtime (safer for libs + cookies)

function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function GET() {
  try {
    const leagueId = mustGetEnv("ESPN_LEAGUE_ID");
    const seasonStr = mustGetEnv("ESPN_SEASON");
    const season = Number(seasonStr);
    const espnS2 = mustGetEnv("ESPN_S2");
    const swid = mustGetEnv("ESPN_SWID");

    // ESPN endpoints vary by game; for baseball many wrappers hit ESPN fantasy endpoints similarly
    // We'll start by returning a "shape" placeholder until you wire the exact endpoint/views.
    // The important part: auth cookies stay server-side.
    const cookieHeader = `espn_s2=${espnS2}; SWID=${encodeURIComponent(swid)};`;

    // Start by testing in browser devtools Network tab to see the request ESPN makes.
    const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}?view=mTeam&view=mMatchup`;

    const r = await fetch(url, {
      credentials: "include",
      headers: {
        Cookie: cookieHeader,
      },
      // ✅ Cache on Vercel/Next for 60s (reduces ESPN calls massively)
      next: { revalidate: 60 },
    });

    if (!r.ok) {
      const text = await r.text();
      return NextResponse.json(
        {
          error: "ESPN request failed",
          status: r.status,
          body: text.slice(0, 500),
        },
        { status: 502 },
      );
    }

    const raw = await r.json();

    // ✅ sanitize + normalize
    const league = mapEspnLeague(raw, season);

    // For now just pass through. Next step is to map raw -> your own League type.
    return NextResponse.json(league, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
