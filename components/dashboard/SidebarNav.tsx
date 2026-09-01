"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Users,
  Settings,
  ChevronDown,
  Plus,
} from "lucide-react";
import { Team } from "@/types/team";


interface SidebarNavProps {
  getNavigationUrl: (endpoint: string) => string;
  teams?: Team[];
  onNavigate?: () => void;
}

export function SidebarNav({
  getNavigationUrl,
  teams = [],
  onNavigate,
}: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [teamsOpen, setTeamsOpen] = useState(false);

  // Auto-expand teams dropdown if currently inside any /teams path
  useEffect(() => {
    if (pathname.includes("/teams")) {
      setTeamsOpen(true);
    }
  }, [pathname]);

  const navItems = [
    { name: "Overview", endpoint: "", icon: LayoutDashboard },
    { name: "ID Generator", endpoint: "generator", icon: CreditCard },
    { name: "Attendees", endpoint: "attendees", icon: Users },
    { name: "Members", endpoint: "members", icon: Users },
  ];

  const teamsHref = getNavigationUrl("teams");
  const isTeamsActive = pathname.startsWith(teamsHref);

  // Clicking the main Teams text navigates to /teams AND opens the dropdown
  const handleTeamsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setTeamsOpen(true);
    router.push(teamsHref);
    onNavigate?.();
  };

  // Clicking the chevron toggle only toggles open/close state
  const handleToggleTeams = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTeamsOpen((prev) => !prev);
  };

  return (
    <div className="flex-1 flex flex-col justify-between">
      {/* Top Main Navigation */}
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const href = getNavigationUrl(item.endpoint);
          const isActive =
            item.endpoint === "" ? pathname === href : pathname.startsWith(href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={href}
              onClick={onNavigate}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* =========================================================
            TEAMS ROUTE + COLLAPSIBLE SUB-TEAMS
           ========================================================= */}
        <div>
          <div
            onClick={handleTeamsClick}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer group ${
              isTeamsActive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <div className="flex items-center space-x-3">
              <Users className="w-4 h-4 shrink-0" />
              <span>Teams</span>
            </div>

            {/* Collapse / Expand Trigger */}
            <button
              type="button"
              onClick={handleToggleTeams}
              className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition"
              aria-label="Toggle teams menu"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  teamsOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Sub-teams Dropdown */}
          {teamsOpen && (
            <div className="mt-1 ml-4 pl-3 border-l border-zinc-800 space-y-1">
              {teams.map((team) => {
                const teamHref = getNavigationUrl(`teams/${team.slug}`);
                const isTeamActive = pathname === teamHref;

                return (
                  <Link
                    key={team.id}
                    href={teamHref}
                    onClick={onNavigate}
                    className={`block px-2.5 py-1.5 rounded-lg text-xs font-medium truncate transition ${
                      isTeamActive
                        ? "bg-emerald-500/10 text-emerald-400 font-semibold"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    {team.name}
                  </Link>
                );
              })}

              <Link
                href={getNavigationUrl("teams/new")}
                onClick={onNavigate}
                className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition mt-1"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>Add New Team</span>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Pinned Settings Section */}
      <div className="p-4 border-t border-zinc-900">
        <Link
          href={getNavigationUrl("settings")}
          onClick={onNavigate}
          className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
            pathname.startsWith(getNavigationUrl("settings"))
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );
}