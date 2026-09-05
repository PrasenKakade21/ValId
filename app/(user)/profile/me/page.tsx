
"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  AtSign,
  Edit3,
  Globe,
  Mail,
  MapPin,
  Phone,
  User,
  Loader2,
  Lock,
} from "lucide-react";

type ProfileStatus =
  | "active"
  | "away"
  | "busy"
  | "offline";

type ProfileData = {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  alternatePhone: string;
  location: string;
  bio: string;
  status: ProfileStatus;
  isPublic: boolean;
  avatarUrl: string | null;
};

const fetcher = async (url: string) => {
  const response = await fetch(url);

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Failed to load profile"
    );
  }

  return data;
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

export default function MyProfilePage() {
  const {
    data: profile,
    error,
    isLoading,
  } = useSWR<ProfileData>(
    "/api/users/profile/me",
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
   * ERROR
   * ============================================================
   */

  if (error) {
    return (
      <div className="mx-auto w-full max-w-5xl pb-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-brightText">
            Profile
          </h1>

          <p className="mt-1 text-sm text-mutedText">
            View and manage your profile.
          </p>
        </div>

        <section className="rounded-xl border border-border bg-card p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <User className="h-5 w-5 text-mutedText" />
          </div>

          <h2 className="mt-4 text-sm font-medium text-brightText">
            Unable to load profile
          </h2>

          <p className="mx-auto mt-1 max-w-sm text-sm text-mutedText">
            {error.message ||
              "Something went wrong while loading your profile."}
          </p>
        </section>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const status = statusConfig[profile.status];

  return (
    <div className="mx-auto w-full max-w-5xl pb-10">
      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-brightText">
            Profile
          </h1>

          <p className="mt-1 text-sm text-mutedText">
            View your personal information and profile.
          </p>
        </div>

        <Link
          href="/profile/me/edit"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium text-brightText transition hover:bg-muted"
        >
          <Edit3 className="h-4 w-4" />
          Edit profile
        </Link>
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

                  <span>
                    {profile.username}
                  </span>
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

                  <span className="text-sm text-mutedText">
                    ·
                  </span>

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
            <h2 className="font-medium text-brightText">
              About
            </h2>

            <p className="mt-1 text-sm text-mutedText">
              How your profile appears to other people.
            </p>
          </div>

          <div className="p-6">
            {profile.bio ? (
              <p className="whitespace-pre-wrap text-sm leading-6 text-brightText">
                {profile.bio}
              </p>
            ) : (
              <p className="text-sm text-mutedText">
                You haven't added a bio yet.
              </p>
            )}
          </div>
        </section>

        {/* ====================================================
            CONTACT INFORMATION
            ==================================================== */}

        <section className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-5">
            <h2 className="font-medium text-brightText">
              Contact information
            </h2>

            <p className="mt-1 text-sm text-mutedText">
              Your personal contact information.
            </p>
          </div>

          <div className="grid gap-0 md:grid-cols-2">
            {/* Email */}

            <div className="flex items-center gap-3 border-b border-border p-6 md:border-r">
              <div className="rounded-lg bg-muted p-2">
                <Mail className="h-4 w-4 text-mutedText" />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-mutedText">
                  Email
                </p>

                <p className="mt-0.5 truncate text-sm text-brightText">
                  {profile.email}
                </p>
              </div>
            </div>

            {/* Phone */}

            <div className="flex items-center gap-3 border-b border-border p-6">
              <div className="rounded-lg bg-muted p-2">
                <Phone className="h-4 w-4 text-mutedText" />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-mutedText">
                  Phone
                </p>

                <p className="mt-0.5 text-sm text-brightText">
                  {profile.phone || "Not provided"}
                </p>
              </div>
            </div>

            {/* Alternate phone */}

            <div className="flex items-center gap-3 border-b border-border p-6 md:border-r">
              <div className="rounded-lg bg-muted p-2">
                <Phone className="h-4 w-4 text-mutedText" />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-mutedText">
                  Alternate phone
                </p>

                <p className="mt-0.5 text-sm text-brightText">
                  {profile.alternatePhone ||
                    "Not provided"}
                </p>
              </div>
            </div>

            {/* Location */}

            <div className="flex items-center gap-3 border-b border-border p-6">
              <div className="rounded-lg bg-muted p-2">
                <MapPin className="h-4 w-4 text-mutedText" />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-mutedText">
                  Location
                </p>

                <p className="mt-0.5 text-sm text-brightText">
                  {profile.location || "Not provided"}
                </p>
              </div>
            </div>

            {/* Username */}

            <div className="flex items-center gap-3 p-6 md:border-r">
              <div className="rounded-lg bg-muted p-2">
                <AtSign className="h-4 w-4 text-mutedText" />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-mutedText">
                  Username
                </p>

                <p className="mt-0.5 text-sm text-brightText">
                  @{profile.username}
                </p>
              </div>
            </div>

            {/* Profile URL */}

            <div className="flex items-center gap-3 p-6">
              <div className="rounded-lg bg-muted p-2">
                <Globe className="h-4 w-4 text-mutedText" />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-mutedText">
                  Public profile
                </p>

                <Link
                  href={`/profile/@${profile.username}`}
                  className="mt-0.5 block truncate text-sm text-accent hover:underline"
                >
                  View public profile
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            PRIVACY
            ==================================================== */}

        <section className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-5">
            <h2 className="font-medium text-brightText">
              Profile visibility
            </h2>

            <p className="mt-1 text-sm text-mutedText">
              Control whether other people can find and
              view your profile.
            </p>
          </div>

          <div className="flex items-center justify-between gap-5 p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-muted p-2">
                {profile.isPublic ? (
                  <Globe className="h-4 w-4 text-mutedText" />
                ) : (
                  <Lock className="h-4 w-4 text-mutedText" />
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-brightText">
                  {profile.isPublic
                    ? "Public profile"
                    : "Private profile"}
                </p>

                <p className="mt-1 text-xs text-mutedText">
                  {profile.isPublic
                    ? "Other users can view your public profile."
                    : "Your profile is hidden from other users."}
                </p>
              </div>
            </div>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                profile.isPublic
                  ? "bg-accent/10 text-accent"
                  : "bg-muted text-mutedText"
              }`}
            >
              {profile.isPublic
                ? "Public"
                : "Private"}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}

