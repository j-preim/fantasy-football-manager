import { NextResponse } from "next/server";
import { parsePlayers } from "@/lib/players/parse";
import type { PlayerData } from "@/lib/players/types";
import { getPlayerAnalysis } from "@/lib/analysis/rankings";
import {
  buildEspnAnalysisById,
  fetchEspnPlayerPool,
} from "@/lib/analysis/espn";

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
    const raw = await fetchEspnPlayerPool(season);
    const espnById = buildEspnAnalysisById(raw);
    const players = parsePlayers(raw).map((player) => ({
      ...player,
      analysis:
        getPlayerAnalysis(player.fullName, espnById.get(player.playerId)) ?? undefined,
    }));

    const payload: PlayerData = {
      season,
      players,
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}