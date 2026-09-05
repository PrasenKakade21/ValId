
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    username: string;
  }>;
};

/**
 * GET /api/profile/[username]
 *
 * Returns the public profile for a user.
 *
 * Example:
 * GET /api/profile/prasen
 *
 * Only publicly visible profile information is returned.
 */
export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const supabase = await createClient();

    const { username: rawUsername } = await params;

    /*
     * The username normally comes from:
     *
     * /profile/@prasen
     *
     * But depending on how the URL was generated,
     * Next.js may provide:
     *
     * @prasen
     * %40prasen
     *
     * Decode it before querying the database.
     */
    let username: string;

    try {
      username = decodeURIComponent(
        rawUsername
      ).replace(/^@/, "");
    } catch {
      return NextResponse.json(
        {
          message: "Invalid username",
        },
        {
          status: 400,
        }
      );
    }

    username = username.trim().toLowerCase();

    /*
     * Basic validation.
     */
    if (
      !username ||
      username.length < 3 ||
      username.length > 30
    ) {
      return NextResponse.json(
        {
          message: "Profile not found",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Match the same username rules used when
     * creating/updating a profile.
     */
    if (!/^[a-z0-9_]+$/.test(username)) {
      return NextResponse.json(
        {
          message: "Profile not found",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Only select fields that are safe to expose publicly.
     *
     * Do NOT select:
     * - email
     * - phone
     * - alternate_phone
     * - is_public
     *
     * is_public is used for filtering but is not returned.
     */
    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        name,
        username,
        bio,
        location,
        status,
        avatar_url
      `
      )
      .eq("username", username)
      .eq("is_public", true)
      .maybeSingle();

    /*
     * Treat both "not found" and "private profile"
     * as the same response.
     *
     * This prevents the endpoint from revealing whether
     * a private profile exists.
     */
    if (!profile) {
      return NextResponse.json(
        {
          message: "Profile not found",
        },
        {
          status: 404,
        }
      );
    }

    if (error) {
      console.error(
        "GET /api/profile/[username]:",
        error
      );

      return NextResponse.json(
        {
          message: "Failed to fetch profile",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * Return the API response using the same camelCase
     * structure used by the frontend.
     */
    return NextResponse.json({
      id: profile.id,
      name: profile.name ?? "",
      username: profile.username ?? "",
      bio: profile.bio ?? "",
      location: profile.location ?? "",
      status: profile.status ?? "offline",
      avatarUrl: profile.avatar_url ?? null,
    });
  } catch (error) {
    console.error(
      "GET /api/profile/[username]:",
      error
    );

    return NextResponse.json(
      {
        message: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}

