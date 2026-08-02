"use client";
// in pages, replace the useEffect boilerplate with:
// const { data: league, isLoading, error } = useLeague();

import { useQuery } from "@tanstack/react-query";
import type { League } from "./types";

async function fetchLeague(): Promise<League> {
  const res = await fetch("/api/league");
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "Failed to load league");
  return data;
}

export function useLeague() {
  return useQuery({
    queryKey: ["league"],
    queryFn: fetchLeague,
    staleTime: 60_000, // matches server cache
  });
}