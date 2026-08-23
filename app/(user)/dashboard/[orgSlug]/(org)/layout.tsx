"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { EventProvider } from "@/components/EventProvider";
import {
  LogOut,
  Menu,
  X,
  BadgeCheck,
  Building2,
} from "lucide-react";

import { fetcher } from "@/lib/fetcher";
import { createClient } from "@/lib/supabase/client";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { EventSelector } from "@/components/dashboard/EventSelector";
import { OrgSelector } from "@/components/dashboard/OrgSelector";
import { Organization } from "@/types/org";
import { Event } from "@/types/event";
import { Team } from "@/types/team";
import { DashboardData } from "@/types/dashboard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useParams();

  const orgSlug = params.orgSlug as string;
  const eventSlug = params.eventSlug as string;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [eventDropdownOpen, setEventDropdownOpen] = useState(false);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);

  /*
   * FETCH DASHBOARD DATA
   */
const { 
  data: dashboardData, 
  error: dashboardError, 
  isLoading: isDashboardLoading,
  mutate: dashboardMutate
} = useSWR<DashboardData>(
  "/api/dashboard",
  fetcher,
  {
    refreshInterval: 180000,
    revalidateOnFocus: false,
  }
);

  const organizations = dashboardData?.organizations ?? [];
  const events: Event[] = dashboardData?.events ?? [];

  /*
   * CURRENT ORGANIZATION & EVENTS
   */
  const selectedOrg = useMemo(() => {
    return organizations.find((org) => org.slug === orgSlug);
  }, [organizations, orgSlug]);

  const organizationEvents: Event[] = useMemo(() => {
    if (!selectedOrg) return [];
    return events.filter((event) => event.org_id === selectedOrg.id);
  }, [events, selectedOrg]);

  const selectedEvent = useMemo(() => {
    return organizationEvents.find((event) => event.slug === eventSlug);
  }, [organizationEvents, eventSlug]);
/*
 * CONDITIONAL SWR FETCH FOR TEAMS
 * Passing `null` stops SWR from firing when IDs are not ready.
 */
const teamsKey = selectedOrg?.id && selectedEvent?.id
  ? `/api/events/${selectedEvent.id}/teams`
  : null;
const {
  data: teamsData,
  error: teamsError,
  isLoading: isTeamsLoading,
  mutate: mutateTeams,
} = useSWR<Team[]>(
  teamsKey,
  fetcher,
  {
    refreshInterval: 180000,
    revalidateOnFocus: false,
  }
);

const teams: Team[] = teamsData ?? [];
  /*
   * HANDLE INVALID ORGANIZATION / EVENT
   */
  useEffect(() => {
    if (isDashboardLoading || !dashboardData || organizations.length === 0) return;

    if (!selectedOrg) {
      const firstOrg = organizations[0];
      const firstEvent = events.find((e) => e.org_id === firstOrg.id);

      if (firstEvent) {
        router.replace(`/dashboard/${firstOrg.slug}/${firstEvent.slug}`);
      }
      return;
    }

    if (!selectedEvent) {
      const firstEvent = organizationEvents[0];
      if (firstEvent) {
        router.replace(`/dashboard/${selectedOrg.slug}/${firstEvent.slug}`);
      }
    }
  }, [
    dashboardData,
    isDashboardLoading,
    organizations,
    events,
    selectedOrg,
    selectedEvent,
    organizationEvents,
    router,
  ]);

  const getNavigationUrl = (endpoint: string) => {
    if (!selectedOrg || !selectedEvent) return "#";
    const base = `/dashboard/${selectedOrg.slug}/${selectedEvent.slug}`;
    return endpoint ? `${base}/${endpoint}` : base;
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-sm text-zinc-500">Loading dashboard...</div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-400">Failed to load dashboard</p>
          <button
            onClick={() => (dashboardMutate)}
            className="mt-3 text-xs text-zinc-400 hover:text-white"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-10 h-10 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold">No organizations</h2>
          <p className="text-sm text-zinc-500 mt-1">
            You are not a member of any organization yet.
          </p>
          <button className="mt-5 px-4 py-2 rounded-xl bg-emerald-500 text-black text-sm font-semibold">
            Create Organization
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800 transform transition-transform duration-200 ease-in-out flex flex-col justify-between ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-zinc-800">
            <div className="flex items-center space-x-2">
              <BadgeCheck className="w-6 h-6 text-emerald-400" />
              <span className="font-bold text-lg tracking-tight">
                Studio Admin
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Event Selector Component */}
          <EventSelector
            events={organizationEvents}
            selectedEvent={selectedEvent}
            selectedOrg={selectedOrg}
            isOpen={eventDropdownOpen}
            setIsOpen={setEventDropdownOpen}
            onDropdownToggle={() => setOrgDropdownOpen(false)}
          />

          {/* Sidebar Navigation Component */}
          <SidebarNav
            getNavigationUrl={getNavigationUrl}
            teams={teams}
            onNavigate={() => setSidebarOpen(false)}
          />
        </div>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-3 w-full px-3 py-2.5 text-xs font-semibold text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-xl transition"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN BODY */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-6 lg:px-8 relative">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-zinc-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Org Selector Component */}
            <OrgSelector
              organizations={organizations}
              selectedOrg={selectedOrg}
              events={events}
              isOpen={orgDropdownOpen}
              setIsOpen={setOrgDropdownOpen}
              onDropdownToggle={() => setEventDropdownOpen(false)}
            />
          </div>

          {/* User Profile Info */}
          <div className="flex items-center space-x-4 ml-auto">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold border border-zinc-700">
                {(dashboardData?.user?.name ?? dashboardData?.user?.email ?? "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-zinc-200">
                  {dashboardData?.user?.name ?? "User"}
                </p>
                <p className="text-[10px] text-zinc-400">
                  {dashboardData?.user?.email}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {!selectedEvent || !selectedOrg ? (
            <div>Event or Org not found</div>
          ) : (
            <EventProvider event={selectedEvent} org={selectedOrg}>{children}</EventProvider>
          )}
        </main>
      </div>
    </div>
  );
}