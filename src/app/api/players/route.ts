import { NextResponse } from "next/server";
import { parsePlayers } from "@/lib/players/parse";
import type { PlayerData } from "@/lib/players/types";

export const runtime = "nodejs";

function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function GET() {
  try {
    const seasonStr = mustGetEnv("ESPN_SEASON");
    const season = Number(seasonStr);
    const players = [];

    const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/players?view=players_wl`;

    const r = await fetch(url, {
      headers: {
        "X-Fantasy-Filter": `{"filterActive":{"value":true}}`
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
      const playersRaw = parsePlayers(raw);

      if (playersRaw.length) {
        players.push(...playersRaw);
      }

    const payload: PlayerData = {
      players,
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}