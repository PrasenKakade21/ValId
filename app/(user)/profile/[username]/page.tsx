"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { User, MapPin, AtSign, Circle, Loader2, Globe } from "lucide-react";

type ProfileStatus = "active" | "away" | "busy" | "offline";

type PublicProfile = {
  id: string;
  name: string;
  username: string;
  bio: string;
  location: string;
  status: ProfileStatus;
  avatarUrl: string | null;
};

const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(data?.message || "Failed to load profile");
  }

  return response.json();
};

const statusConfig: Record<
  ProfileStatus,
  {
    label: string;
    description: string;
  }
> = {
  active: {
    label: "Active",
    description: "Available",
  },
  away: {
    label: "Away",
    description: "Currently away",
  },
  busy: {
    label: "Busy",
    description: "Do not disturb",
  },
  offline: {
    label: "Offline",
    description: "Appear offline",
  },
};

export default function PublicProfilePage() {
const params = useParams();

const rawUsername = Array.isArray(params.username)
  ? params.username[0]
  : params.username;

const username = rawUsername
  ? decodeURIComponent(rawUsername).replace(/^@/, "")
  : null;

console.log(rawUsername, username);

const {
  data: profile,
  error,
  isLoading,
} = useSWR<PublicProfile>(
  username
    ? `/api/users/profile/${encodeURIComponent(username)}`
    : null,
  fetcher
);
  const initials = useMemo(() => {
    if (!profile?.name) {
      return "?";
    }

    return profile.name
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [profile?.name]);

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[400px] w-full max-w-5xl items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-mutedText" />
      </div>
    );
  }

  /*
   * ============================================================
   * NOT FOUND / ERROR
   * ============================================================
   */

  if (error || !profile) {
    return (
      <div className="mx-auto w-full max-w-5xl pb-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-brightText">
            Profile
          </h1>

          <p className="mt-1 text-sm text-mutedText">
            The profile you're looking for could not be found.
          </p>
        </div>

        <section className="rounded-xl border border-border bg-card p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <User className="h-5 w-5 text-mutedText" />
          </div>

          <h2 className="mt-4 text-sm font-medium text-brightText">
            Profile not found
          </h2>

          <p className="mx-auto mt-1 max-w-sm text-sm text-mutedText">
            This profile may not exist or may not be publicly available.
          </p>
        </section>
      </div>
    );
  }

  const status = statusConfig[profile.status];

  return (
    <div className="mx-auto w-full max-w-5xl pb-10">
      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-brightText">
          Profile
        </h1>

        <p className="mt-1 text-sm text-mutedText">
          View {profile.name}'s public profile.
        </p>
      </div>

      <div className="space-y-6">
        {/* ====================================================
            PROFILE HEADER
            ==================================================== */}

        <section className="rounded-xl border border-border bg-card">
          <div className="p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {/* Avatar */}

              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="h-24 w-24 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-accent/10 text-2xl font-medium text-accent">
                  {initials}
                </div>
              )}

              {/* Identity */}

              <div className="min-w-0">
                <h2 className="text-xl font-semibold tracking-tight text-brightText">
                  {profile.name}
                </h2>

                <div className="mt-1 flex items-center gap-1.5 text-sm text-mutedText">
                  <AtSign className="h-3.5 w-3.5" />

                  <span>{profile.username}</span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      profile.status === "active"
                        ? "bg-green-500"
                        : profile.status === "away"
                          ? "bg-yellow-500"
                          : profile.status === "busy"
                            ? "bg-red-500"
                            : "bg-mutedText"
                    }`}
                  />

                  <span className="text-sm text-brightText">
                    {status.label}
                  </span>

                  <span className="text-sm text-mutedText">·</span>

                  <span className="text-sm text-mutedText">
                    {status.description}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            ABOUT
            ==================================================== */}

        <section className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-5">
            <h2 className="font-medium text-brightText">About</h2>

            <p className="mt-1 text-sm text-mutedText">
              A little about {profile.name}.
            </p>
          </div>

          <div className="p-6">
            {profile.bio ? (
              <p className="whitespace-pre-wrap text-sm leading-6 text-brightText">
                {profile.bio}
              </p>
            ) : (
              <p className="text-sm text-mutedText">
                No bio has been added yet.
              </p>
            )}
          </div>
        </section>

        {/* ====================================================
            DETAILS
            ==================================================== */}

        <section className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-5">
            <h2 className="font-medium text-brightText">Details</h2>

            <p className="mt-1 text-sm text-mutedText">
              Public information about this user.
            </p>
          </div>

          <div className="divide-y divide-border">
            {/* Location */}

            {profile.location && (
              <div className="flex items-center gap-3 px-6 py-4">
                <div className="rounded-lg bg-muted p-2">
                  <MapPin className="h-4 w-4 text-mutedText" />
                </div>

                <div>
                  <p className="text-xs text-mutedText">Location</p>

                  <p className="mt-0.5 text-sm text-brightText">
                    {profile.location}
                  </p>
                </div>
              </div>
            )}

            {/* Username */}

            <div className="flex items-center gap-3 px-6 py-4">
              <div className="rounded-lg bg-muted p-2">
                <AtSign className="h-4 w-4 text-mutedText" />
              </div>

              <div>
                <p className="text-xs text-mutedText">Username</p>

                <p className="mt-0.5 text-sm text-brightText">
                  @{profile.username}
                </p>
              </div>
            </div>

            {/* Profile visibility */}

            <div className="flex items-center gap-3 px-6 py-4">
              <div className="rounded-lg bg-muted p-2">
                <Globe className="h-4 w-4 text-mutedText" />
              </div>

              <div>
                <p className="text-xs text-mutedText">Profile</p>

                <p className="mt-0.5 text-sm text-brightText">Public</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
