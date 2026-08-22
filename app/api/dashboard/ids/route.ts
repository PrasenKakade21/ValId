import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET Endpoint: Fetch attendees with pagination (20 per page)
export async function GET(req: Request) {
  try {
      const supabase = await createClient();

    const { searchParams } = new URL(req.url);

    // Extract pagination parameters with safe defaults
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20", 10));

    // Calculate zero-based offsets for Supabase range
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Optional status/role filter from query string
    const status = searchParams.get("status");
    const role = searchParams.get("role");

    let query = supabase
      .from("attendees")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (status === "checked_in") {
      query = query.eq("checked_in", true);
    } else if (status === "pending") {
      query = query.eq("checked_in", false);
    }

    if (role && role !== "all") {
      query = query.ilike("role", role);
    }

    const { data, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      success: true,
      attendees: data || [],
      pagination: {
        page,
        limit,
        totalRecords: count || 0,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST Endpoint: Upsert single or bulk attendees
export async function POST(req: Request) {
  try {
      const supabase = await createClient();

    const { attendees } = await req.json();

    if (!attendees || !Array.isArray(attendees)) {
      return NextResponse.json({ error: "Invalid attendees payload" }, { status: 400 });
    }

    // Map UI camelCase keys to Supabase snake_case columns
    const payload = attendees.map((a) => ({
      ticket_code: a.ticketCode,
      full_name: a.fullName,
      role: a.role || "Attendee",
      company: a.company || "",
      email: a.email || "",
    }));

    // Upsert to prevent duplicate ticket_code crashes
    const { data, error } = await supabase
      .from("attendees")
      .upsert(payload, { onConflict: "ticket_code" })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: data.length });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}