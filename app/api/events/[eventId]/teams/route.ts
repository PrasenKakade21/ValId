import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Helper to convert string to URL-safe slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
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

    // 2. Await params before destructuring (Next.js 15 requirement)
    const { eventId } = await params;

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // 3. Fetch Teams for the specified Event
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select(`
        id,
        event_id,
        name,
        slug,
        created_at
      `)
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    if (teamsError) {
      console.error("Error fetching teams:", teamsError);
      return NextResponse.json(
        { error: "Failed to fetch teams" },
        { status: 500 }
      );
    }

    return NextResponse.json(teams ?? [], { status: 200 });
  } catch (error) {
    console.error("Unexpected server error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, eventId, orgId } = body;

    if (!name || !eventId || !orgId) {
      return NextResponse.json(
        { error: "Missing required fields: name, eventId, or orgId" },
        { status: 400 }
      );
    }

    // 2. Check user's role in the organization
    const { data: member, error: memberError } = await supabase
      .from("organization_members")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", user.id)
      .single();

    if (memberError || !member || !["owner", "admin"].includes(member.role)) {
      return NextResponse.json(
        { error: "Forbidden: You must be an owner or admin to create teams" },
        { status: 403 }
      );
    }

    // 3. Generate unique slug per event
    let slug = slugify(name);
    if (!slug) slug = `team-${Date.now()}`;

    // 4. Insert Team into Supabase
    const { data: team, error: insertError } = await supabase
      .from("teams")
      .insert({
        name,
        slug,
        description: description || null,
        event_id: eventId,
        org_id: orgId,
      })
      .select("*")
      .single();

    if (insertError) {
      // Handle slug collision
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "A team with a similar name already exists for this event." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ team }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}