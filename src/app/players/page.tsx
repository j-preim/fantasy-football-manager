"use client";
import Image from "next/image";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import { mlbTeamStr } from "@/lib/players/mlbTeamStrMapper";

export default function PlayersPage() {
  const [data, setData] = useState<PlayerData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState<string>("ALL");
  const [mlbTeam, setMlbTeam] = useState<string>("ALL");

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

      if (mlbTeam !== "ALL" && String(p.proTeamStr) !== mlbTeam) return false;

      if (q) {
        const hay = `${p.fullName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [data, search, position, mlbTeam]);

  const positionOptions = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.players.map((p) => p.defaultPositionStr))).sort();
  }, [data]);

  const mlbTeamOptions = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.players.map((p) => p.proTeamStr))).sort();
  }, [data]);


  const columns = useMemo<ColumnDef<Player>[]>(
    () => [
      { accessorKey: "defaultPositionStr", header: "Pos" },
      { accessorKey: "fullName", header: "Player" },
      { accessorKey: "proTeamStr", header: "MLB Team" },
      { accessorKey: "ownership", header: "Own %" },
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
          src="/baseball.svg"
          alt="Baseball icon"
          width={24}
          height={24}
        />
        <h1 style={{ fontSize: 24, fontWeight: 900 }}>
          Sotaly Tober |{" "}
          <span style={{ fontSize: 22, fontWeight: 400 }}>Player Explorer</span>
        </h1>
      </div>

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
          <span style={label()}>MLB Team</span>
          <select
            value={mlbTeam}
            onChange={(e) => setMlbTeam(e.target.value)}
            style={control()}
          >
            <option value="ALL">All</option>
            {mlbTeamOptions.map((t) => (
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
            placeholder="Acuna, Ohtani…"
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
                              src={`/mlb-logos/${mlbTeamStr(cell.row.original.proTeamId ?? 0).toLowerCase()}.png`}
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
