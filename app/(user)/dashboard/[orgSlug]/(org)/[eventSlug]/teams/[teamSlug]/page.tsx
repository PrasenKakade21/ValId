"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  UserPlus,
  Mail,
  Search,
  MoreVertical,
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useParams } from "next/navigation";

type MemberRole = "owner" | "admin" | "staff" | "volunteer";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  joinedAt: string;
  avatarUrl?: string;
};

// Example mock data (Replace with SWR fetcher e.g. /api/orgs/${orgSlug}/members)
const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: "m_1",
    name: "Alex Rivera",
    email: "alex@acme.org",
    role: "owner",
    joinedAt: "Jan 2024",
  },
  {
    id: "m_2",
    name: "Sarah Chen",
    email: "sarah@acme.org",
    role: "admin",
    joinedAt: "Mar 2024",
  },
  {
    id: "m_3",
    name: "David K.",
    email: "david@acme.org",
    role: "staff",
    joinedAt: "Jun 2024",
  },
  {
    id: "m_4",
    name: "Maya Patel",
    email: "maya@volunteer.org",
    role: "volunteer",
    joinedAt: "Aug 2024",
  },
];

const ROLE_BADGES: Record<MemberRole, { label: string; className: string }> = {
  owner: {
    label: "Owner",
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  },
  admin: {
    label: "Admin",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  },
  staff: {
    label: "Staff",
    className:
      "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
  },
  volunteer: {
    label: "Volunteer",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  },
};

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const params = useParams()
  const filteredMembers = INITIAL_MEMBERS.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        {/* Navigation Back Link */}
        <Link
          href={`/dashboard/${params.orgSlug}`}
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 transition hover:text-zinc-900 dark:hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to organization
        </Link>

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

        {/* Stats Row */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <Users size={18} className="text-zinc-400" />
            <p className="mt-3 text-2xl font-bold text-zinc-950 dark:text-white">
              {INITIAL_MEMBERS.length}
            </p>
            <p className="text-xs text-zinc-500">Total Members</p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <Shield size={18} className="text-zinc-400" />
            <p className="mt-3 text-2xl font-bold text-zinc-950 dark:text-white">
              {INITIAL_MEMBERS.filter((m) => m.role === "admin" || m.role === "owner").length}
            </p>
            <p className="text-xs text-zinc-500">Admins & Owners</p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <CheckCircle2 size={18} className="text-zinc-400" />
            <p className="mt-3 text-2xl font-bold text-zinc-950 dark:text-white">
              {INITIAL_MEMBERS.filter((m) => m.role === "staff").length}
            </p>
            <p className="text-xs text-zinc-500">Active Staff</p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <Clock size={18} className="text-zinc-400" />
            <p className="mt-3 text-2xl font-bold text-zinc-950 dark:text-white">
              {INITIAL_MEMBERS.filter((m) => m.role === "volunteer").length}
            </p>
            <p className="text-xs text-zinc-500">Volunteers</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
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

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <option value="all">All Roles</option>
              <option value="owner">Owners</option>
              <option value="admin">Admins</option>
              <option value="staff">Staff</option>
              <option value="volunteer">Volunteers</option>
            </select>
          </div>
        </div>

        {/* Members Table */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-5 py-3">Member</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Joined</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredMembers.map((member) => {
                  const badge = ROLE_BADGES[member.role];
                  return (
                    <tr
                      key={member.id}
                      className="transition hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-white">
                              {member.name}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
                        >
                          {badge.label}
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

          {filteredMembers.length === 0 && (
            <div className="p-8 text-center text-xs text-zinc-500">
              No team members match your criteria.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}