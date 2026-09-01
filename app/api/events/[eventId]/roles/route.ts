import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { EventRole, EventRoles } from "@/types/event"; // Adjust import path as needed

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      eventId: string;
    }>;
  }
) {
  try {
    const supabase = await createClient();

    // 1. Verify User Authentication
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

    // 2. Await route parameters (Next.js 15+)
    const { eventId } = await params;

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // 3. Fetch all event roles ordered by rank
    const { data: rolesData, error: rolesError } = await supabase
      .from("event_roles")
      .select("id, eventId:event_id, name, rank")
      .eq("event_id", eventId)
      .order("rank", { ascending: true });

    if (rolesError) {
      console.error("Error fetching event roles:", rolesError);
      return NextResponse.json(
        { error: "Failed to fetch event roles" },
        { status: 500 }
      );
    }

    // 4. Construct payload matching EventRoles interface
    const responsePayload: EventRoles = {
      eventRoles: (rolesData as EventRole[]) ?? [],
    };

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    console.error("Unexpected server error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}