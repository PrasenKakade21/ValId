import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ACTIONS = [
  "check_in",
  "check_out",
  "make_admin",
  "remove_admin",
  "delete",
];

export async function PATCH(req: NextRequest) {
  
  try {
    const supabase = await createClient();
    const body = await req.json();

    const {
      ids,
      action,
    } = body;

    // Validate IDs
    if (
      !Array.isArray(ids) ||
      ids.length === 0
    ) {
      return NextResponse.json(
        { error: "No volunteers selected" },
        { status: 400 }
      );
    }

    // Validate action
    if (!ACTIONS.includes(action)) {
      return NextResponse.json(
        { error: "Invalid bulk action" },
        { status: 400 }
      );
    }

    // -------------------------------
    // CHECK IN
    // -------------------------------

    if (action === "check_in") {
      const { error } = await supabase
        .from("volunteers")
        .update({
          checked_in: true,
          checked_in_at:
            new Date().toISOString(),
        })
        .in("id", ids);

      if (error) {
        throw error;
      }
    }

    // -------------------------------
    // CHECK OUT
    // -------------------------------

    if (action === "check_out") {
      const { error } = await supabase
        .from("volunteers")
        .update({
          checked_in: false,
          checked_in_at: null,
        })
        .in("id", ids);

      if (error) {
        throw error;
      }
    }

    // -------------------------------
    // MAKE ADMIN
    // -------------------------------

    if (action === "make_admin") {
      const { error } = await supabase
        .from("volunteers")
        .update({
          role: "admin",
        })
        .in("id", ids);

      if (error) {
        throw error;
      }
    }

    // -------------------------------
    // REMOVE ADMIN
    // -------------------------------

    if (action === "remove_admin") {
      const { error } = await supabase
        .from("volunteers")
        .update({
          role: "volunteer",
        })
        .in("id", ids);

      if (error) {
        throw error;
      }
    }

    // -------------------------------
    // DELETE
    // -------------------------------

    if (action === "delete") {
      const { error } = await supabase
        .from("volunteers")
        .delete()
        .in("id", ids);

      if (error) {
        throw error;
      }
    }

    return NextResponse.json({
      success: true,
      affected: ids.length,
      action,
    });
  } catch (error) {
    console.error(
      "Bulk volunteer action failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Bulk action failed",
      },
      { status: 500 }
    );
  }
}