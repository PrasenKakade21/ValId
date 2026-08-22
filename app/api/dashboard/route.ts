import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // ---------------------------------------------
  // USER
  // ---------------------------------------------

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // ---------------------------------------------
  // ORGANIZATIONS
  // ---------------------------------------------

  const { data: memberships, error } =
    await supabase
      .from("organization_members")
      .select(`
        org_id,
        role,
        orgs (
          id,
          name,
          slug,
          description,
          created_at
        )
      `)
      .eq("user_id", user.id);

  if (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to fetch organizations",
      },
      { status: 500 }
    );
  }

  const organizations =
    memberships
      ?.map((membership: any) => {
        if (!membership.orgs) {
          return null;
        }

        return {
          id: membership.orgs.id,
          name: membership.orgs.name,
          slug: membership.orgs.slug,
          description:
            membership.orgs.description,

          role: membership.role,
        };
      })
      .filter(Boolean) ?? [];

  const orgIds =
    organizations.map(
      (org: any) => org.id
    );

  // ---------------------------------------------
  // EVENTS
  // ---------------------------------------------

  let events: any[] = [];

  if (orgIds.length > 0) {
    const { data, error } =
      await supabase
        .from("events")
        .select(`
          id,
          org_id,
          name,
          slug,
          description,
          location,
          starts_at,
          ends_at,
          created_at
        `)
        .in("org_id", orgIds)
        .order("starts_at", {
          ascending: true,
        });

    if (error) {
      console.error(error);

      return NextResponse.json(
        {
          error:
            "Failed to fetch events",
        },
        { status: 500 }
      );
    }

    events = data ?? [];
  }

  // ---------------------------------------------
  // ORGANIZATION COUNTS
  // ---------------------------------------------

  const organizationsWithStats =
    await Promise.all(
      organizations.map(
        async (org: any) => {

          const [
            membersResult,
            eventsResult,
          ] = await Promise.all([

            supabase
              .from(
                "organization_members"
              )
              .select("id", {
                count: "exact",
                head: true,
              })
              .eq(
                "org_id",
                org.id
              ),

            supabase
              .from("events")
              .select("id", {
                count: "exact",
                head: true,
              })
              .eq(
                "org_id",
                org.id
              ),

          ]);

          return {
            ...org,

            members:
              membersResult.count ?? 0,

            events:
              eventsResult.count ?? 0,
          };
        }
      )
    );

  // ---------------------------------------------
  // UPCOMING EVENTS
  // ---------------------------------------------

  const now =
    new Date().toISOString();

  const upcomingEvents =
    events
      .filter(
        (event) =>
          event.starts_at &&
          event.starts_at >= now
      )
      .slice(0, 10)
      .map((event) => {

        const organization =
          organizations.find(
            (org: any) =>
              org.id === event.org_id
          );

        const membership =
          memberships?.find(
            (membership: any) =>
              membership.org_id ===
              event.org_id
          );

        return {
          id: event.id,

          name: event.name,

          slug: event.slug,

          organization:
            organization?.name ??
            "Unknown",

          organizationSlug:
            organization?.slug ??
            "",

          date:
            formatEventDate(
              event.starts_at,
              event.ends_at
            ),

          location:
            event.location ??
            "Location not specified",

          status:
            getEventStatus(event),

          role:
            membership?.role ??
            "volunteer",
        };
      });

  // ---------------------------------------------
  // STATS
  // ---------------------------------------------

  const stats = {
    organizations:
      organizations.length,

    upcomingEvents:
      upcomingEvents.length,

    members:
      organizationsWithStats.reduce(
        (
          total: number,
          org: any
        ) =>
          total + org.members,
        0
      ),

    roles:
      new Set(
        organizations.map(
          (org: any) => org.role
        )
      ).size,
  };

  // ---------------------------------------------
  // RESPONSE
  // ---------------------------------------------
console.log("all events:" , events)
  return NextResponse.json({
    user: {
      id: user.id,

      email:
        user.email ?? null,

      name:
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        null,
    },

    organizations:
      organizationsWithStats,

    events,

    upcomingEvents,

    stats,
  });
}


// ========================================================
// HELPERS
// ========================================================

function formatEventDate(
  startsAt: string,
  endsAt: string | null
) {
  const start =
    new Date(startsAt);

  const startText =
    start.toLocaleDateString(
      "en-IN",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );

  if (!endsAt) {
    return startText;
  }

  const end =
    new Date(endsAt);

  const endText =
    end.toLocaleDateString(
      "en-IN",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );

  return `${startText} – ${endText}`;
}


function getEventStatus(
  event: any
) {
  const now = Date.now();

  const start =
    event.starts_at
      ? new Date(
          event.starts_at
        ).getTime()
      : null;

  const end =
    event.ends_at
      ? new Date(
          event.ends_at
        ).getTime()
      : null;

  if (
    start &&
    now < start
  ) {
    return "Upcoming";
  }

  if (
    start &&
    end &&
    now >= start &&
    now <= end
  ) {
    return "Ongoing";
  }

  if (
    end &&
    now > end
  ) {
    return "Ended";
  }

  return "Upcoming";
}