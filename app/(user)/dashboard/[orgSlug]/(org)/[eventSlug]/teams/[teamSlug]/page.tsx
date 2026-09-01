"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Shield,
  UserPlus,
  Search,
  MoreVertical,
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useParams } from "next/navigation";
import useSWR from "swr";

import {
  TeamMemberWithDetails} from "@/types/team";
import { EventRoles } from "@/types/event";
import { useEvent } from "@/components/EventProvider";
const fetcher = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  return response.json();
};

const ROLE_CACHE_TIME = 1000 * 60 * 60 * 24; // 24 hours

function getRoleBadge(roleName: string) {
  const role = roleName.toLowerCase();

  if (role.includes("admin")) {
    return {
      className:
        "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300",
    };
  }

  if (role.includes("lead")) {
    return {
      className:
        "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-300",
    };
  }

  if (role.includes("volunteer")) {
    return {
      className:
        "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300",
    };
  }

  return {
    className:
      "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  };
}

export default function TeamPage() {
  const params = useParams();

  const orgSlug = params.orgSlug as string;
  const eventSlug = params.eventSlug as string;
  const teamSlug = params.teamSlug as string;
  const event = useEvent();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  /*
   * Team members
   */
const {
  data: membersData,
  error: membersError,
  isLoading: membersLoading,
} = useSWR<TeamMemberWithDetails[]>(
  `/api/events/${event.id}/teams/members?teamSlug=${teamSlug}`,
  fetcher
);

  /*
   * Event roles
   *
   * Roles rarely change, so don't revalidate them constantly.
   */
const {
  data: rolesData,
  error: rolesError,
  isLoading: rolesLoading,
} = useSWR<EventRoles>(
  `/api/events/${event.id}/roles`,
  fetcher,
  {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 1000 * 60 * 60 * 24,
  }
);


  const members = membersData ?? [];
  const roles = rolesData?.eventRoles ?? [];

  /*
   * Filter members
   */
  const filteredMembers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return members.filter((member) => {
      const name =
        member.user?.user_metadata?.name ??
        member.user?.app_metadata?.name ??
        "";

      const email = member.user?.email ?? "";

      const matchesSearch =
        !query ||
        name.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query);

      const matchesRole =
        roleFilter === "all" || member.role.id === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [members, searchQuery, roleFilter]);

  /*
   * Dynamic role statistics
   */
  const adminCount = members.filter(
    (member) => member.role.rank === 1
  ).length;

  const teamLeadCount = members.filter(
    (member) => member.role.rank === 2
  ).length;

  const volunteerCount = members.filter(
    (member) => member.role.rank === 3
  ).length;

  const isLoading = membersLoading || rolesLoading;

  if (membersError || rolesError) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <p className="text-sm ">
            Failed to load team information.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="mt-4 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Team Members
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Manage members, assign permissions, and send invitations.
            </p>
          </div>

          <button
            onClick={() => setIsInviteOpen(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            <UserPlus size={16} />
            Invite Member
          </button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <Users size={18} className="text-zinc-400" />

            <p className="mt-3 text-2xl font-bold text-zinc-950 dark:text-white">
              {isLoading ? "—" : members.length}
            </p>

            <p className="text-xs text-zinc-500">
              Total Members
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <Shield size={18} className="text-zinc-400" />

            <p className="mt-3 text-2xl font-bold text-zinc-950 dark:text-white">
              {isLoading ? "—" : adminCount}
            </p>

            <p className="text-xs text-zinc-500">
              Admins
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <CheckCircle2 size={18} className="text-zinc-400" />

            <p className="mt-3 text-2xl font-bold text-zinc-950 dark:text-white">
              {isLoading ? "—" : teamLeadCount}
            </p>

            <p className="text-xs text-zinc-500">
              Team Leads
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <Clock size={18} className="text-zinc-400" />

            <p className="mt-3 text-2xl font-bold text-zinc-950 dark:text-white">
              {isLoading ? "—" : volunteerCount}
            </p>

            <p className="text-xs text-zinc-500">
              Volunteers
            </p>
          </div>

        </div>

        {/* Search + Role Filter */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="relative max-w-md flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <input
              type="text"
              placeholder="Search members by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-10 pr-4 text-sm outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-zinc-700"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            disabled={rolesLoading}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 outline-none disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <option value="all">
              All Roles
            </option>

          {[...roles]
  .sort((a, b) => a.rank - b.rank)
  .map((role) => (
    <option key={role.id} value={role.id}>
      {role.name}
    </option>
  ))}
          </select>

        </div>

        {/* Members Table */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">

              <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-5 py-3">
                    Member
                  </th>

                  <th className="px-5 py-3">
                    Role
                  </th>

                  <th className="px-5 py-3">
                    Joined
                  </th>

                  <th className="px-5 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">

                {filteredMembers.map((member) => {
                  const name =
                    member.user?.user_metadata?.name ??
                    member.user?.app_metadata?.name ??
                    "Unknown member";

                  const email =
                    member.user?.email ?? "";

                  const badge = getRoleBadge(
                    member.role.name
                  );

                  return (
                    <tr
                      key={member.member_id}
                      className="transition hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                            {name.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <p className="font-medium text-zinc-900 dark:text-white">
                              {name}
                            </p>

                            <p className="text-xs text-zinc-500">
                              {email}
                            </p>
                          </div>

                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
                        >
                          {member.role.name}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs text-zinc-500">
                        {member.joinedAt}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}

              </tbody>
            </table>
          </div>

          {isLoading && (
            <div className="p-8 text-center text-xs text-zinc-500">
              Loading team members...
            </div>
          )}

          {!isLoading && filteredMembers.length === 0 && (
            <div className="p-8 text-center text-xs text-zinc-500">
              No team members match your criteria.
            </div>
          )}

        </div>
      </div>
    </main>
  );
}