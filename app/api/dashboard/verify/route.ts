import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  
  try {
    const supabase = await createClient();
    const { ticketCode } = await req.json();

    if (!ticketCode) {
      return NextResponse.json({ message: "Missing ticket code" }, { status: 400 });
    }

    // 1. Find attendee in Supabase
    const { data: attendee, error } = await supabase
      .from("attendees")
      .select("*")
      .eq("ticket_code", ticketCode)
      .single();

    if (error || !attendee) {
      return NextResponse.json(
        { status: "INVALID", message: "Ticket code not found in database" },
        { status: 404 }
      );
    }

    // 2. Check if already scanned
    if (attendee.checked_in) {
      const scanTime = new Date(attendee.checked_in_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      return NextResponse.json({
        status: "ALREADY_CHECKED_IN",
        message: `Already scanned at ${scanTime}`,
        attendee: {
          fullName: attendee.full_name,
          role: attendee.role,
          company: attendee.company,
          ticketCode: attendee.ticket_code,
          checkedInAt: scanTime,
        },
      });
    }

    // 3. Perform Check-In (Update state in Supabase)
    const checkInTimestamp = new Date().toISOString();
    const { data: updated, error: updateError } = await supabase
      .from("attendees")
      .update({
        checked_in: true,
        checked_in_at: checkInTimestamp,
      })
      .eq("ticket_code", ticketCode)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ message: "Failed to perform check-in" }, { status: 500 });
    }

    return NextResponse.json({
      status: "SUCCESS",
      message: "Access Granted",
      attendee: {
        fullName: updated.full_name,
        role: updated.role,
        company: updated.company,
        ticketCode: updated.ticket_code,
        checkedInAt: new Date(checkInTimestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    });
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}