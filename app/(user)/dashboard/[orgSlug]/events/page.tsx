import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    orgSlug: string;
  }>;
};

export default async function EventsPage({ params }: PageProps) {
  const { orgSlug } = await params;

  const supabase = await createClient();

  // ---------------------------------------------------------
  // AUTH
  // ---------------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ---------------------------------------------------------
  // GET ORGANIZATION
  // ---------------------------------------------------------

  const { data: organization, error: organizationError } = await supabase
    .from("orgs")
    .select(`
      id,
      name,
      slug,
      description
    `)
    .eq("slug", orgSlug)
    .single();

  if (organizationError || !organization) {
    console.error("Error Loading Org: ", organizationError);
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">
            Organization not found
          </h1>

          <p className="mt-2 text-zinc-400">
            The organization you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // GET EVENTS
  // ---------------------------------------------------------

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select(`
      id,
      name,
      slug,
      description,
      starts_at,
      ends_at,
      location,
      created_at
    `)
    .eq("org_id", organization.id)
    .order("starts_at", {
      ascending: true,
    });

  if (eventsError) {
    console.error(eventsError);
  }

  const eventList = events ?? [];

  // ---------------------------------------------------------
  // STATS
  // ---------------------------------------------------------

  const now = new Date();

  const upcomingEvents = eventList.filter(
    (event) => new Date(event.starts_at) > now
  );

  const ongoingEvents = eventList.filter((event) => {
    const start = new Date(event.starts_at);
    const end = event.ends_at
      ? new Date(event.ends_at)
      : start;

    return start <= now && end >= now;
  });

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* ------------------------------------------------ */}
        {/* HEADER */}
        {/* ------------------------------------------------ */}

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Link
                href={`/dashboard/${organization.slug}`}
                className="hover:text-white transition"
              >
                {organization.name}
              </Link>

              <span>/</span>

              <span className="text-zinc-300">
                Events
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              Events
            </h1>

            <p className="mt-1 text-zinc-400">
              Manage all events for {organization.name}.
            </p>
          </div>

          {/* CREATE EVENT */}

          <Link
            href={`/dashboard/${organization.slug}/events/new`}
            className="
              inline-flex
              items-center
              justify-center
              rounded-xl
              bg-white
              px-5
              py-3
              text-sm
              font-semibold
              text-black
              transition
              hover:bg-zinc-200
            "
          >
            <span className="mr-2 text-lg">+</span>
            Create Event
          </Link>

        </div>

        {/* ------------------------------------------------ */}
        {/* STATS */}
        {/* ------------------------------------------------ */}

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <StatCard
            title="Total Events"
            value={eventList.length}
          />

          <StatCard
            title="Upcoming"
            value={upcomingEvents.length}
          />

          <StatCard
            title="Ongoing"
            value={ongoingEvents.length}
          />

        </div>

        {/* ------------------------------------------------ */}
        {/* EVENTS */}
        {/* ------------------------------------------------ */}

        <div className="mt-10">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-xl font-semibold">
                All Events
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Events created under this organization.
              </p>
            </div>

          </div>

          {eventList.length === 0 ? (
            <EmptyEvents
              orgSlug={organization.slug}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

              {eventList.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  orgSlug={organization.slug}
                />
              ))}

            </div>
          )}

        </div>

      </div>
    </main>
  );
}


// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-900/50
        p-5
      "
    >
      <p className="text-sm text-zinc-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}


// =========================================================
// EVENT CARD
// =========================================================

function EventCard({
  event,
  orgSlug,
}: {
  event: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    starts_at: string;
    ends_at?: string | null;
    location?: string | null;
  };
  orgSlug: string;
}) {
  const now = new Date();

  const start = new Date(event.starts_at);

  const end = event.ends_at
    ? new Date(event.ends_at)
    : start;

  let status = "Upcoming";

  if (start <= now && end >= now) {
    status = "Live";
  }

  if (end < now) {
    status = "Ended";
  }

  return (
    <Link
      href={`/${orgSlug}/${event.slug}`}
      className="
        group
        block
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-900/50
        p-5
        transition
        hover:border-zinc-600
        hover:bg-zinc-900
      "
    >

      {/* DATE */}

      <div className="flex items-start justify-between">

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            {new Date(event.starts_at).toLocaleDateString(
              "en-IN",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              }
            )}
          </p>
        </div>

        <StatusBadge status={status} />

      </div>

      {/* TITLE */}

      <h3 className="
        mt-5
        text-lg
        font-semibold
        transition
        group-hover:text-zinc-300
      ">
        {event.name}
      </h3>

      {/* DESCRIPTION */}

      {event.description && (
        <p className="
          mt-2
          line-clamp-2
          text-sm
          leading-6
          text-zinc-500
        ">
          {event.description}
        </p>
      )}

      {/* DETAILS */}

      <div className="mt-5 space-y-2 text-sm text-zinc-500">

        {event.location && (
          <div className="flex items-center gap-2">
            <span>Location</span>
            <span className="text-zinc-300">
              {event.location}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span>Starts</span>

          <span className="text-zinc-300">
            {new Date(event.starts_at).toLocaleTimeString(
              "en-IN",
              {
                hour: "numeric",
                minute: "2-digit",
              }
            )}
          </span>
        </div>

      </div>

      {/* FOOTER */}

      <div className="
        mt-5
        border-t
        border-zinc-800
        pt-4
        text-sm
        font-medium
        text-zinc-400
        transition
        group-hover:text-white
      ">
        View event →
      </div>

    </Link>
  );
}


// =========================================================
// STATUS
// =========================================================

function StatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span
      className={`
        rounded-full
        px-2.5
        py-1
        text-xs
        font-medium

        ${
          status === "Live"
            ? "bg-green-500/10 text-green-400"
            : status === "Ended"
              ? "bg-zinc-800 text-zinc-500"
              : "bg-blue-500/10 text-blue-400"
        }
      `}
    >
      {status}
    </span>
  );
}


// =========================================================
// EMPTY STATE
// =========================================================

function EmptyEvents({
  orgSlug,
}: {
  orgSlug: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-dashed
        border-zinc-800
        bg-zinc-900/30
        px-6
        py-16
        text-center
      "
    >

      <div className="
        mx-auto
        flex
        h-14
        w-14
        items-center
        justify-center
        rounded-2xl
        bg-zinc-900
        text-2xl
      ">
        +
      </div>

      <h3 className="mt-5 text-lg font-semibold">
        No events yet
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
        Create your first event to start managing registrations,
        volunteers, attendees and more.
      </p>

      <Link
        href={`/dashboard/${orgSlug}/events/new`}
        className="
          mt-6
          inline-flex
          rounded-xl
          bg-white
          px-5
          py-3
          text-sm
          font-semibold
          text-black
          hover:bg-zinc-200
        "
      >
        Create your first event
      </Link>

    </div>
  );
}