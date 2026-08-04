"use client";
import Image from "next/image";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { DraftPick, DraftData } from "@/lib/drafts/types";
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

export default function DraftsPage() {
  const [data, setData] = useState<DraftData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Filters
  const [year, setYear] = useState<string>("ALL");
  const [teamId, setTeamId] = useState<string>("ALL");
  const [keeperOnly, setKeeperOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState<string>("ALL");

  const [sorting, setSorting] = useState<SortingState>([
    { id: "year", desc: true },
    { id: "pick", desc: false },
  ]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/drafts");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to load drafts");
      setData(json);
    })().catch((e) => setErr(String(e)));
  }, []);

  const filtered: DraftPick[] = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();

    return data.picks.filter((p) => {
      if (year !== "ALL" && String(p.year) !== year) return false;
      if (teamId !== "ALL" && String(p.teamId) !== teamId) return false;
      if (keeperOnly && !p.isKeeper) return false;
      if (position !== "ALL" && String(p.defaultPositionStr) !== position) return false;

      if (q) {
        const hay = `${p.playerName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [data, year, teamId, keeperOnly, search, position]);

  const positionOptions = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.picks.map((p) => p.defaultPositionStr))).sort();
  }, [data]);

  const columns = useMemo<ColumnDef<DraftPick>[]>(
    () => [
      { accessorKey: "year", header: "Year" },
      // { accessorKey: "pickOverall", header: "Pick" },
      { accessorKey: "pick", header: "Pick" },
      { accessorKey: "teamName", header: "Team" },
      { accessorKey: "defaultPositionStr", header: "Pos" },
      { accessorKey: "playerName", header: "Player" },
      {
        accessorKey: "isKeeper",
        header: "Keeper",
        cell: (info) => (info.getValue<boolean>() ? "✅" : "✖️"),
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
  if (!data) return <div style={{ padding: 24 }}>Loading drafts…</div>;

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
          <span style={{ fontSize: 18, fontWeight: 400 }}>Draft Explorer</span>
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
          <span style={label()}>Year</span>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={control()}
          >
            <option value="ALL">All</option>
            {data.years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label style={{ display: "grid", gap: 6 }}>
          <span style={label()}>Drafting team</span>
          <select
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            style={control()}
          >
            <option value="ALL">All</option>
            {data.teams.map((t) => (
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
        <br />
        <label
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            paddingBottom: 6,
            paddingLeft: 8,
            fontSize: 14,
          }}
        >
          <input
            type="checkbox"
            checked={keeperOnly}
            onChange={(e) => setKeeperOnly(e.target.checked)}
          />
          Keepers only
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
          {/* Showing <b>{filtered.length}</b> picks */}
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
                      textAlign: h.column.id === "isKeeper" ? "center" : "left",
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
                      textAlign:
                        cell.column.id === "isKeeper" ? "center" : "left",
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
                      {cell.column.id === "playerName" ? (
                        <div style={{ display: "flex", gap: 4, alignItems: "center", whiteSpace: "wrap" }}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                            <Image
                              src={`/nfl-logos/${nflTeamStr(cell.row.original.proTeamId ?? 0).toLowerCase()}.png`}
                              alt="Football icon"
                              width={16}
                              height={16}
                              priority
                              style={{height:"fit-content"}}
                            />
                            <span style={label()}>{cell.row.original.proTeamStr}</span>
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

      {/* <p style={{ marginTop: 12, opacity: 0.7 }}>
        Tip: team names come from <code>src/lib/drafts/teamNames.ts</code> (so old years can keep old names).
      </p>

      <div style={{ marginTop: 12, opacity: 0.8, fontSize: 13 }}>
        Want to click into a player? Next step is a <code>/players/[id]</code> page that shows every year that player was drafted and by whom.
      </div> */}

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
