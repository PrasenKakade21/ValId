import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const STATUS_VALUES = [
  "active",
  "away",
  "busy",
  "offline",
] as const;

type ProfileStatus = (typeof STATUS_VALUES)[number];

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select(`
        id,
        name,
        username,
        email,
        phone,
        alternate_phone,
        location,
        bio,
        status,
        is_public,
        avatar_url
      `)
      .eq("id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { message: "Profile not found" },
          { status: 404 }
        );
      }

      console.error("GET /api/users/profile:", error);

      return NextResponse.json(
        { message: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: profile.id,
      name: profile.name ?? "",
      username: profile.username ?? "",
      email: user.email ?? profile.email ?? "",
      phone: profile.phone ?? "",
      alternatePhone: profile.alternate_phone ?? "",
      location: profile.location ?? "",
      bio: profile.bio ?? "",
      status: profile.status ?? "active",
      isPublic: profile.is_public ?? true,
      avatarUrl: profile.avatar_url ?? null,
    });
  } catch (error) {
    console.error("GET /api/users/profile:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};

    /*
     * Only accept fields that belong to the profile.
     *
     * Email is deliberately excluded because it is managed
     * by Supabase Auth.
     */
    if ("name" in body) {
      if (
        body.name !== null &&
        typeof body.name !== "string"
      ) {
        return NextResponse.json(
          { message: "Name must be a string" },
          { status: 400 }
        );
      }

      const name = body.name as string | null;

      if (name && name.length > 100) {
        return NextResponse.json(
          { message: "Name cannot exceed 100 characters" },
          { status: 400 }
        );
      }

      updates.name = name?.trim() ?? null;
    }

    if ("username" in body) {
      if (typeof body.username !== "string") {
        return NextResponse.json(
          { message: "Username must be a string" },
          { status: 400 }
        );
      }

      const username = body.username
        .trim()
        .toLowerCase();

      if (
        username.length < 3 ||
        username.length > 30
      ) {
        return NextResponse.json(
          {
            message:
              "Username must be between 3 and 30 characters",
          },
          { status: 400 }
        );
      }

      if (!/^[a-z0-9_]+$/.test(username)) {
        return NextResponse.json(
          {
            message:
              "Username can only contain letters, numbers, and underscores",
          },
          { status: 400 }
        );
      }

      updates.username = username;
    }

    if ("phone" in body) {
      if (
        body.phone !== null &&
        typeof body.phone !== "string"
      ) {
        return NextResponse.json(
          { message: "Phone must be a string" },
          { status: 400 }
        );
      }

      updates.phone =
        typeof body.phone === "string"
          ? body.phone.trim()
          : null;
    }

    if ("alternatePhone" in body) {
      if (
        body.alternatePhone !== null &&
        typeof body.alternatePhone !== "string"
      ) {
        return NextResponse.json(
          { message: "Alternate phone must be a string" },
          { status: 400 }
        );
      }

      updates.alternate_phone =
        typeof body.alternatePhone === "string"
          ? body.alternatePhone.trim()
          : null;
    }

    if ("location" in body) {
      if (
        body.location !== null &&
        typeof body.location !== "string"
      ) {
        return NextResponse.json(
          { message: "Location must be a string" },
          { status: 400 }
        );
      }

      updates.location =
        typeof body.location === "string"
          ? body.location.trim()
          : null;
    }

    if ("bio" in body) {
      if (
        body.bio !== null &&
        typeof body.bio !== "string"
      ) {
        return NextResponse.json(
          { message: "Bio must be a string" },
          { status: 400 }
        );
      }

      if (
        typeof body.bio === "string" &&
        body.bio.length > 300
      ) {
        return NextResponse.json(
          { message: "Bio cannot exceed 300 characters" },
          { status: 400 }
        );
      }

      updates.bio =
        typeof body.bio === "string"
          ? body.bio.trim()
          : null;
    }

    if ("status" in body) {
      if (
        typeof body.status !== "string" ||
        !STATUS_VALUES.includes(
          body.status as ProfileStatus
        )
      ) {
        return NextResponse.json(
          {
            message:
              "Status must be active, away, busy, or offline",
          },
          { status: 400 }
        );
      }

      updates.status = body.status;
    }

    if ("isPublic" in body) {
      if (typeof body.isPublic !== "boolean") {
        return NextResponse.json(
          { message: "isPublic must be a boolean" },
          { status: 400 }
        );
      }

      updates.is_public = body.isPublic;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { message: "No valid fields provided" },
        { status: 400 }
      );
    }

    /*
     * The authenticated user's ID is always used.
     *
     * Never accept a user ID from the request body.
     */
    const { data: updatedProfile, error } =
      await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select(`
          id,
          name,
          username,
          email,
          phone,
          alternate_phone,
          location,
          bio,
          status,
          is_public,
          avatar_url
        `)
        .single();

    if (error) {
      /*
       * PostgreSQL unique violation.
       * Useful if username has a UNIQUE constraint.
       */
      if (error.code === "23505") {
        return NextResponse.json(
          { message: "Username is already taken" },
          { status: 409 }
        );
      }

      console.error(
        "PATCH /api/users/profile:",
        error
      );

      return NextResponse.json(
        { message: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: updatedProfile.id,
      name: updatedProfile.name ?? "",
      username: updatedProfile.username ?? "",
      email:
        user.email ??
        updatedProfile.email ??
        "",
      phone: updatedProfile.phone ?? "",
      alternatePhone:
        updatedProfile.alternate_phone ?? "",
      location: updatedProfile.location ?? "",
      bio: updatedProfile.bio ?? "",
      status:
        updatedProfile.status ?? "active",
      isPublic:
        updatedProfile.is_public ?? true,
      avatarUrl:
        updatedProfile.avatar_url ?? null,
    });
  } catch (error) {
    console.error(
      "PATCH /api/users/profile:",
      error
    );

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

