"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
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
    const loadDrafts = async () => {
      try {
        const res = await fetch("/api/drafts");
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.error ?? "Failed to load drafts");
        }

        setData(json);
      } catch (error) {
        setErr(String(error));
      }
    };

    void loadDrafts();
  }, []);

  const filtered: DraftPick[] = useMemo(() => {
    if (!data) return [];

    const q = search.trim().toLowerCase();

    return data.picks.filter((pick) => {
      if (year !== "ALL" && String(pick.year) !== year) {
        return false;
      }

      if (teamId !== "ALL" && String(pick.teamId) !== teamId) {
        return false;
      }

      if (keeperOnly && !pick.isKeeper) {
        return false;
      }

      if (
        position !== "ALL" &&
        String(pick.defaultPositionStr) !== position
      ) {
        return false;
      }

      if (q) {
        const playerName = pick.playerName.toLowerCase();

        if (!playerName.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [data, year, teamId, keeperOnly, search, position]);

  const positionOptions = useMemo(() => {
    if (!data) return [];

    return Array.from(
      new Set(data.picks.map((pick) => pick.defaultPositionStr)),
    ).sort();
  }, [data]);

  const columns = useMemo<ColumnDef<DraftPick>[]>(
    () => [
      {
        accessorKey: "year",
        header: "Year",
      },
      {
        accessorKey: "pick",
        header: "Pick",
      },
      {
        accessorKey: "teamName",
        header: "Team",
      },
      {
        accessorKey: "defaultPositionStr",
        header: "Pos",
      },
      {
        accessorKey: "playerName",
        header: "Player",
      },
      {
        accessorKey: "isKeeper",
        header: "Keeper",
        cell: (info) => (info.getValue<boolean>() ? "✅" : ""),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (err) {
    return <div style={{ padding: 24 }}>Error: {err}</div>;
  }

  if (!data) {
    return <div style={{ padding: 24 }}>Loading drafts…</div>;
  }

  return (
    <main
      style={{
        padding: 13,
        maxWidth: 1000,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
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

        <h1
          style={{
            fontSize: 20,
            fontWeight: 900,
          }}
        >
          NFL Keeper League |{" "}
          <span
            style={{
              fontSize: 18,
              fontWeight: 400,
            }}
          >
            Draft Explorer
          </span>
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
        }}
      >
        <label
          style={{
            display: "grid",
            gap: 6,
          }}
        >
          <span style={label()}>Year</span>

          <select
            value={year}
            onChange={(event) => setYear(event.target.value)}
            style={control()}
          >
            <option value="ALL">All</option>

            {data.years.map((draftYear) => (
              <option key={draftYear} value={String(draftYear)}>
                {draftYear}
              </option>
            ))}
          </select>
        </label>

        <br />

        <label
          style={{
            display: "grid",
            gap: 6,
          }}
        >
          <span style={label()}>Drafting team</span>

          <select
            value={teamId}
            onChange={(event) => setTeamId(event.target.value)}
            style={control()}
          >
            <option value="ALL">All</option>

            {data.teams.map((team) => (
              <option key={team.teamId} value={String(team.teamId)}>
                {team.teamName}
              </option>
            ))}
          </select>
        </label>

        <br />

        <label
          style={{
            display: "grid",
            gap: 6,
          }}
        >
          <span style={label()}>Position</span>

          <select
            value={position}
            onChange={(event) => setPosition(event.target.value)}
            style={control()}
          >
            <option value="ALL">All</option>

            {positionOptions.map((positionOption) => (
              <option key={positionOption} value={positionOption}>
                {positionOption}
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
            onChange={(event) => setKeeperOnly(event.target.checked)}
          />

          Keepers only
        </label>

        <br />

        <label
          style={{
            display: "grid",
            gap: 6,
            paddingBottom: 6,
          }}
        >
          <span style={label()}>Search</span>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
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
          Showing <b>{filtered.length}</b> picks
        </div>
      </section>

      <div
        style={{
          marginTop: 14,
          border: "1px solid #eee",
          borderRadius: 8,
          overflow: "auto",
          scrollbarGutter: "stable",
        }}
      >
        <table
          style={{
            width: "100%",
            minWidth: 700,
            borderCollapse: "collapse",
            tableLayout: "fixed",
          }}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                style={{
                  borderBottom: "1px solid #eee",
                  fontSize: 12,
                  backgroundColor: "rgb(17 163 180)",
                }}
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      width: getColumnWidth(header.column.id),
                      textAlign:
                        header.column.id === "isKeeper" ? "center" : "left",
                      paddingLeft: 5,
                      paddingTop: 5,
                      paddingBottom: 5,
                      paddingRight: 2,
                      cursor: "pointer",
                      userSelect: "none",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}

                    {header.column.getIsSorted() === "asc"
                      ? " ▲"
                      : header.column.getIsSorted() === "desc"
                        ? " ▼"
                        : ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                style={{
                  borderBottom: "1px solid #f4f4f4",
                }}
              >
                {row.getVisibleCells().map((cell) => {
                  const isPlayerColumn = cell.column.id === "playerName";
                  const isPositionColumn =
                    cell.column.id === "defaultPositionStr";
                  const isKeeperColumn = cell.column.id === "isKeeper";

                  return (
                    <td
                      key={cell.id}
                      style={{
                        width: getColumnWidth(cell.column.id),
                        paddingLeft: 5,
                        paddingTop: 4,
                        paddingBottom: 4,
                        paddingRight: 2,
                        fontVariantNumeric: "tabular-nums",
                        fontSize: 12,
                        textAlign: isKeeperColumn ? "center" : "left",
                        overflow: "hidden",
                      }}
                    >
                      {isPlayerColumn ? (
                        <div
                          style={{
                            display: "flex",
                            gap: 4,
                            alignItems: "center",
                            minWidth: 0,
                            width: "100%",
                          }}
                        >
                          <span
                            style={{
                              minWidth: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={cell.row.original.playerName}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </span>

                          <Image
                            src={`/nfl-logos/${nflTeamStr(
                              cell.row.original.proTeamId ?? 0,
                            ).toLowerCase()}.png`}
                            alt={`${cell.row.original.proTeamStr ?? "NFL"} logo`}
                            width={16}
                            height={16}
                            priority
                            style={{
                              width: 16,
                              height: 16,
                              objectFit: "contain",
                              flexShrink: 0,
                            }}
                          />

                          <span
                            style={{
                              ...label(),
                              flexShrink: 0,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {cell.row.original.proTeamStr}
                          </span>
                        </div>
                      ) : (
                        <span
                          style={{
                            display: isPositionColumn
                              ? "inline-block"
                              : undefined,
                            maxWidth: "100%",
                            padding: isPositionColumn
                              ? cell.getValue() === "C"
                                ? "2px 0.8em"
                                : "2px 6px"
                              : undefined,
                            borderRadius: isPositionColumn ? 4 : undefined,
                            backgroundColor: isPositionColumn
                              ? positionColor(cell.getValue() as string)
                              : undefined,
                            fontWeight: isPositionColumn ? 900 : undefined,
                            textShadow: isPositionColumn
                              ? "0.2px 0.2px black, -0.2px -0.2px black, 0.2px -0.2px black, -0.2px 0.2px black"
                              : undefined,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={
                            typeof cell.getValue() === "string"
                              ? (cell.getValue() as string)
                              : undefined
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function getColumnWidth(columnId: string): number {
  switch (columnId) {
    case "year":
      return 60;

    case "pick":
      return 60;

    case "teamName":
      return 190;

    case "defaultPositionStr":
      return 55;

    case "playerName":
      return 270;

    case "isKeeper":
      return 65;

    default:
      return 100;
  }
}

function control(): React.CSSProperties {
  return {
    padding: "8px",
    border: "1px solid #ddd",
    borderRadius: 10,
    outline: "none",
    fontSize: 14,
    minWidth: 0,
  };
}

function label(): React.CSSProperties {
  return {
    fontSize: 12,
    opacity: 0.75,
  };
}