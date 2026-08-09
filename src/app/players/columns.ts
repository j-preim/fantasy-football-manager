import type { ColumnDef } from "@tanstack/react-table";
import type { Player } from "@/lib/players/types";

function sortableNumber(value: number | null | undefined): number | undefined {
  return value ?? undefined;
}

export const playerColumns: ColumnDef<Player>[] = [
  { accessorKey: "defaultPositionStr", header: "Pos" },
  { accessorKey: "fullName", header: "Player" },
  { accessorKey: "proTeamStr", header: "NFL Team" },
  { accessorKey: "ownership", header: "Own %" },
  {
    id: "adp",
    accessorFn: (row) => sortableNumber(row.analysis?.adp),
    sortUndefined: "last",
    header: "FFToday ADP",
    cell: (info) => {
      const value = info.getValue<number | undefined>();
      return value == null ? "—" : value.toFixed(1);
    },
  },
  {
    id: "espnAdp",
    accessorFn: (row) => sortableNumber(row.analysis?.espnAdp),
    sortUndefined: "last",
    header: "ESPN ADP",
    cell: (info) => {
      const value = info.getValue<number | undefined>();
      return value == null ? "—" : value.toFixed(1);
    },
  },
  {
    id: "overallRank",
    accessorFn: (row) => sortableNumber(row.analysis?.overallRank),
    sortUndefined: "last",
    header: "Harris Rank",
    cell: (info) => {
      const value = info.getValue<number | undefined>();
      return value == null ? "—" : `#${value}`;
    },
  },
  {
    id: "espnOverallRank",
    accessorFn: (row) => sortableNumber(row.analysis?.espnOverallRank),
    sortUndefined: "last",
    header: "ESPN PPR Rank",
    cell: (info) => {
      const value = info.getValue<number | undefined>();
      return value == null ? "—" : `#${value}`;
    },
  },
  {
    id: "positionRank",
    accessorFn: (row) => sortableNumber(row.analysis?.positionRank),
    sortUndefined: "last",
    header: "Pos Rank",
    cell: (info) => {
      const value = info.getValue<number | undefined>();
      return value == null
        ? "—"
        : `${info.row.original.defaultPositionStr}${value}`;
    },
  },
];
