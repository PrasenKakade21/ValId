"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Eye, Pencil, Search, Trash2, Users } from "lucide-react";
import { useParams } from "next/navigation";

import { fetcher } from "@/lib/fetcher";
import { useDebounce } from "@/hooks/use-debounce";
import { MemberStatus } from "@/types/event";
import { EventMemberWithDetails,EventMember } from "@/types/event";
interface MembersResponse {
  members: EventMemberWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface FilterOption {
  id: string;
  name: string;
}

const PAGE_SIZE_OPTIONS = [20, 50, 100];

export default function MembersPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [roleId, setRoleId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [status, setStatus] = useState("");

  const query = useMemo(() => {
    const searchParams = new URLSearchParams();

    searchParams.set("page", String(page));
    searchParams.set("limit", String(pageSize));

    if (debouncedSearch.trim()) {
      searchParams.set("search", debouncedSearch.trim());
    }

    if (roleId) {
      searchParams.set("roleId", roleId);
    }

    if (teamId) {
      searchParams.set("teamId", teamId);
    }

    if (status) {
      searchParams.set("status", status);
    }

    return searchParams.toString();
  }, [page, pageSize, debouncedSearch, roleId, teamId, status]);

  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<MembersResponse>(
    eventId
      ? `/api/events/${eventId}/members?${query}`
      : null,
    fetcher,
    {
      keepPreviousData: true,
    }
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleId, teamId, status]);

  const members = data?.members ?? [];
  const pagination = data?.pagination;

  const currentPage = pagination?.page ?? page;
  const totalPages = pagination?.totalPages ?? 1;
  const totalMembers = pagination?.total ?? 0;

  const start =
    totalMembers === 0
      ? 0
      : (currentPage - 1) * pageSize + 1;

  const end = Math.min(
    currentPage * pageSize,
    totalMembers
  );

  /*
   * These should eventually come from your event roles and teams
   * API/hooks instead of being hardcoded.
   */
  const roles: FilterOption[] = [];
  const teams: FilterOption[] = [];

  function clearFilters() {
    setSearch("");
    setRoleId("");
    setTeamId("");
    setStatus("");
    setPage(1);
  }

  function handlePageSizeChange(value: number) {
    setPageSize(value);
    setPage(1);
  }

  function handleViewMember(member: EventMember) {
    // TODO: Open member details
    console.log("View member:", member.id);
  }

  function handleEditMember(member: EventMember) {
    // TODO: Open edit member dialog
    console.log("Edit member:", member.id);
  }

  function handleDeleteMember(member: EventMember) {
    // TODO: Open delete confirmation dialog
    console.log("Delete member:", member.id);
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-2">
        <p className="font-medium">
          Failed to load members
        </p>

        <p className="text-sm text-muted-foreground">
          Something went wrong while loading the event members.
        </p>

        <button
          onClick={() => mutate()}
          className="text-sm font-medium underline underline-offset-4"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Members
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage the people participating in this event.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Users className="h-4 w-4" />
          Add member
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
            placeholder="Search members..."
            className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Role */}
        <select
          value={roleId}
          onChange={(event) => {
            setRoleId(event.target.value);
            setPage(1);
          }}
          className="h-10 min-w-[150px] rounded-md border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
        >
          <option value="">All roles</option>

          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="h-10 min-w-[150px] rounded-md border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Team */}
        <select
          value={teamId}
          onChange={(event) => {
            setTeamId(event.target.value);
            setPage(1);
          }}
          className="h-10 min-w-[150px] rounded-md border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
        >
          <option value="">All teams</option>
          <option value="unassigned">Unassigned</option>

          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      {/* Members table */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium">
                  Member
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Role
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Team
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Status
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Joined
                </th>

                <th className="w-[120px] px-4 py-3" />
              </tr>
            </thead>

            <tbody className="divide-y">
              {isLoading && !data ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <MemberSkeleton key={index} />
                ))
              ) : members.length > 0 ? (
                members.map((member) => (
                  <tr
                    key={member.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    {/* Member */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <MemberAvatar member={member} />

                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {member.user?.user_metadata.name ?? "Unknown member"}
                          </p>

                          <p className="truncate text-xs text-muted-foreground">
                            {member.user?.email ?? "No email"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-4">
                      {member.role ? (
                        <span className="inline-flex rounded-md bg-muted px-2 py-1 text-xs font-medium">
                          {member.role.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          —
                        </span>
                      )}
                    </td>

                    {/* Team */}
                    <td className="px-4 py-4 text-muted-foreground">
                      {member.team?.name ?? "Unassigned"}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <StatusBadge status={member.status} />
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-4 text-muted-foreground">
                      {formatDate(member.joinedAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleViewMember(member)
                          }
                          title="View member"
                          aria-label={`View ${
                            member.user?.user_metadata.name ?? "member"
                          }`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleEditMember(member)
                          }
                          title="Edit member"
                          aria-label={`Edit ${
                            member.user?.user_metadata.name ?? "member"
                          }`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteMember(member)
                          }
                          title="Delete member"
                          aria-label={`Delete ${
                            member.user?.user_metadata.name ?? "member"
                          }`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-16 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </div>

                      <p className="mt-2 font-medium">
                        No members found
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {search ||
                        roleId ||
                        teamId ||
                        status
                          ? "No members match your current filters."
                          : "There are no members in this event yet."}
                      </p>

                      {(search ||
                        roleId ||
                        teamId ||
                        status) && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="mt-2 text-sm font-medium underline underline-offset-4"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="flex flex-col gap-4 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {start}–{end} of {totalMembers} members
          </p>

          <div className="flex flex-wrap items-center gap-4">
            {/* Page size */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                Rows per page
              </span>

              <select
                value={pageSize}
                onChange={(event) =>
                  handlePageSizeChange(
                    Number(event.target.value)
                  )
                }
                className="h-8 rounded-md border bg-background px-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Pagination */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1 || isLoading}
                onClick={() =>
                  setPage((current) => current - 1)
                }
                className="h-8 rounded-md border px-3 text-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
              >
                Previous
              </button>

              <span className="px-3 text-sm text-muted-foreground">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={
                  currentPage >= totalPages || isLoading
                }
                onClick={() =>
                  setPage((current) => current + 1)
                }
                className="h-8 rounded-md border px-3 text-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MemberAvatar({
  member,
}: {
  member: EventMemberWithDetails;
}) {
  const name = member.user?.user_metadata.name ?? "Unknown member";
  const initials = name
    .split(" ")
    .map((part: string[]) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (member.user?.user_metadata.name) {
    return (
      <img
        src={member.user.user_metadata.name}
        alt={name}
        className="h-9 w-9 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
      {initials}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: MemberStatus;
}) {
  const config: Record<
    MemberStatus,
    {
      label: string;
      className: string;
    }
  > = {
    Active: {
      label: "Active",
      className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
    },
    Pending: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
    },
    InActive: {
      label: "Inactive",
      className: "bg-muted text-muted-foreground",
    },
    Declined: {
      label: "",
      className: ""
    },
    Removed: {
      label: "",
      className: ""
    }
  };

  const item = config[status];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${item.className}`}
    >
      {item.label}
    </span>
  );
}

function MemberSkeleton() {
  return (
    <tr>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />

          <div className="space-y-2">
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            <div className="h-3 w-36 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </td>

      <td className="px-4 py-4">
        <div className="h-6 w-20 animate-pulse rounded bg-muted" />
      </td>

      <td className="px-4 py-4">
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
      </td>

      <td className="px-4 py-4">
        <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
      </td>

      <td className="px-4 py-4">
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
      </td>

      <td className="px-4 py-4">
        <div className="ml-auto h-8 w-24 animate-pulse rounded bg-muted" />
      </td>
    </tr>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}