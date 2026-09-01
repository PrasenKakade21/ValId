import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
const { searchParams } = new URL(request.url);
const teamSlug = searchParams.get("teamSlug");
    // 1. Verify authentication
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

    // 2. Get route parameters
    const { eventId } = await params;

    if (!eventId || !teamSlug) {
      return NextResponse.json(
        { error: "Event ID and team slug are required" },
        { status: 400 }
      );
    }

    // 3. Get all teams for this event
const { data: team, error: teamError } = await supabase
  .from("teams")
  .select("*")
  .eq("event_id", eventId)
  .eq("slug", teamSlug)
  .single();
  
    if (teamError) {
      console.error("Error fetching teams:", teamError);

      return NextResponse.json(
        { error: "Failed to fetch teams" },
        { status: 500 }
      );
    }


    // 5. Get member UUIDs from the team
    const memberIds: string[] = team.memberIds ?? [];

    if (memberIds.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // 6. Fetch members using their UUIDs
    const { data: members, error: membersError } = await supabase
      .from("event_members")
      .select("*")
      .in("id", memberIds);

    if (membersError) {
      console.error("Error fetching team members:", membersError);

      return NextResponse.json(
        { error: "Failed to fetch team members" },
        { status: 500 }
      );
    }

    return NextResponse.json(members ?? [], { status: 200 });
  } catch (error) {
    console.error("Unexpected server error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}