import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    eventId: string;
    attendeeId: string;
  }>;
};

// =========================================================
// PATCH
// /api/events/[eventId]/attendees/[attendeeId]
//
// Update an attendee
// =========================================================

export async function PATCH(
  req: Request,
  { params }: RouteContext
) {
  try {
    const supabase = await createClient();

    const { eventId, attendeeId } = await params;

    if (!eventId || !attendeeId) {
      return NextResponse.json(
        { error: "Event ID and Attendee ID are required" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      checked_in,
      checked_in_at,
      full_name,
      role,
      company,
      email,
      ticket_code,
    } = body;

    // -----------------------------------------------------
    // Build update object
    //
    // Only include fields that were actually provided.
    // -----------------------------------------------------

    const updates: Record<string, unknown> = {};

    if (checked_in !== undefined) {
      updates.checked_in = checked_in;
    }

    if (checked_in_at !== undefined) {
      updates.checked_in_at = checked_in_at;
    }

    if (full_name !== undefined) {
      updates.full_name = full_name;
    }

    if (role !== undefined) {
      updates.role = role;
    }

    if (company !== undefined) {
      updates.company = company;
    }

    if (email !== undefined) {
      updates.email = email;
    }

    if (ticket_code !== undefined) {
      updates.ticket_code = ticket_code;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // -----------------------------------------------------
    // Update only the attendee belonging to this event
    // -----------------------------------------------------

    const { data, error } = await supabase
      .from("attendees")
      .update(updates)
      .eq("id", attendeeId)
      .eq("event_id", eventId)
      .select()
      .single();

    if (error) {
      console.error("PATCH attendee error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      attendee: data,
    });
  } catch (error) {
    console.error("PATCH attendee exception:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


// =========================================================
// DELETE
// /api/events/[eventId]/attendees/[attendeeId]
//
// Delete an attendee
// =========================================================

export async function DELETE(
  req: Request,
  { params }: RouteContext
) {
  try {
    const supabase = await createClient();

    const { eventId, attendeeId } = await params;

    if (!eventId || !attendeeId) {
      return NextResponse.json(
        { error: "Event ID and Attendee ID are required" },
        { status: 400 }
      );
    }

    // -----------------------------------------------------
    // Delete only the attendee belonging to this event
    // -----------------------------------------------------

    const { data, error } = await supabase
      .from("attendees")
      .delete()
      .eq("id", attendeeId)
      .eq("event_id", eventId)
      .select()
      .single();

    if (error) {
      console.error("DELETE attendee error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      attendee: data,
    });
  } catch (error) {
    console.error("DELETE attendee exception:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}