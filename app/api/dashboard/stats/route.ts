import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  
  try {
    const supabase = await createClient();
    // 1. Total guests count
    const { count: totalGuests } = await supabase
      .from("attendees")
      .select("*", { count: "exact", head: true });

    // 2. Guests admitted count (checked_in = true)
    const { count: guestsAdmitted } = await supabase
      .from("attendees")
      .select("*", { count: "exact", head: true })
      .eq("checked_in", true);

    // 3. Volunteers count (role = 'Volunteer' or case insensitive match)
    const { count: volunteersCount } = await supabase
      .from("attendees")
      .select("*", { count: "exact", head: true })
      .ilike("role", "volunteer");

    // 4. Issues raised count (if you have a boolean column or issues table)
    const { count: issuesRaised } = await supabase
      .from("attendees")
      .select("*", { count: "exact", head: true })
      .eq("has_issue", true);

    return NextResponse.json({
      success: true,
      stats: {
        totalGuests: totalGuests || 0,
        guestsAdmitted: guestsAdmitted || 0,
        volunteersCount: volunteersCount || 0,
        issuesRaised: issuesRaised || 0,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch overview stats" },
      { status: 500 }
    );
  }
}