import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AttendeeRecord } from "@/types/attendee";
type RouteContext = {
  params: Promise<{
    eventId: string;
  }>;
};

// =========================================================
// GET
// /api/events/[eventId]/attendees
//
// Fetch attendees belonging to this event
// =========================================================

export async function GET(
  req: Request,
  { params }: RouteContext
) {
  try {
    const supabase = await createClient();

    const { eventId } = await params;

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);

    const page = Math.max(
      1,
      parseInt(searchParams.get("page") || "1", 10)
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        parseInt(searchParams.get("limit") || "20", 10)
      )
    );

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const status = searchParams.get("status");
    const role = searchParams.get("role");

    let query = supabase
      .from("attendees")
      .select("*", { count: "exact" })
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })
      .range(from, to);

    // -----------------------------------------------------
    // Status filter
    // -----------------------------------------------------

    if (status === "checked_in") {
      query = query.eq("checked_in", true);
    }

    if (status === "pending") {
      query = query.eq("checked_in", false);
    }

    // -----------------------------------------------------
    // Role filter
    // -----------------------------------------------------

    if (role && role !== "all") {
      query = query.eq("role", role);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error("GET attendees error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const totalRecords = count ?? 0;
    const totalPages = Math.ceil(totalRecords / limit);

    return NextResponse.json({
      success: true,
      attendees: data ?? [],
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("GET attendees exception:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


// =========================================================
// POST
// /api/events/[eventId]/attendees
//
// Create one or multiple attendees for this event
// =========================================================

export async function POST(
  req: Request,
  { params }: RouteContext
) {
  try {
    const supabase = await createClient();

    const { eventId } = await params;

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const { attendees } = body;

    if (!Array.isArray(attendees) || attendees.length === 0) {
      return NextResponse.json(
        { error: "Attendees must be a non-empty array" },
        { status: 400 }
      );
    }

    // -----------------------------------------------------
    // Validate attendees
    // -----------------------------------------------------

    for (const attendee of attendees) {
      if (!attendee.ticketCode) {
        return NextResponse.json(
          {
            error:
              "Every attendee must have a ticketCode",
          },
          { status: 400 }
        );
      }

      if (!attendee.fullName) {
        return NextResponse.json(
          {
            error:
              "Every attendee must have a fullName",
          },
          { status: 400 }
        );
      }
    }

    // -----------------------------------------------------
    // Convert camelCase → snake_case
    // event_id ALWAYS comes from URL
    // -----------------------------------------------------

    const payload = attendees.map((attendee) => ({
      event_id: eventId,

      ticket_code: attendee.ticketCode,
      full_name: attendee.fullName,

      role: attendee.role || "Attendee",
      company: attendee.company || null,
      email: attendee.email || null,

      checked_in: false,
      checked_in_at: null,
    }));

    // -----------------------------------------------------
    // Insert
    //
    // UNIQUE(event_id, ticket_code) prevents duplicates
    // -----------------------------------------------------

    const { data, error } = await supabase
      .from("attendees")
      .insert(payload)
      .select();

    // -----------------------------------------------------
    // Handle database errors
    // -----------------------------------------------------

    if (error) {
      console.error("POST attendees error:", error);

      if (error.code === "23505") {
        return NextResponse.json(
          {
            error:
              "One or more ticket IDs already exist for this event.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // -----------------------------------------------------
    // Success
    // -----------------------------------------------------

    console.log("Inserted attendees:", data);

    return NextResponse.json(
      {
        success: true,
        count: data?.length ?? 0,
        attendees: data ?? [],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST attendees exception:",
      error
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}