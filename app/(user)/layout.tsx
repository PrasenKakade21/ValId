import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/redirect?message=${encodeURIComponent(
        "Please log in first to access this page."
      )}&next=${encodeURIComponent("/login")}`
    );
  }

  if (!user.email_confirmed_at) {
    redirect(
      `/redirect?message=${encodeURIComponent(
        "Please verify your email address first."
      )}&next=${encodeURIComponent("/onboarding/verify-email")}`
    );
  }

  return <>{children}</>;
}