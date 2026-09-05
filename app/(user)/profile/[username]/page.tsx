import {
  MapPin,
  Mail,
  Phone,
  Globe,
  CalendarDays,
  Circle,
  User,
} from "lucide-react";

type PublicProfile = {
  name: string;
  username: string;
  email: string;
  phone: string | null;
  location: string | null;
  bio: string | null;
  status: "active" | "away" | "busy" | "offline";
  avatarUrl: string | null;
  joinedAt: string;
};

type PageProps = {
  params: Promise<{
    username: string;
  }>;
};

/*
 * ============================================================
 * DUMMY PUBLIC PROFILE
 * ============================================================
 *
 * Replace this with the API request below.
 */
const dummyProfile: PublicProfile = {
  name: "Prasen Kakade",
  username: "prasen",
  email: "prasen@example.com",
  phone: "+91 98765 43210",
  location: "Mumbai, India",
  bio: "Building products, experimenting with ideas, and working on interesting things.",
  status: "active",
  avatarUrl: null,
  joinedAt: "January 2026",
};

export default async function PublicProfilePage({
  params,
}: PageProps) {
  const { username: rawUsername } = await params;

  /*
   * The URL will contain:
   *
   * /profile/@prasen
   *
   * So remove the @ before using the username.
   */
  const username = rawUsername.startsWith("@")
    ? rawUsername.slice(1)
    : rawUsername;

  /*
   * ============================================================
   * FETCH PUBLIC PROFILE
   * ============================================================
   *
   * TODO: Replace dummyProfile with your API request.
   *
   * Recommended endpoint:
   *
   * GET /api/profile/public/:username
   *
   * Example:
   *
   * const response = await fetch(
   *   `${process.env.NEXT_PUBLIC_APP_URL}/api/profile/public/${username}`,
   *   {
   *     next: {
   *       revalidate: 60,
   *     },
   *   }
   * );
   *
   * if (!response.ok) {
   *   if (response.status === 404) {
   *     notFound();
   *   }
   *
   *   throw new Error("Failed to load profile");
   * }
   *
   * const profile: PublicProfile = await response.json();
   */

  const profile = dummyProfile;

  /*
   * ============================================================
   * PROFILE PRIVACY
   * ============================================================
   *
   * The API should return 404 / 403 when:
   *
   * - User doesn't exist
   * - Username doesn't exist
   * - Profile is private
   *
   * Do NOT return private profile data to this page.
   *
   * Example:
   *
   * if (!profile) {
   *   notFound();
   * }
   */

  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const statusConfig = {
    active: {
      label: "Active",
      color: "text-emerald-400",
      dot: "text-emerald-400",
    },
    away: {
      label: "Away",
      color: "text-yellow-400",
      dot: "text-yellow-400",
    },
    busy: {
      label: "Busy",
      color: "text-red-400",
      dot: "text-red-400",
    },
    offline: {
      label: "Offline",
      color: "text-zinc-500",
      dot: "text-zinc-500",
    },
  };

  const status = statusConfig[profile.status];

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="w-full max-w-5xl mx-auto px-6 py-12 lg:px-8">
        {/* ================================================== */}
        {/* PROFILE HEADER */}
        {/* ================================================== */}

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          {/* Cover */}
          <div className="h-40 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border-b border-zinc-800" />

          <div className="px-6 sm:px-8 pb-8">
            <div className="-mt-14 flex flex-col sm:flex-row sm:items-end gap-5">
              {/* Avatar */}
              <div className="w-28 h-28 shrink-0 rounded-3xl bg-zinc-800 border-4 border-zinc-950 flex items-center justify-center overflow-hidden">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-semibold text-zinc-300">
                    {initials}
                  </span>
                )}
              </div>

              {/* Name */}
              <div className="pb-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {profile.name}
                  </h1>

                  <span
                    className={`inline-flex items-center gap-1.5 text-xs ${status.color}`}
                  >
                    <Circle
                      className={`w-2.5 h-2.5 fill-current ${status.dot}`}
                    />

                    {status.label}
                  </span>
                </div>

                <p className="mt-1 text-sm text-zinc-500">
                  @{profile.username}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* CONTENT */}
        {/* ================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* ================================================= */}
          {/* ABOUT */}
          {/* ================================================= */}

          <section className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-950">
            <div className="px-6 py-5 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-white">
                About
              </h2>
            </div>

            <div className="p-6">
              {profile.bio ? (
                <p className="text-sm leading-6 text-zinc-400">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-sm text-zinc-600">
                  This user hasn't added a bio yet.
                </p>
              )}
            </div>
          </section>

          {/* ================================================= */}
          {/* CONTACT */}
          {/* ================================================= */}

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950">
            <div className="px-6 py-5 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-white">
                Contact
              </h2>
            </div>

            <div className="p-5 space-y-1">
              {/* Email */}
              <div className="flex items-center gap-3 px-2 py-3">
                <Mail className="w-4 h-4 text-zinc-600 shrink-0" />

                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-zinc-600">
                    Email
                  </p>

                  <p className="mt-0.5 text-sm text-zinc-300 truncate">
                    {profile.email}
                  </p>
                </div>
              </div>

              {/* Phone */}
              {profile.phone && (
                <div className="flex items-center gap-3 px-2 py-3">
                  <Phone className="w-4 h-4 text-zinc-600 shrink-0" />

                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-zinc-600">
                      Phone
                    </p>

                    <p className="mt-0.5 text-sm text-zinc-300">
                      {profile.phone}
                    </p>
                  </div>
                </div>
              )}

              {/* Location */}
              {profile.location && (
                <div className="flex items-center gap-3 px-2 py-3">
                  <MapPin className="w-4 h-4 text-zinc-600 shrink-0" />

                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-zinc-600">
                      Location
                    </p>

                    <p className="mt-0.5 text-sm text-zinc-300">
                      {profile.location}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ================================================= */}
          {/* PROFILE DETAILS */}
          {/* ================================================= */}

          <section className="lg:col-span-3 rounded-2xl border border-zinc-800 bg-zinc-950">
            <div className="px-6 py-5 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-white">
                Profile Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800">
              {/* Username */}
              <div className="flex items-center gap-3 px-6 py-5">
                <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <User className="w-4 h-4 text-zinc-500" />
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wide text-zinc-600">
                    Username
                  </p>

                  <p className="mt-0.5 text-sm text-zinc-300">
                    @{profile.username}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3 px-6 py-5">
                <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-zinc-500" />
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wide text-zinc-600">
                    Location
                  </p>

                  <p className="mt-0.5 text-sm text-zinc-300">
                    {profile.location ?? "Not specified"}
                  </p>
                </div>
              </div>

              {/* Joined */}
              <div className="flex items-center gap-3 px-6 py-5">
                <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4 text-zinc-500" />
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wide text-zinc-600">
                    Member Since
                  </p>

                  <p className="mt-0.5 text-sm text-zinc-300">
                    {profile.joinedAt}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ================================================== */}
        {/* FOOTER */}
        {/* ================================================== */}

        <div className="mt-8 text-center">
          <p className="text-[11px] text-zinc-700">
            Public profile
          </p>
        </div>
      </div>
    </main>
  );
}