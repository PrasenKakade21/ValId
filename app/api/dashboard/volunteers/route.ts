import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("volunteers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch volunteers:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      volunteers: data || [],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch volunteers" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  
  try {
    const supabase = await createClient();
    const body = await req.json();

    const {
      full_name,
      email,
      phone,
      team,
      role = "volunteer",
    } = body;

    // Basic validation
    if (!full_name?.trim()) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    if (!["volunteer", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Generate next volunteer code
    const { data: existing, error: codeError } =
      await supabase
        .from("volunteers")
        .select("volunteer_code");

    if (codeError) {
      console.error(codeError);

      return NextResponse.json(
        { error: codeError.message },
        { status: 500 }
      );
    }

    let highestNumber = 0;

    for (const volunteer of existing || []) {
      const match =
        volunteer.volunteer_code?.match(
          /^VOL-(\d+)$/
        );

      if (match) {
        highestNumber = Math.max(
          highestNumber,
          Number(match[1])
        );
      }
    }

    const volunteer_code = `VOL-${String(
      highestNumber + 1
    ).padStart(3, "0")}`;

    // Insert
    const { data, error } = await supabase
      .from("volunteers")
      .insert({
        volunteer_code,
        full_name: full_name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        team: team || null,
        role,
        checked_in: false,
        checked_in_at: null,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create volunteer:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { volunteer: data },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create volunteer" },
      { status: 500 }
    );
  }
}