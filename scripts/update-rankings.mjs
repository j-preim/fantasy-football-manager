import { mkdir, writeFile } from "node:fs/promises";

const SOURCE_URL = "https://www.fftoday.com/rankings/26-adp-half-ppr.html";
const HARRIS_URL = "https://harrishalfppr.com/160";

async function download(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "fantasy-football-manager rankings updater" },
  });

  if (!response.ok) {
    throw new Error(`Rankings download failed for ${url}: ${response.status}`);
  }

  return response.text();
}

const html = await download(SOURCE_URL);
const rowPattern = /<tr class="smallbody">\s*<td>(\d+)<\/td>\s*<td><a[^>]*>([^<]+)<\/a><\/td>\s*<td>([^<]+)<\/td>\s*<td>(\d+)<\/td>\s*<td>([^<]+)<\/td>\s*<td>[^<]*<\/td>\s*<td>[^<]*<\/td>\s*<td>([\d.]+)<\/td>/g;

const players = Array.from(html.matchAll(rowPattern), (match) => ({
  overallRank: Number(match[1]),
  fullName: match[2]
    .replaceAll("&amp;", "&")
    .replaceAll("&#039;", "'")
    .trim(),
  position: match[3].trim(),
  positionRank: Number(match[4]),
  nflTeam: match[5].trim(),
  adp: Number(match[6]),
}));

if (players.length < 100) {
  throw new Error(`Only found ${players.length} ranking rows; source markup may have changed`);
}

const updatedMatch = html.match(/Half-PPR Scoring\s*-\s*([\d/]+)/i);
const payload = {
  season: 2026,
  scoring: "half-ppr",
  leagueSize: 12,
  updatedAt: updatedMatch?.[1] ?? new Date().toISOString().slice(0, 10),
  source: "FFToday",
  sourceUrl: SOURCE_URL,
  players,
};

await mkdir("src/data", { recursive: true });
await writeFile("src/data/half-ppr-adp-2026.json", `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Saved ${players.length} half-PPR ADP records`);

const harrisHtml = await download(HARRIS_URL);
const entryAsset = harrisHtml.match(/<script type="module"[^>]+src="([^"]+index-[^"]+\.js)"/i)?.[1];
if (!entryAsset) throw new Error("Could not find the Harris entry asset");

const entryUrl = new URL(entryAsset, HARRIS_URL).href;
const entrySource = await download(entryUrl);
const homeAsset = entrySource.match(/import\(`\.\/(Home-[^`]+\.js)`\)/)?.[1];
if (!homeAsset) throw new Error("Could not find the Harris rankings asset");

const homeSource = await download(new URL(homeAsset, entryUrl).href);
const harrisRaw = Array.from(
  homeSource.matchAll(/JSON\.parse\(`([\s\S]*?)`\)/g),
  (match) => {
    try {
      return JSON.parse(match[1]);
    } catch {
      return null;
    }
  },
).find(
  (candidate) =>
    Array.isArray(candidate) &&
    candidate.length >= 150 &&
    candidate.every(
      (player) =>
        typeof player?.rank === "number" &&
        typeof player?.name === "string" &&
        typeof player?.position === "string",
    ),
);

if (!harrisRaw) throw new Error("Could not find the Harris Top 160 data");
if (harrisRaw.length < 150) {
  throw new Error(`Only found ${harrisRaw.length} Harris ranking rows`);
}

const positionCounts = new Map();
const harrisPlayers = harrisRaw.slice(0, 160).map((player) => {
  const positionRank = (positionCounts.get(player.position) ?? 0) + 1;
  positionCounts.set(player.position, positionRank);
  return {
    overallRank: player.rank,
    fullName: player.name,
    position: player.position,
    positionRank,
  };
});

const updatedAt = homeSource.match(/updated:`updated ([^`]+)`/)?.[1] ?? new Date().toISOString().slice(0, 10);
const harrisPayload = {
  season: 2026,
  scoring: "half-ppr",
  updatedAt,
  source: "Harris Half PPR",
  sourceUrl: HARRIS_URL,
  disclaimer: "Not official rankings from Christopher Harris.",
  players: harrisPlayers,
};

await writeFile("src/data/harris-half-ppr-2026.json", `${JSON.stringify(harrisPayload, null, 2)}\n`);
console.log(`Saved ${harrisPlayers.length} Harris Half PPR records`);
