"use client";

import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Plus,
  Building2,
  Users,
  ShieldCheck,
  ArrowUpRight,
  MapPin,
} from "lucide-react";

import Link from "next/link";
import useSWR from "swr";

import { fetcher } from "@/lib/fetcher";


// ===========================================================
// TYPES
// ===========================================================

type Organization = {
  id: string;
  name: string;
  slug: string;

  role:
    | "owner"
    | "admin"
    | "staff"
    | "volunteer";

  members: number;
  events: number;
};

type UpcomingEvent = {
  id: string;
  name: string;
  slug: string;

  organization: string;
  organizationSlug: string;

  date: string;
  location: string;

  status:
    | "Upcoming"
    | "Ongoing"
    | "Ended"
    | "Draft";

  role: string;
};

type DashboardData = {
  user: {
    id: string;
    email: string | null;
    name: string | null;
  };

  organizations: Organization[];

  events: any[];

  upcomingEvents: UpcomingEvent[];

  stats: {
    organizations: number;
    upcomingEvents: number;
    members: number;
    roles: number;
  };
};


// ===========================================================
// ORGANIZATION CARD
// ===========================================================

function OrganizationCard({
  organization,
}: {
  organization: Organization;
}) {
  /*
   * We need an event to create the full dashboard URL.
   *
   * The API returns all events separately, so the card itself
   * receives the organization only. We'll make the card link
   * to the organization-level page for now.
   *
   * If you want every organization card to open directly into
   * its first event, pass the organization's first event too.
   */

  return (
    <Link
      href={`/dashboard/${organization.slug}`}
      className="group block rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
    >
      <div className="flex items-start justify-between">

        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-sm font-bold text-zinc-700 dark:bg-zinc-800 dark:text-white"
        >
          {organization.name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>

        <ArrowUpRight
          size={18}
          className="text-zinc-400 transition group-hover:text-zinc-900 dark:group-hover:text-white"
        />

      </div>


      <div className="mt-5">

        <h3 className="font-semibold text-zinc-900 dark:text-white">
          {organization.name}
        </h3>

        <div className="mt-1 flex items-center gap-2">

          <span className="text-sm capitalize text-zinc-500">
            {organization.role}
          </span>

          {organization.role === "owner" && (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-700 dark:bg-violet-500/10 dark:text-violet-400">
              Owner
            </span>
          )}

        </div>

      </div>


      <div className="mt-5 flex gap-5 text-sm text-zinc-500">

        <span className="flex items-center gap-1.5">
          <Users size={15} />

          {organization.members}
        </span>

        <span className="flex items-center gap-1.5">
          <CalendarDays size={15} />

          {organization.events} events
        </span>

      </div>

    </Link>
  );
}


// ===========================================================
// EVENT CARD
// ===========================================================

function EventCard({
  event,
}: {
  event: UpcomingEvent;
}) {
  return (
    <Link
      href={`/dashboard/${event.organizationSlug}/${event.slug}`}
      className="group flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
    >

      {/* Event icon */}

      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">

        <CalendarDays
          size={19}
          className="text-zinc-700 dark:text-zinc-300"
        />

      </div>


      {/* Event information */}

      <div className="min-w-0 flex-1">

        <div className="flex items-center gap-2">

          <h3 className="truncate font-semibold text-zinc-900 dark:text-white">
            {event.name}
          </h3>

          <span
            className={`
              hidden rounded-full px-2 py-0.5
              text-[10px] font-medium sm:block

              ${
                event.status === "Ongoing"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
              }
            `}
          >
            {event.status}
          </span>

        </div>


        <p className="mt-1 text-sm text-zinc-500">
          {event.organization}
        </p>


        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">

          <span className="flex items-center gap-1.5">
            <Clock3 size={13} />

            {event.date}
          </span>


          <span className="flex items-center gap-1.5">
            <MapPin size={13} />

            {event.location}
          </span>

        </div>

      </div>


      {/* Role */}

      <div className="hidden items-center gap-2 text-xs text-zinc-500 sm:flex">

        <span className="capitalize">
          {event.role}
        </span>

        <ChevronRight
          size={17}
          className="transition group-hover:translate-x-0.5 group-hover:text-zinc-900 dark:group-hover:text-white"
        />

      </div>

    </Link>
  );
}


// ===========================================================
// LOADING SKELETON
// ===========================================================

function DashboardSkeleton() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">

        <div className="animate-pulse">

          <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />

          <div className="mt-3 h-9 w-72 rounded bg-zinc-200 dark:bg-zinc-800" />

          <div className="mt-3 h-4 w-96 max-w-full rounded bg-zinc-200 dark:bg-zinc-800" />


          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">

            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-28 rounded-2xl bg-zinc-200 dark:bg-zinc-800"
                />
              )
            )}

          </div>


          <div className="mt-10 space-y-3">

            {[1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className="h-24 rounded-2xl bg-zinc-200 dark:bg-zinc-800"
                />
              )
            )}

          </div>

        </div>

      </div>

    </main>
  );
}


// ===========================================================
// MAIN DASHBOARD
// ===========================================================

export default function DashboardPage() {

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


  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------

  if (isLoading) {
    return <DashboardSkeleton />;
  }


  // ---------------------------------------------------------
  // ERROR
  // ---------------------------------------------------------

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">

        <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-5">

          <div className="text-center">

            <p className="text-sm font-medium text-red-500">
              Failed to load dashboard
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              {error.message}
            </p>

            <button
              onClick={() => mutate()}
              className="mt-4 rounded-xl bg-zinc-950 px-4 py-2 text-xs font-medium text-white dark:bg-white dark:text-zinc-950"
            >
              Try again
            </button>

          </div>

        </div>

      </main>
    );
  }


  if (!data) {
    return null;
  }


  // ---------------------------------------------------------
  // DATA
  // ---------------------------------------------------------

  const {
    user,
    organizations,
    upcomingEvents,
    stats,
  } = data;


  // ---------------------------------------------------------
  // ORGANIZATION GROUPS
  // ---------------------------------------------------------

  const myOrganizations =
    organizations.filter(
      (organization) =>
        organization.role === "owner" ||
        organization.role === "admin" ||
        organization.role === "staff"
    );


  const joinedOrganizations =
    organizations.filter(
      (organization) =>
        organization.role === "volunteer"
    );


  // ---------------------------------------------------------
  // GREETING
  // ---------------------------------------------------------

  const displayName =
    user.name ||
    user.email?.split("@")[0] ||
    "there";


  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <div>

            <p className="text-sm font-medium text-zinc-500">
              Your workspace
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Good afternoon, {displayName}
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Everything happening across your organizations and events.
            </p>

          </div>


          <Link
            href="/dashboard/org/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >

            <Plus size={17} />

            Create organization

          </Link>

        </div>


        {/* =================================================
            QUICK STATS
        ================================================= */}

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">


          {/* Organizations */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">

            <Building2
              size={18}
              className="text-zinc-400"
            />

            <p className="mt-4 text-2xl font-bold text-zinc-950 dark:text-white">
              {stats.organizations}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Organizations
            </p>

          </div>


          {/* Upcoming events */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">

            <CalendarDays
              size={18}
              className="text-zinc-400"
            />

            <p className="mt-4 text-2xl font-bold text-zinc-950 dark:text-white">
              {stats.upcomingEvents}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Upcoming events
            </p>

          </div>


          {/* Members */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">

            <Users
              size={18}
              className="text-zinc-400"
            />

            <p className="mt-4 text-2xl font-bold text-zinc-950 dark:text-white">
              {stats.members}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Total members
            </p>

          </div>


          {/* Roles */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">

            <ShieldCheck
              size={18}
              className="text-zinc-400"
            />

            <p className="mt-4 text-2xl font-bold text-zinc-950 dark:text-white">
              {stats.roles}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Active roles
            </p>

          </div>

        </div>


        {/* =================================================
            UPCOMING EVENTS
        ================================================= */}

        <section className="mt-10">

          <div className="mb-4 flex items-center justify-between">

            <div>

              <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
                Upcoming events
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Events you're involved in.
              </p>

            </div>


            <Link
              href="/dashboard/events"
              className="flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
            >

              View all

              <ChevronRight size={16} />

            </Link>

          </div>


          <div className="space-y-3">

            {upcomingEvents.length === 0 ? (

              <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-800">

                <CalendarDays
                  size={24}
                  className="mx-auto text-zinc-400"
                />

                <p className="mt-3 text-sm font-medium text-zinc-900 dark:text-white">
                  No upcoming events
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Events you are involved in will appear here.
                </p>

              </div>

            ) : (

              upcomingEvents.map(
                (event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                  />
                )
              )

            )}

          </div>

        </section>


        {/* =================================================
            MY ORGANIZATIONS
        ================================================= */}

        <section className="mt-10">

          <div className="mb-4">

            <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
              My organizations
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Organizations you own or help manage.
            </p>

          </div>


          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {myOrganizations.map(
              (organization) => (
                <OrganizationCard
                  key={organization.id}
                  organization={organization}
                />
              )
            )}


            {/* Create organization */}

            <Link
              href="/dashboard/org/new"
              className="flex min-h-[190px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-transparent text-center transition hover:border-zinc-400 hover:bg-white dark:border-zinc-700 dark:hover:bg-zinc-900"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">

                <Plus size={19} />

              </div>

              <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">
                Create organization
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Start managing your own events
              </p>

            </Link>

          </div>

        </section>


        {/* =================================================
            JOINED ORGANIZATIONS
        ================================================= */}

        {joinedOrganizations.length > 0 && (

          <section className="mt-10">

            <div className="mb-4">

              <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
                Joined organizations
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Organizations where you're a member.
              </p>

            </div>


            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {joinedOrganizations.map(
                (organization) => (
                  <OrganizationCard
                    key={organization.id}
                    organization={organization}
                  />
                )
              )}

            </div>

          </section>

        )}


        {/* =================================================
            BOTTOM CTA
        ================================================= */}

        <section className="mt-10 overflow-hidden rounded-2xl bg-zinc-950 p-6 text-white sm:p-8 dark:bg-zinc-900">

          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">

            <div>

              <p className="text-lg font-semibold">
                Organizing something?
              </p>

              <p className="mt-1 max-w-lg text-sm text-zinc-400">
                Create an organization and start managing events,
                attendees, volunteers and IDs in one place.
              </p>

            </div>


            <Link
              href="/dashboard/org/new"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >

              <Plus size={17} />

              Create organization

            </Link>

          </div>

        </section>

      </div>

    </main>
  );
}