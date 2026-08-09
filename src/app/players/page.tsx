"use client";
import Image from "next/image";

import { useEffect, useMemo, useState } from "react";
import type { Player, PlayerData } from "@/lib/players/types";
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

export default function PlayersPage() {
  const [data, setData] = useState<PlayerData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState<string>("ALL");
  const [nflTeam, setNflTeam] = useState<string>("ALL");

  const [sorting, setSorting] = useState<SortingState>([
    { id: "ownership", desc: true },
  ]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/players");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to load players");
      setData(json);
    })().catch((e) => setErr(String(e)));
  }, []);

  const filtered: Player[] = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();

    return data.players.filter((p) => {
      if (position !== "ALL" && String(p.defaultPositionStr) !== position) return false;

      if (nflTeam !== "ALL" && String(p.proTeamStr) !== nflTeam) return false;

      if (q) {
        const hay = `${p.fullName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [data, search, position, nflTeam]);

  const positionOptions = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.players.map((p) => p.defaultPositionStr))).sort();
  }, [data]);

  const nflTeamOptions = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.players.map((p) => p.proTeamStr))).sort();
  }, [data]);


  const columns = useMemo<ColumnDef<Player>[]>(
    () => [
      { accessorKey: "defaultPositionStr", header: "Pos" },
      { accessorKey: "fullName", header: "Player" },
      { accessorKey: "proTeamStr", header: "NFL Team" },
      { accessorKey: "ownership", header: "Own %" },
      {
        id: "adp",
        accessorFn: (row) => row.analysis?.adp ?? null,
        sortUndefined: "last",
        header: "FFToday ADP",
        cell: (info) => {
          const value = info.getValue<number | null>();
          return value == null ? "—" : value.toFixed(1);
        },
      },
      {
        id: "espnAdp",
        accessorFn: (row) => row.analysis?.espnAdp ?? null,
        sortUndefined: "last",
        header: "ESPN ADP",
        cell: (info) => {
          const value = info.getValue<number | null>();
          return value == null ? "—" : value.toFixed(1);
        },
      },
      {
        id: "overallRank",
        accessorFn: (row) => row.analysis?.overallRank ?? null,
        sortUndefined: "last",
        header: "Harris Rank",
        cell: (info) => {
          const row = info.row.original;
          return row.analysis?.overallRank == null
            ? "—"
            : `#${row.analysis.overallRank}`;
        },
      },
      {
        id: "espnOverallRank",
        accessorFn: (row) => row.analysis?.espnOverallRank ?? null,
        sortUndefined: "last",
        header: "ESPN PPR Rank",
        cell: (info) => {
          const value = info.getValue<number | null>();
          return value == null ? "—" : `#${value}`;
        },
      },
      {
        id: "positionRank",
        accessorFn: (row) => row.analysis?.positionRank ?? null,
        sortUndefined: "last",
        header: "Pos Rank",
        cell: (info) => {
          const row = info.row.original;
          return row.analysis?.positionRank != null
            ? `${row.defaultPositionStr}${row.analysis.positionRank}`
            : "—";
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (err) return <div style={{ padding: 24 }}>Error: {err}</div>;
  if (!data) return <div style={{ padding: 24 }}>Loading players</div>;

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
        <h1 style={{ fontSize: 20, fontWeight: 900 }}>
          NFL Keeper League |{" "}
          <span style={{ fontSize: 18, fontWeight: 400 }}>Player Explorer</span>
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
        ·{" "}
        {data.players.filter((player) => player.analysis).length} ranked players · updated{" "}
        {data.players.find((player) => player.analysis)?.analysis?.rankingsUpdatedAt ?? "—"}
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
        <br />
        <label style={{ display: "grid", gap: 6 }}>
          <span style={label()}>NFL Team</span>
          <select
            value={nflTeam}
            onChange={(e) => setNflTeam(e.target.value)}
            style={control()}
          >
            <option value="ALL">All</option>
            {nflTeamOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <br />
        
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
                      textAlign: "left",
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
                          cell.column.id === "defaultPositionStr"
                            ? cell.getValue() === "C"
                              ? "2px 0.8em"
                              : "2px 6px"
                            : undefined,
                        borderRadius:
                          cell.column.id === "defaultPositionStr"
                            ? 4
                            : undefined,
                        backgroundColor:
                          cell.column.id === "defaultPositionStr"
                            ? positionColor(cell.getValue() as string)
                            : "none",
                        fontWeight:
                          cell.column.id === "defaultPositionStr"
                            ? 900
                            : undefined,
                        textShadow:
                          cell.column.id === "defaultPositionStr"
                            ? "0.2px 0.2px black, -0.2px -0.2px black, 0.2px -0.2px black, -0.2px 0.2px black"
                            : undefined,
                      }}
                    >
                      {cell.column.id === "proTeamStr" ? (
                        <div style={{ display: "flex", gap: 4, alignItems: "center", whiteSpace: "wrap" }}>
                            <Image
                              src={`/nfl-logos/${nflTeamStr(cell.row.original.proTeamId ?? 0).toLowerCase()}.png`}
                              alt="Baseball icon"
                              width={16}
                              height={16}
                              priority
                              style={{height:"fit-content"}}
                              />
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                        </div>
                      ) : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )
                      )}
                      {/* {flexRender(cell.column.columnDef.cell, cell.getContext())} */}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* <div style={{ marginTop: 10 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          ← Back
        </Link>
      </div> */}
    </main>
  );
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
