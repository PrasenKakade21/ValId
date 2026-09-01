"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  Copy,
  Check,
  ArrowRight,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { Team } from "@/types/team";
import { useEvent } from "@/components/EventProvider";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
  }
  return res.json();
};

export default function TeamsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Get active event details from provider
  const event = useEvent();
  const eventId = event?.id;

  // Fetch teams using the current event ID
  const teamsEndpoint = eventId ? `/api/events/${eventId}/teams` : null;

  const {
    data: teamsData,
    isLoading: isTeamsLoading,
    error: teamsError,
  } = useSWR<Team[]>(teamsEndpoint, fetcher);

  const rawTeams = useMemo(() => teamsData ?? [], [teamsData]);

  // Filter teams by search input
  const filteredTeams = useMemo(() => {
    return rawTeams.filter((team) => {
      const query = searchQuery.toLowerCase();
      const matchesName = team.name.toLowerCase().includes(query);
      // const matchesCode = team.code?.toLowerCase().includes(query);
      return matchesName;
    });
  }, [rawTeams, searchQuery]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Teams
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Overview of all participating teams for{" "}
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                {event?.name || "the active event"}
              </span>.
            </p>
          </div>

          <Link
            href="teams/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            <Plus size={16} />
            Create team
          </Link>
        </div>

        {/* Controls */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <div className="relative max-w-md flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              placeholder="Search team name or join code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-10 pr-4 text-sm outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-zinc-700"
            />
          </div>
        </div>

        {/* Loading State */}
        {isTeamsLoading && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {teamsError && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50/50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/20">
            <ShieldAlert size={24} className="mx-auto text-red-500" />
            <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
              Failed to load teams for this event.
            </p>
          </div>
        )}

        {/* Teams Grid */}
        {!isTeamsLoading && !teamsError && (
          <>
            {filteredTeams.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
                <Users size={28} className="mx-auto text-zinc-400" />
                <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">
                  No teams found
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {searchQuery
                    ? "No teams match your search query."
                    : "There are no registered teams for this event yet."}
                </p>
              </div>
            ) : (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTeams.map((team) => {
                  const memberCount = team.memberIds?.length ?? 0;

                  return (
                    <div
                      key={team.id}
                      className="group flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-medium tracking-wider uppercase text-zinc-400">
                              {event?.name || "Event"}
                            </span>
                            <h3 className="text-base font-semibold text-zinc-950 dark:text-white">
                              {team.name}
                            </h3>
                          </div>

                          <div className="flex items-center gap-1 rounded-lg bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                            <Users size={12} />
                            <span>{memberCount}</span>
                          </div>
                        </div>

                        {/* {team.code && (
                          <div className="mt-4 flex items-center justify-between rounded-xl bg-zinc-50 p-2.5 dark:bg-zinc-950/60">
                            <div>
                              <p className="text-[10px] text-zinc-400">Join Code</p>
                              <p className="font-mono text-xs font-bold tracking-wider text-zinc-900 dark:text-zinc-200">
                                {team.code}
                              </p>
                            </div>

                            <button
                              onClick={() => handleCopyCode(team.code)}
                              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                              title="Copy Join Code"
                            >
                              {copiedCode === team.code ? (
                                <Check size={14} className="text-emerald-500" />
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>
                          </div>
                        )} */}
                      </div>

                      <div className="mt-5 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                        <Link
                          href={`/dashboard/teams/${team.id}`}
                          className="flex items-center justify-between text-xs font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                        >
                          <span>Manage team</span>
                          <ArrowRight
                            size={14}
                            className="transition group-hover:translate-x-0.5"
                          />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}