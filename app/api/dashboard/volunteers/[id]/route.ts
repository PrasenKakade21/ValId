import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _req: NextRequest,
  { params }: Params
) {
  
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from("volunteers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Volunteer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      volunteer: data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch volunteer" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: Params
) {
  
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await req.json();

    const allowedFields = [
      "full_name",
      "email",
      "phone",
      "team",
      "role",
      "checked_in",
      "checked_in_at",
    ];

    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    // Validate role if provided
    if (
      updates.role !== undefined &&
      !["volunteer", "admin"].includes(
        updates.role as string
      )
    ) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Validate name if provided
    if (
      updates.full_name !== undefined &&
      !String(updates.full_name).trim()
    ) {
      return NextResponse.json(
        { error: "Full name cannot be empty" },
        { status: 400 }
      );
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("volunteers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(
        "Failed to update volunteer:",
        error
      );

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      volunteer: data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update volunteer" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: Params
) {
  
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { error } = await supabase
      .from("volunteers")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        "Failed to delete volunteer:",
        error
      );

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to delete volunteer" },
      { status: 500 }
    );
  }
}