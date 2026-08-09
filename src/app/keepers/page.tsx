"use client";
import Image from "next/image";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { positionColor } from "@/lib/players/positionColorMapper";
import { nflTeamStr } from "@/lib/players/nflTeamStrMapper";
import type { KeeperValue } from "@/lib/analysis/types";

type KeeperTag = "none" | "likely" | "maybe" | "hide";

type KeeperPlayer = {
  teamId: number;
  teamName: string;
  teamAbbrev: string;
  teamLogo?: string;
  playerId: number;
  fullName: string;
  defaultPosition: string;
  defaultPositionId: number | null;
  proTeam: string;
  proTeamId: number | null;
  lineupSlot: string;
  lineupSlotId: number | null;
  previousDraftRound: number | null;
  previousRoundPick: number | null;
  previousOverallPick: number | null;
  draftedLastYear: boolean;
  potentialKeeperRound: number | null;
  analysis: KeeperValue | null;
};

type KeeperTeam = {
  teamId: number;
  teamName: string;
};

type KeeperApiResponse = {
  season: number;
  basedOnDraftSeason: number;
  teams: Array<{
    teamId: number;
    teamName: string;
    teamAbbrev: string;
    teamLogo?: string;
    players: KeeperPlayer[];
  }>;
};

type KeeperPlayerWithTag = KeeperPlayer & {
  keeperTag: KeeperTag;
};

type KeeperTagMap = Record<string, KeeperTag>;

function keeperStorageKey(season: number, teamId: number, playerId: number) {
  return `keepers:${season}:${teamId}:${playerId}`;
}

function loadKeeperTags(season: number, players: KeeperPlayer[]): KeeperTagMap {
  const out: KeeperTagMap = {};

  for (const p of players) {
    const key = keeperStorageKey(season, p.teamId, p.playerId);
    const val = window.localStorage.getItem(key);

    if (val === "likely" || val === "maybe" || val === "hide" || val === "none") {
      out[key] = val;
    } else {
      out[key] = "none";
    }
  }

  return out;
}

function saveKeeperTag(
  season: number,
  teamId: number,
  playerId: number,
  tag: KeeperTag,
) {
  const key = keeperStorageKey(season, teamId, playerId);
  window.localStorage.setItem(key, tag);
}


export default function KeepersPage() {
  const [data, setData] = useState<KeeperApiResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tagMap, setTagMap] = useState<KeeperTagMap>({});

  // Filters
  const [teamId, setTeamId] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState<string>("ALL");
  const [tagFilter, setTagFilter] = useState<string>("ALL");

  const [sorting, setSorting] = useState<SortingState>([
    { id: "potentialKeeperRound", desc: false },
    { id: "fullName", desc: false },
  ]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/keepers");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to load keeper data");
      setData(json);
    })().catch((e) => setErr(String(e)));
  }, []);

  const allPlayers: KeeperPlayer[] = useMemo(() => {
    if (!data) return [];
    return data.teams.flatMap((t) => t.players);
  }, [data]);

  useEffect(() => {
    if (!data) return;
    setTagMap(loadKeeperTags(data.season, allPlayers));
  }, [data, allPlayers]);

  const playersWithTags: KeeperPlayerWithTag[] = useMemo(() => {
    if (!data) return [];

    return allPlayers.map((p) => {
      const key = keeperStorageKey(data.season, p.teamId, p.playerId);

      return {
        ...p,
        keeperTag: tagMap[key] ?? "none",
      };
    });
  }, [allPlayers, data, tagMap]);

  const teams: KeeperTeam[] = useMemo(() => {
    if (!data) return [];
    return data.teams
      .map((t) => ({
        teamId: t.teamId,
        teamName: t.teamName,
      }))
      .sort((a, b) => a.teamName.localeCompare(b.teamName));
  }, [data]);

  const positionOptions = useMemo(() => {
    return Array.from(new Set(allPlayers.map((p) => p.defaultPosition).filter(Boolean))).sort();
  }, [allPlayers]);

  const filtered: KeeperPlayerWithTag[] = useMemo(() => {
    const q = search.trim().toLowerCase();

    return playersWithTags.filter((p) => {
      if (teamId !== "ALL" && String(p.teamId) !== teamId) return false;
      if (position !== "ALL" && p.defaultPosition !== position) return false;

      if (tagFilter === "LIKELY" && p.keeperTag !== "likely") return false;
      if (tagFilter === "NOT HIDDEN" && p.keeperTag === "hide") return false;
      if (
        tagFilter === "FLAGGED" &&
        !["likely", "maybe"].includes(p.keeperTag)
      ) {
        return false;
      }
      if (tagFilter === "HIDDEN" && p.keeperTag !== "hide") return false;
      if (tagFilter === "UNFLAGGED" && p.keeperTag !== "none") return false;

      if (q) {
        const hay =
          `${p.fullName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [playersWithTags, teamId, position, tagFilter, search]);

  const setPlayerTag = useCallback(
    (player: KeeperPlayer, tag: KeeperTag) => {
      if (!data) return;

      saveKeeperTag(data.season, player.teamId, player.playerId, tag);

      setTagMap((prev) => ({
        ...prev,
        [keeperStorageKey(data.season, player.teamId, player.playerId)]: tag,
      }));
    },
    [data],
  );

  const columns = useMemo<ColumnDef<KeeperPlayerWithTag>[]>(
    () => [
      { accessorKey: "teamName", header: "Team" },
      { accessorKey: "defaultPosition", header: "Pos" },
      { accessorKey: "fullName", header: "Player" },
      {
        accessorKey: "previousDraftRound",
        header: "2025 Draft",
        cell: (info) => {
          const row = info.row.original;
          return row.draftedLastYear ? `${row.previousDraftRound}` : "N/A";
        },
        sortingFn: (rowA, rowB) => {
          const a = rowA.original.draftedLastYear
            ? (rowA.original.previousDraftRound ?? 999)
            : 999;
          const b = rowB.original.draftedLastYear
            ? (rowB.original.previousDraftRound ?? 999)
            : 999;
          return a - b;
        },
      },
      {
        accessorKey: "potentialKeeperRound",
        header: "2026 Keeper",
        cell: (info) => {
          const v = info.getValue<number | null>();
          return v == null ? "-" : `${v}`;
        },
      },
      {
        id: "adp",
        accessorFn: (row) => row.analysis?.adp ?? null,
        header: "FFToday ADP",
        cell: (info) => formatDecimal(info.getValue<number | null>()),
      },
      {
        id: "espnAdp",
        accessorFn: (row) => row.analysis?.espnAdp ?? null,
        header: "ESPN ADP",
        cell: (info) => formatDecimal(info.getValue<number | null>()),
      },
      {
        id: "rank",
        accessorFn: (row) => row.analysis?.overallRank ?? null,
        header: "Harris Rank",
        cell: (info) => {
          const row = info.row.original;
          return row.analysis?.overallRank != null && row.analysis.positionRank != null
            ? `#${row.analysis.overallRank} (${row.defaultPosition}${row.analysis.positionRank})`
            : "—";
        },
      },
      {
        id: "espnRank",
        accessorFn: (row) => row.analysis?.espnOverallRank ?? null,
        header: "ESPN PPR Rank",
        cell: (info) => {
          const value = info.getValue<number | null>();
          return value == null ? "—" : `#${value}`;
        },
      },
      {
        id: "keeperRoundValue",
        accessorFn: (row) => row.analysis?.keeperRoundValue ?? null,
        header: "Value",
        cell: (info) => {
          const analysis = info.row.original.analysis;
          return analysis?.keeperRoundValue != null && analysis.valueLabel
            ? <ValueBadge analysis={analysis} />
            : "—";
        },
      },
    {
        accessorKey: "keeperTag",
        header: "Tag",
        cell: (info) => {
          const row = info.row.original;

          return (
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <button
                onClick={() => setPlayerTag(row, "likely")}
                style={tagButton(row.keeperTag === "likely", "#d1fae5", "#065f46")}
              >
                Likely
              </button>
              <button
                onClick={() => setPlayerTag(row, "maybe")}
                style={tagButton(row.keeperTag === "maybe", "#fef3c7", "#92400e")}
              >
                Maybe
              </button>
              <button
                onClick={() => setPlayerTag(row, "hide")}
                style={tagButton(row.keeperTag === "hide", "gray", "lightgray")}
              >
                Hide
              </button>
              <button
                onClick={() => setPlayerTag(row, "none")}
                style={tagButton(row.keeperTag === "none", "#f3f4f6", "#4b5563")}
              >
                Clear
              </button>
            </div>
          );
        },
        sortingFn: (rowA, rowB) =>
          tagRank(rowA.original.keeperTag) - tagRank(rowB.original.keeperTag),
      },
    ],
    [setPlayerTag],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (err) return <div style={{ padding: 24 }}>Error: {err}</div>;
  if (!data) return <div style={{ padding: 24 }}>Loading keeper values…</div>;

  return (
    <main style={{ padding: 13, maxWidth: 1000, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "left",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Image
          className="dark:invert"
          src="/football.svg"
          alt="Football icon"
          width={24}
          height={24}
        />
        <h1 style={{ fontSize: 24, fontWeight: 900 }}>
          NFL Keeper League |{" "}
          <span style={{ fontSize: 22, fontWeight: 400 }}>Keeper Calculator</span>
        </h1>
      </div>
      <p style={{ margin: "4px 0 0 34px", fontSize: 12, opacity: 0.65 }}>
        2026 half-PPR · ranks by{" "}
        <a href="https://harrishalfppr.com/160" target="_blank" rel="noreferrer">
          Harris Half PPR
        </a>{" "}
        · ADP by{" "}
        <a href="https://www.fftoday.com/rankings/26-adp-half-ppr.html" target="_blank" rel="noreferrer">
          FFToday
        </a>{" "}
        · ESPN PPR rank and ADP by{" "}
        <a href="https://fantasy.espn.com/football/players/projections" target="_blank" rel="noreferrer">
          ESPN Fantasy
        </a>{" "}
        · 10-team round values · ranks updated{" "}
        {allPlayers.find((player) => player.analysis)?.analysis?.rankingsUpdatedAt ?? "—"}
      </p>

      {/* Filters */}
      <section
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 10,
          alignItems: "end",
          whiteSpace: "wrap",
        }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          <span style={label()}>Team</span>
          <select
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            style={control()}
          >
            <option value="ALL">All</option>
            {teams.map((t) => (
              <option key={t.teamId} value={String(t.teamId)}>
                {t.teamName}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label style={{ display: "grid", gap: 6 }}>
          <span style={label()}>Position</span>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            style={control()}
          >
            <option value="ALL">All</option>
            {positionOptions.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </label>
        <div />

        <label style={{ display: "grid", gap: 6 }}>
          <span style={label()}>Tag filter</span>
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            style={control()}
          >
            <option value="ALL">All</option>
            <option value="FLAGGED">Likely + Maybe</option>
            <option value="LIKELY">Likely only</option>
            <option value="NOT HIDDEN">Not hidden only</option>
            <option value="HIDDEN">Hidden only</option>
            <option value="UNFLAGGED">Unflagged only</option>
          </select>
        </label>

        <div />

        <label style={{ display: "grid", gap: 6, paddingBottom: 6 }}>
          <span style={label()}>Search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Gibbs, Cook…"
            style={control()}
          />
        </label>

        <div
          style={{
            opacity: 0.7,
            fontSize: 13,
            textAlign: "end",
            paddingRight: 8,
            paddingBottom: 2,
          }}
        >
          Showing <b>{filtered.length}</b> players
        </div>
      </section>

      <div
        style={{
          marginTop: 14,
          border: "1px solid #eee",
          borderRadius: 8,
          overflow: "auto",
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", minWidth: 300 }}
        >
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr
                key={hg.id}
                style={{
                  borderBottom: "1px solid #eee",
                  fontSize: 12,
                  backgroundColor: "rgb(17 163 180)",
                }}
              >
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    onClick={h.column.getToggleSortingHandler()}
                    style={{
                      textAlign: h.column.id === "draftedLastYear" ? "center" : "left",
                      paddingLeft: 5,
                      paddingTop: 5,
                      paddingBottom: 5,
                      paddingRight: 2,
                      cursor: "pointer",
                      userSelect: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {h.column.getIsSorted() === "asc"
                      ? " ▲"
                      : h.column.getIsSorted() === "desc"
                        ? " ▼"
                        : ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} style={{ borderBottom: "1px solid #f4f4f4" }}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{
                      paddingLeft: 5,
                      paddingTop: 4,
                      paddingBottom: 4,
                      fontVariantNumeric: "tabular-nums",
                      whiteSpace: "wrap",
                      fontSize: 12,
                      textAlign: "left",
                    }}
                  >
                    <span
                      style={{
                        padding:
                          cell.column.id === "defaultPosition"
                            ? cell.getValue() === "C"
                              ? "2px 0.8em"
                              : "2px 6px"
                            : undefined,
                        borderRadius:
                          cell.column.id === "defaultPosition"
                            ? 4
                            : undefined,
                        backgroundColor:
                          cell.column.id === "defaultPosition"
                            ? positionColor(cell.getValue() as string)
                            : "none",
                        fontWeight:
                          cell.column.id === "defaultPosition"
                            ? 900
                            : undefined,
                        textShadow:
                          cell.column.id === "defaultPosition"
                            ? "0.2px 0.2px black, -0.2px -0.2px black, 0.2px -0.2px black, -0.2px 0.2px black"
                            : undefined,
                      }}
                    >
                      {cell.column.id === "fullName" ? (
                        <div
                          style={{
                            display: "flex",
                            gap: 4,
                            alignItems: "center",
                            whiteSpace: "wrap",
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          <Image
                            src={`/nfl-logos/${nflTeamStr(cell.row.original.proTeamId ?? 0).toLowerCase()}.png`}
                            alt="NFL team logo"
                            width={16}
                            height={16}
                            priority
                            style={{ height: "fit-content" }}
                          />
                          <span style={label()}>{cell.row.original.proTeam}</span>
                        </div>
                      ) : (
                        flexRender(cell.column.columnDef.cell, cell.getContext())
                      )}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function tagRank(tag: KeeperTag): number {
  if (tag === "likely") return 0;
  if (tag === "maybe") return 1;
  return 2;
}

function formatDecimal(value: number | null): string {
  return value == null ? "—" : value.toFixed(1);
}

function ValueBadge({ analysis }: { analysis: KeeperValue }) {
  if (
    analysis.adpRound == null ||
    analysis.keeperRoundValue == null ||
    analysis.valueLabel == null
  ) return null;

  const positive = analysis.keeperRoundValue > 0;
  const neutral = analysis.keeperRoundValue === 0;
  const background = positive ? "#dcfce7" : neutral ? "#e5e7eb" : "#fee2e2";
  const color = positive ? "#166534" : neutral ? "#374151" : "#991b1b";
  const rounds = Math.abs(analysis.keeperRoundValue);
  const detail = neutral
    ? "at ADP"
    : `${rounds} rd ${positive ? "ahead" : "behind"}`;

  return (
    <span
      title={`ADP implies round ${analysis.adpRound}; keeper cost is round ${analysis.adpRound - analysis.keeperRoundValue}`}
      style={{
        display: "inline-flex",
        padding: "3px 7px",
        borderRadius: 999,
        background,
        color,
        fontWeight: 800,
        whiteSpace: "nowrap",
      }}
    >
      {analysis.valueLabel} · {detail}
    </span>
  );
}

  function tagButton(
  active: boolean,
  background: string,
  color: string,
): React.CSSProperties {
  return {
    padding: "3px 8px",
    borderRadius: 999,
    border: active ? `1px solid ${color}` : "1px solid #ddd",
    background: active ? background : "#fff",
    color: active ? color : "#444",
    fontSize: 11,
    fontWeight: active ? 700 : 500,
    cursor: "pointer",
  };
}

function control(): React.CSSProperties {
  return {
    padding: "8px 8px",
    border: "1px solid #ddd",
    borderRadius: 10,
    outline: "none",
    fontSize: 14,
  };
}

function label(): React.CSSProperties {
  return { fontSize: 12, opacity: 0.75 };
}
