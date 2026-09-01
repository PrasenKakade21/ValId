import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{
    eventId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { eventId } = await params;
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const roleId = searchParams.get("roleId");
    const teamId = searchParams.get("teamId");
    const status = searchParams.get("status");

    const page = Math.max(Number(searchParams.get("page")) || 1, 1);

    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 20, 1),
      100,
    );

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("event_members")
      .select(
        ` id,
          event_id,
          user_id,
          role_id,
          team_id,
          status,
          joined_at,
          role:event_roles (
            id,
            name,
            rank
          ),
          team:teams (
            id,
            name
          )
        `,
        { count: "exact" },
      )
      .eq("event_id", eventId);

    if (roleId) {
      query = query.eq("role_id", roleId);
    }

    if (teamId === "unassigned") {
      query = query.is("team_id", null);
    } else if (teamId) {
      query = query.eq("team_id", teamId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    /*
     * Search by user information should be added here once
     * the user/profile table used by Valid is confirmed.
     */

    const { data, error, count } = await query
      .order("joined_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Failed to fetch event members:", error);

      return NextResponse.json(
        { error: "Failed to fetch members" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      members: data ?? [],
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    });
  } catch (error) {
    console.error("Members GET error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { eventId } = await params;
    const supabase = await createClient();

    const body = await request.json();

    const { userId, roleId, teamId = null, status = "active" } = body;

    if (!userId || !roleId) {
      return NextResponse.json(
        {
          error: "userId and roleId are required",
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("event_members")
      .insert({
        event_id: eventId,
        user_id: userId,
        role_id: roleId,
        team_id: teamId,
        status,
      })
      .select(
        `
          id,
          event_id,
          user_id,
          role_id,
          team_id,
          status,
          joined_at,
          role:event_roles (
            id,
            name,
            rank
          ),
          team:teams (
            id,
            name
          )
        `,
      )
      .single();

    if (error) {
      console.error("Failed to create event member:", error);

      return NextResponse.json(
        { error: "Failed to create member" },
        { status: 500 },
      );
    }

    return NextResponse.json({ member: data }, { status: 201 });
  } catch (error) {
    console.error("Members POST error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
