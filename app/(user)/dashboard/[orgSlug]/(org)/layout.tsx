"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import useSWR from "swr";
import { EventProvider } from "@/components/EventProvider";
import {
  LayoutDashboard,
  CreditCard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  BadgeCheck,
  ChevronsUpDown,
  Plus,
  Check,
  Calendar,
  Building2,
} from "lucide-react";

import { fetcher } from "@/lib/fetcher";
import { createClient } from "@/lib/supabase/client";


const navigation = [
  {
    name: "Overview",
    endpoint: "",
    icon: LayoutDashboard,
  },
  {
    name: "ID Generator",
    endpoint: "generator",
    icon: CreditCard,
  },
  {
    name: "Attendees",
    endpoint: "attendees",
    icon: Users,
  },
  {
    name: "Volunteers",
    endpoint: "volunteers",
    icon: Users,
  },
  {
    name: "Settings",
    endpoint: "settings",
    icon: Settings,
  },
];


type Organization = {
  id: string;
  name: string;
  slug: string;
  role: string;
};


type Event = {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  status: string;
};


type DashboardData = {
  user: {
    id: string;
    email?: string;
    name?: string | null;
  };

  organizations: Organization[];

  events: Event[];
};


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();

  const orgSlug = params.orgSlug as string;
  const eventSlug = params.eventSlug as string;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [eventDropdownOpen, setEventDropdownOpen] = useState(false);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);

  /*
   * =========================================================
   * FETCH DASHBOARD DATA
   * =========================================================
   */

  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<DashboardData>(
    "/api/dashboard",
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );


  const organizations = data?.organizations ?? [];
  const events : Event[] = data?.events ?? [];
  console.log("events client: ", events)

  /*
   * =========================================================
   * CURRENT ORGANIZATION
   * =========================================================
   */

  const selectedOrg = useMemo(() => {
    return organizations.find(
      (org) => org.slug === orgSlug
    );
  }, [organizations, orgSlug]);


  /*
   * =========================================================
   * EVENTS FOR CURRENT ORGANIZATION
   * =========================================================
   */

  const organizationEvents : Event[] = useMemo(() => {
    if (!selectedOrg) return [];

    return events.filter(
      (event) =>
        event.org_id === selectedOrg.id
    );
  }, [events, selectedOrg]);


  /*
   * =========================================================
   * CURRENT EVENT
   * =========================================================
   */

  const selectedEvent = useMemo(() => {
    return organizationEvents.find(
      (event) => event.slug === eventSlug
    );
  }, [organizationEvents, eventSlug]);


  /*
   * =========================================================
   * HANDLE INVALID ORGANIZATION / EVENT
   * =========================================================
   */

  useEffect(() => {
    if (isLoading) return;

    if (!data) return;

    /*
     * No organizations
     */
    if (organizations.length === 0) {
      return;
    }

    /*
     * Invalid organization
     */
    if (!selectedOrg) {
      const firstOrg = organizations[0];

      const firstEvent = events.find(
        (event) =>
          event.org_id === firstOrg.id
      );

      if (firstEvent) {
        router.replace(
          `/dashboard/${firstOrg.slug}/${firstEvent.slug}`
        );
      }

      return;
    }

    /*
     * Invalid event
     */
    if (!selectedEvent) {
      const firstEvent =
        organizationEvents[0];

      if (firstEvent) {
        router.replace(
          `/dashboard/${selectedOrg.slug}/${firstEvent.slug}`
        );
      }
    }
  }, [
    data,
    isLoading,
    organizations,
    events,
    selectedOrg,
    selectedEvent,
    organizationEvents,
    router,
  ]);


  /*
   * =========================================================
   * NAVIGATION
   * =========================================================
   */

  const getNavigationUrl = (
    endpoint: string
  ) => {
    if (!selectedOrg || !selectedEvent) {
      return "#";
    }

    const base =
      `/dashboard/${selectedOrg.slug}/${selectedEvent.slug}`;

    return endpoint
      ? `${base}/${endpoint}`
      : base;
  };


  /*
   * =========================================================
   * CHANGE ORGANIZATION
   * =========================================================
   */

  const handleOrganizationChange = (
    organization: Organization
  ) => {
    const firstEvent = events.find(
      (event) =>
        event.org_id === organization.id
    );

    setOrgDropdownOpen(false);

    if (!firstEvent) {
      return;
    }

    router.push(
      `/dashboard/${organization.slug}/${firstEvent.slug}`
    );
  };


  /*
   * =========================================================
   * CHANGE EVENT
   * =========================================================
   */

  const handleEventChange = (
    event: Event
  ) => {
    setEventDropdownOpen(false);

    if (!selectedOrg) {
      return;
    }

    router.push(
      `/dashboard/${selectedOrg.slug}/${event.slug}`
    );
  };


  /*
   * =========================================================
   * SIGN OUT
   * =========================================================
   */

  const handleSignOut = async () => {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  };


  /*
   * =========================================================
   * ROLE BADGE
   * =========================================================
   */

  const getRoleBadgeStyle = (
    role: string
  ) => {
    switch (role.toLowerCase()) {
      case "owner":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

      case "admin":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";

      case "volunteer":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";

      default:
        return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  };


  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-sm text-zinc-500">
          Loading dashboard...
        </div>
      </div>
    );
  }


  /*
   * =========================================================
   * ERROR
   * =========================================================
   */

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-400">
            Failed to load dashboard
          </p>

          <button
            onClick={() => mutate()}
            className="mt-3 text-xs text-zinc-400 hover:text-white"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }


  /*
   * =========================================================
   * NO ORGANIZATIONS
   * =========================================================
   */

  if (organizations.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-10 h-10 text-zinc-600 mx-auto mb-4" />

          <h2 className="text-lg font-semibold">
            No organizations
          </h2>

          <p className="text-sm text-zinc-500 mt-1">
            You are not a member of any organization yet.
          </p>

          <button
            className="mt-5 px-4 py-2 rounded-xl bg-emerald-500 text-black text-sm font-semibold"
          >
            Create Organization
          </button>
        </div>
      </div>
    );
  }


  /*
   * =========================================================
   * DASHBOARD UI
   * =========================================================
   */

  return (
    <div className="min-h-screen bg-black text-white flex">

      {/* Mobile overlay */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800 transform transition-transform duration-200 ease-in-out flex flex-col justify-between ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >

        <div>

          {/* Brand */}

          <div className="flex items-center justify-between h-16 px-6 border-b border-zinc-800">

            <div className="flex items-center space-x-2">

              <BadgeCheck className="w-6 h-6 text-emerald-400" />

              <span className="font-bold text-lg tracking-tight">
                Studio Admin
              </span>

            </div>

            <button
              onClick={() =>
                setSidebarOpen(false)
              }
              className="lg:hidden text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

          </div>


          {/* =================================================
              EVENT SELECTOR
          ================================================= */}

          <div className="p-4 border-b border-zinc-800 relative">

            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 px-1">
              Select Event
            </label>

            <button
              onClick={() => {
                setEventDropdownOpen(
                  !eventDropdownOpen
                );

                setOrgDropdownOpen(false);
              }}
              className="w-full flex items-center justify-between bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl px-3 py-2.5 transition text-left"
            >

              <div className="flex items-center space-x-2.5 truncate">

                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">

                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />

                </div>

                <div className="truncate">

                  <p className="text-xs font-semibold text-zinc-100 truncate">

                    {selectedEvent?.name ??
                      "Select Event"}

                  </p>

                </div>

              </div>

              <ChevronsUpDown className="w-4 h-4 text-zinc-500 shrink-0" />

            </button>


            {/* Event popup */}

            {eventDropdownOpen && (
              <>

                <div
                  className="fixed inset-0 z-10"
                  onClick={() =>
                    setEventDropdownOpen(false)
                  }
                />

                <div className="absolute left-4 right-4 top-[70px] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-20 overflow-hidden p-1">

                  <div className="max-h-52 overflow-y-auto space-y-0.5">

                    {organizationEvents.map(
                      (event) => {

                        const isSelected =
                          event.id ===
                          selectedEvent?.id;

                        return (
                          <button
                            key={event.id}
                            onClick={() =>
                              handleEventChange(event)
                            }
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                              isSelected
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
                            }`}
                          >

                            <span className="truncate">
                              {event.name}
                            </span>

                            {isSelected && (
                              <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                            )}

                          </button>
                        );
                      }
                    )}

                  </div>


                  <div className="pt-1 mt-1 border-t border-zinc-800">

                    <button
                      onClick={() => {
                        router.push(
                          `/dashboard/${selectedOrg?.slug}/events/new`
                        );
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
                    >
                      <Plus className="w-3.5 h-3.5" />

                      <span>
                        Create New Event
                      </span>
                    </button>

                  </div>

                </div>

              </>
            )}

          </div>


          {/* =================================================
              NAVIGATION
          ================================================= */}

          <nav className="p-4 space-y-1">

            {navigation.map((item) => {

              const href =
                getNavigationUrl(
                  item.endpoint
                );

              /*
               * Base event URL is overview.
               */

              const isActive =
                item.endpoint === ""
                  ? pathname === href
                  : pathname.startsWith(href);

              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={href}
                  onClick={() =>
                    setSidebarOpen(false)
                  }
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

          </nav>

        </div>


        {/* =================================================
            SIGN OUT
        ================================================= */}

        <div className="p-4 border-t border-zinc-800">

          <button
            onClick={handleSignOut}
            className="flex items-center space-x-3 w-full px-3 py-2.5 text-xs font-semibold text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-xl transition"
          >
            <LogOut className="w-4 h-4 shrink-0" />

            <span>
              Sign Out
            </span>

          </button>

        </div>

      </aside>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="flex-1 flex flex-col min-w-0">

        <header className="h-16 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-6 lg:px-8 relative">

          <div className="flex items-center space-x-4">

            <button
              onClick={() =>
                setSidebarOpen(true)
              }
              className="lg:hidden text-zinc-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>


            {/* =================================================
                ORGANIZATION SELECTOR
            ================================================= */}

            <div className="relative">

              <button
                onClick={() => {
                  setOrgDropdownOpen(
                    !orgDropdownOpen
                  );

                  setEventDropdownOpen(false);
                }}
                className="flex items-center space-x-2.5 bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl px-3 py-1.5 transition text-left"
              >

                <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />

                <div className="flex items-center space-x-2">

                  <span className="text-xs font-semibold text-zinc-100 truncate max-w-[140px] sm:max-w-[200px]">

                    {selectedOrg?.name}

                  </span>

                  {selectedOrg && (
                    <span
                      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${getRoleBadgeStyle(
                        selectedOrg.role
                      )}`}
                    >
                      {selectedOrg.role}
                    </span>
                  )}

                </div>

                <ChevronsUpDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />

              </button>


              {/* Organization popup */}

              {orgDropdownOpen && (
                <>

                  <div
                    className="fixed inset-0 z-10"
                    onClick={() =>
                      setOrgDropdownOpen(false)
                    }
                  />

                  <div className="absolute left-0 top-[48px] w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-20 overflow-hidden p-1">

                    <div className="px-2 py-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Select Organization
                    </div>

                    <div className="max-h-52 overflow-y-auto space-y-0.5">

                      {organizations.map(
                        (org) => {

                          const isSelected =
                            org.id ===
                            selectedOrg?.id;

                          return (
                            <button
                              key={org.id}
                              onClick={() =>
                                handleOrganizationChange(
                                  org
                                )
                              }
                              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                                isSelected
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
                              }`}
                            >

                              <div className="flex items-center space-x-2 truncate">

                                <Building2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />

                                <span className="truncate">
                                  {org.name}
                                </span>

                              </div>


                              <div className="flex items-center space-x-1.5 shrink-0 ml-2">

                                <span
                                  className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${getRoleBadgeStyle(
                                    org.role
                                  )}`}
                                >
                                  {org.role}
                                </span>

                                {isSelected && (
                                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                )}

                              </div>

                            </button>
                          );
                        }
                      )}

                    </div>


                    <div className="pt-1 mt-1 border-t border-zinc-800">

                      <button
                        onClick={() =>
                          router.push(
                            "/dashboard/organizations/new"
                          )
                        }
                        className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
                      >

                        <Plus className="w-3.5 h-3.5" />

                        <span>
                          Create Organization
                        </span>

                      </button>

                    </div>

                  </div>

                </>
              )}

            </div>

          </div>


          {/* =================================================
              USER
          ================================================= */}

          <div className="flex items-center space-x-4 ml-auto">

            <div className="flex items-center space-x-3">

              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold border border-zinc-700">

                {(
                  data?.user?.name ??
                  data?.user?.email ??
                  "U"
                )
                  .charAt(0)
                  .toUpperCase()}

              </div>

              <div className="hidden sm:block text-left">

                <p className="text-xs font-semibold text-zinc-200">

                  {data?.user?.name ??
                    "User"}

                </p>

                <p className="text-[10px] text-zinc-400">

                  {data?.user?.email}

                </p>

              </div>

            </div>

          </div>

        </header>


        {/* =================================================
            PAGE CONTENT
        ================================================= */}
 <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
    {!selectedEvent ? (
      <div>Event not found</div>
    ) : (
      <EventProvider event={selectedEvent}>
        {children}
      </EventProvider>
    )}
  </main>

      </div>

    </div>
  );
}