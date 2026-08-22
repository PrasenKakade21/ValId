"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  Users,
  UserCheck,
  HeartHandshake,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  FileSpreadsheet,
  Search,
  Loader2,
  RefreshCw,
  CreditCard,
} from "lucide-react";

interface RecentBadge {
  id: string;
  full_name: string;
  role: string;
  company: string | null;
  ticket_code: string;
  created_at: string;
  checked_in: boolean;
}

interface OverviewStats {
  totalGuests: number;
  guestsAdmitted: number;
  volunteersCount: number;
  issuesRaised: number;
}

export default function OverviewPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [recentBadges, setRecentBadges] = useState<RecentBadge[]>([]);
  const [stats, setStats] = useState<OverviewStats>({
    totalGuests: 0,
    guestsAdmitted: 0,
    volunteersCount: 0,
    issuesRaised: 0,
  });
const params = useParams();
  const eventId = params.eventId as string;      

  // Fetch overview metrics and recent records
  const fetchOverviewData = async () => {
 
    try {
        setLoading(true);

      // 1. Fetch recent 10 records
      const res = await fetch(`/api/dashboard/ids?page=1&limit=10`);
      const data = await res.json();

      if (res.ok) {
        setRecentBadges(data.attendees || []);
      }

      // 2. Fetch aggregate stats
      const statsRes = await fetch(`/api/dashboard/stats`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
    } catch (err) {
      console.error("Failed to load overview metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  // Filtered list for search preview
  const filteredBadges = recentBadges.filter(
    (b) =>
      b.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.ticket_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.company && b.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time counts for event attendance, volunteer staffing, and issues.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchOverviewData}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/dashboard/generator"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold rounded-xl flex items-center space-x-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Badges</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards: Total Guests, Admitted, Volunteers, Issues */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Guests */}
        <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Total Guests</span>
            <div className="p-2 bg-zinc-800/80 rounded-lg text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-zinc-500" /> : stats.totalGuests}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Total registered in database</p>
          </div>
        </div>

        {/* 2. Guests Admitted */}
        <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Guests Admitted</span>
            <div className="p-2 bg-zinc-800/80 rounded-lg text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-zinc-500" /> : stats.guestsAdmitted}
            </div>
            <p className="text-[11px] text-emerald-400 mt-1">
              {stats.totalGuests > 0
                ? `${Math.round((stats.guestsAdmitted / stats.totalGuests) * 100)}% turn-out rate`
                : "0% turn-out rate"}
            </p>
          </div>
        </div>

        {/* 3. Volunteers Count */}
        <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Volunteers Count</span>
            <div className="p-2 bg-zinc-800/80 rounded-lg text-indigo-400">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-zinc-500" /> : stats.volunteersCount}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Active staff & helpers</p>
          </div>
        </div>

        {/* 4. Issues Raised */}
        <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Issues Raised</span>
            <div className="p-2 bg-zinc-800/80 rounded-lg text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-zinc-500" /> : stats.issuesRaised}
            </div>
            <p className={`text-[11px] mt-1 ${stats.issuesRaised > 0 ? "text-rose-400" : "text-zinc-400"}`}>
              {stats.issuesRaised > 0 ? "Attention required" : "No open issues"}
            </p>
          </div>
        </div>
      </div>

      {/* Action Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold">Single Card Studio</h3>
            <p className="text-xs text-zinc-400">
              Manually create individual guest or volunteer badges with live database sync.
            </p>
          </div>
          <Link
            href="/dashboard/generator"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition pt-2"
          >
            <span>Open Studio</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold">Bulk CSV Engine</h3>
            <p className="text-xs text-zinc-400">
              Batch import attendees, sync volunteer lists, and export PDF print sheets.
            </p>
          </div>
          <Link
            href="/dashboard/generator"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition pt-2"
          >
            <span>Launch Engine</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold">Recent Registrations</h2>
            <p className="text-xs text-zinc-400">Latest guest records synchronized in real-time.</p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search recent records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="py-3 px-4 font-semibold">Name</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Company</th>
                <th className="py-3 px-4 font-semibold">Ticket Code</th>
                <th className="py-3 px-4 font-semibold">Admitted</th>
                <th className="py-3 px-4 font-semibold text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredBadges.map((badge) => (
                <tr key={badge.id} className="hover:bg-zinc-900/50 transition">
                  <td className="py-3 px-4 font-medium text-white">{badge.full_name}</td>
                  <td className="py-3 px-4 text-zinc-300">
                    <span className="px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-[10px]">
                      {badge.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-zinc-400">{badge.company || "—"}</td>
                  <td className="py-3 px-4 font-mono text-zinc-300">{badge.ticket_code}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        badge.checked_in
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                      }`}
                    >
                      {badge.checked_in ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-zinc-500 text-right">
                    {new Date(badge.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}