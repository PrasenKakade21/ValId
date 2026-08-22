"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Download,
  Trash2,
  RefreshCw,
  MoreVertical,
  Loader2,
  Ticket,
} from "lucide-react";
import useSWR from "swr"
import { fetcher } from "@/lib/fetcher";
import { useEvent } from "@/components/EventProvider";
// Database Schema Interface
export interface AttendeeRecord {
  id: string; // UUID
  ticket_code: string;
  full_name: string;
  role: string;
  company: string | null;
  email: string | null;
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
}
type AttendeesResponse = {
  success: boolean;
  attendees: AttendeeRecord[];
  pagination: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};
export default function AttendeesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
const event = useEvent();
  // Fetch attendees from API endpoint

    const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<AttendeesResponse>(
    `/api/events/${event.id}/attendees`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

const attendees = data?.attendees ?? [];

  // Toggle Check-in status
 const handleToggleCheckIn = async (
  id: string,
  currentStatus: boolean
) => {
  const updatedStatus = !currentStatus;
  const now = updatedStatus
    ? new Date().toISOString()
    : null;

  await mutate(
    async (currentData) => {
    if (!currentData) {
        throw new Error("Attendees data is not loaded");
      }
      const res = await fetch(  `/api/events/${event.id}/attendees/${id}`,
 {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checked_in: updatedStatus,
          checked_in_at: now,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update check-in state");
      }

      return currentData;
    },
    {
      optimisticData: (currentData) => {
  if (!currentData) {
    throw new Error("Attendees data is not loaded");
  }
        return {
          ...currentData,
          attendees: currentData.attendees.map((item) =>
            item.id === id
              ? {
                  ...item,
                  checked_in: updatedStatus,
                  checked_in_at: now,
                }
              : item
          ),
        };
      },
      rollbackOnError: true,
      revalidate: true,
    }
  );
};
  // Delete attendee record
const handleDelete = async (id: string) => {
  if (!confirm("Are you sure you want to delete this record?")) {
    return;
  }

  await mutate(
    async (currentData) => {
    if (!currentData) {
        throw new Error("Attendees data is not loaded");
      }
      const res = await fetch(`/api/events/${event.id}/attendees/${id}`,
 {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete attendee");
      }

      return currentData;
    },
    {
      optimisticData: (currentData) => {
  if (!currentData) {
    throw new Error("Attendees data is not loaded");
  }
        return {
          ...currentData,
          attendees: currentData.attendees.filter(
            (item) => item.id !== id
          ),
        };
      },
      rollbackOnError: true,
      revalidate: true,
    }
  );
};
  // Filtering Logic
  const filteredAttendees = useMemo(() => {
    return attendees.filter((item) => {
      const matchesSearch =
        item.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ticket_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.company && item.company.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRole =
        roleFilter === "all" ||
        item.role.toLowerCase() === roleFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "checked_in" && item.checked_in) ||
        (statusFilter === "pending" && !item.checked_in);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [attendees, searchQuery, roleFilter, statusFilter]);

  // Export filtered items to CSV
  const handleExportCSV = () => {
    const headers = ["Ticket Code", "Full Name", "Role", "Company", "Email", "Checked In", "Checked In At"];
    const csvRows = [
      headers.join(","),
      ...filteredAttendees.map((row) =>
        [
          `"${row.ticket_code}"`,
          `"${row.full_name}"`,
          `"${row.role}"`,
          `"${row.company || ""}"`,
          `"${row.email || ""}"`,
          row.checked_in ? "YES" : "NO",
          `"${row.checked_in_at ? new Date(row.checked_in_at).toLocaleString() : ""}"`,
        ].join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendees_export_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attendee Database</h1>
          <p className="text-xs text-zinc-400 mt-1">
            View, search, filter, and manage check-ins across all saved event badges.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
          onClick={() => mutate()}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold rounded-xl flex items-center space-x-2 transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Control Toolbar: Search & Filters */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search name, ticket code, email, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 placeholder:text-zinc-500"
          />
        </div>

        {/* Filter Switches */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                statusFilter === "all" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("checked_in")}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                statusFilter === "checked_in" ? "bg-zinc-800 text-emerald-400" : "text-zinc-400 hover:text-white"
              }`}
            >
              Checked In
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                statusFilter === "pending" ? "bg-zinc-800 text-amber-400" : "text-zinc-400 hover:text-white"
              }`}
            >
              Pending
            </button>
          </div>

          {/* Role Filter Selector */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-zinc-700 cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="speaker">Speaker</option>
              <option value="attendee">Attendee</option>
              <option value="vip">VIP</option>
              <option value="sponsor">Sponsor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Attendees Table */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-3 text-zinc-500">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            <span className="text-xs">Fetching attendee records...</span>
          </div>
        ) : filteredAttendees.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-zinc-300">No attendees found</p>
            <p className="text-xs text-zinc-500">
              Try adjusting your search criteria or add attendees via the generator page.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400">
                  <th className="py-3.5 px-4 font-semibold">Attendee</th>
                  <th className="py-3.5 px-4 font-semibold">Ticket Code</th>
                  <th className="py-3.5 px-4 font-semibold">Role</th>
                  <th className="py-3.5 px-4 font-semibold">Company</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Check-in Time</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredAttendees.map((record) => (
                  <tr key={record.id} className="hover:bg-zinc-900/50 transition">
                    {/* Attendee Info */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-white">{record.full_name}</p>
                        <p className="text-[11px] text-zinc-500">{record.email || "No email provided"}</p>
                      </div>
                    </td>

                    {/* Ticket Code */}
                    <td className="py-3.5 px-4 font-mono text-zinc-300">
                      <div className="inline-flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-md">
                        <Ticket className="w-3 h-3 text-emerald-400" />
                        <span>{record.ticket_code}</span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700/80 text-[10px] text-zinc-300">
                        {record.role}
                      </span>
                    </td>

                    {/* Company */}
                    <td className="py-3.5 px-4 text-zinc-400">
                      {record.company || "—"}
                    </td>

                    {/* Status Toggle Button */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleCheckIn(record.id, record.checked_in)}
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border transition ${
                          record.checked_in
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                        }`}
                      >
                        {record.checked_in ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                            <span>Checked In</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 shrink-0" />
                            <span>Pending</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Check-in Time */}
                    <td className="py-3.5 px-4 text-zinc-500 text-[11px]">
                      {record.checked_in_at
                        ? new Date(record.checked_in_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "numeric",
                            month: "short",
                          })
                        : "—"}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Summary */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/40 flex justify-between items-center text-xs text-zinc-400">
          <span>
            Showing <strong className="text-white">{filteredAttendees.length}</strong> of{" "}
            <strong className="text-white">{attendees.length}</strong> records
          </span>
          <span className="text-[11px] text-zinc-500">
            Database updated in real-time
          </span>
        </div>
      </div>
    </div>
  );
}