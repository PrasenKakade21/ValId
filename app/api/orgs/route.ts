import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: Request) {
  const supabase = await createClient();

  // ---------------------------------------------------------
  // AUTH
  // ---------------------------------------------------------

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
console.log("AUTH USER:", {
  id: user?.id,
  email: user?.email,
});
  if (authError || !user) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  // ---------------------------------------------------------
  // BODY
  // ---------------------------------------------------------

  let body: {
    name?: string;
    slug?: string;
    description?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        error: "Invalid request body",
      },
      {
        status: 400,
      }
    );
  }

  const name = body.name?.trim();
  const description =
    body.description?.trim() || null;

  if (!name) {
    return NextResponse.json(
      {
        error: "Organization name is required",
      },
      {
        status: 400,
      }
    );
  }

  if (name.length > 80) {
    return NextResponse.json(
      {
        error:
          "Organization name must be 80 characters or less",
      },
      {
        status: 400,
      }
    );
  }

  // ---------------------------------------------------------
  // SLUG
  // ---------------------------------------------------------

  const slug = slugify(
    body.slug?.trim() || name
  );

  if (!slug) {
    return NextResponse.json(
      {
        error: "Please provide a valid organization name",
      },
      {
        status: 400,
      }
    );
  }

  if (slug.length > 60) {
    return NextResponse.json(
      {
        error:
          "Organization URL must be 60 characters or less",
      },
      {
        status: 400,
      }
    );
  }

  // ---------------------------------------------------------
  // CHECK SLUG
  // ---------------------------------------------------------

  const {
    data: existingOrg,
    error: existingOrgError,
  } = await supabase
    .from("orgs")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existingOrgError) {
    console.error(existingOrgError);

    return NextResponse.json(
      {
        error:
          "Failed to check organization URL",
      },
      {
        status: 500,
      }
    );
  }

  if (existingOrg) {
    return NextResponse.json(
      {
        error:
          "That organization URL is already taken",
      },
      {
        status: 409,
      }
    );
  }

  // ---------------------------------------------------------
  // CREATE ORGANIZATION
  // ---------------------------------------------------------

const {
  data: organization,
  error: organizationError,
} = await supabase
  .from("orgs")
  .insert({
    name,
    slug,
    description,
    created_by: user.id,
  })
  .select(`
    id,
    name,
    slug,
    description,
    created_at
  `)
  .single();

  if (organizationError) {
    console.error(organizationError);

    // Handle race condition on unique slug
    if (
      organizationError.code === "23505"
    ) {
      return NextResponse.json(
        {
          error:
            "That organization URL is already taken",
        },
        {
          status: 409,
        }
      );
    }
    return NextResponse.json(
      {
        error:
          "Failed to create organization",
      },
      {
        status: 500,
      }
    );
  }

  // ---------------------------------------------------------
  // ADD CREATOR AS OWNER
  // ---------------------------------------------------------

  const {
    error: membershipError,
  } = await supabase
    .from("organization_members")
    .insert({
      org_id: organization.id,
      user_id: user.id,
      role: "owner",
    });

  if (membershipError) {
    console.error(membershipError);

    // Cleanup organization if membership creation failed
    await supabase
      .from("orgs")
      .delete()
      .eq("id", organization.id);

    return NextResponse.json(
      {
        error:
          "Failed to create organization membership",
      },
      {
        status: 500,
      }
    );
  }

  // ---------------------------------------------------------
  // SUCCESS
  // ---------------------------------------------------------

  return NextResponse.json(
    {
      organization,
    },
    {
      status: 201,
    }
  );
}