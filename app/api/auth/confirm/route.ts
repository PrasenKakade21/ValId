
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  // Validate required parameters
  if (!tokenHash || type !== "signup") {
    return NextResponse.redirect(
      `${origin}/login?error=invalid_confirmation`
    );
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  // Verify the email confirmation token
  const { error } = await supabase.auth.verifyOtp({
    type: "signup",
    token_hash: tokenHash,
  });

  if (error) {
    console.error("Email confirmation error:", error);

    return NextResponse.redirect(
      `${origin}/login?error=confirmation_failed`
    );
  }

  /*
   * At this point the email is verified and
   * Supabase should have established the session.
   */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      `${origin}/login?error=session_not_created`
    );
  }

  /*
   * Check whether the user has completed
   * their profile onboarding.
   */
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("profile_completed")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Profile lookup error:", profileError);

    return NextResponse.redirect(
      `${origin}/onboarding/profile?error=profile_lookup_failed`
    );
  }

  if (!profile?.profile_completed) {
    return NextResponse.redirect(`${origin}/onboarding/profile`);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}