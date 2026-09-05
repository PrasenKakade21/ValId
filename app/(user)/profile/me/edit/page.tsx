"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  AtSign,
  Globe,
  Save,
  Camera,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";

type ProfileStatus = "active" | "away" | "busy" | "offline";

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

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Failed to load profile");
  }

  return data;
};

const statusOptions: {
  value: ProfileStatus;
  label: string;
  description: string;
}[] = [
  {
    value: "active",
    label: "Active",
    description: "Available",
  },
  {
    value: "away",
    label: "Away",
    description: "Currently away",
  },
  {
    value: "busy",
    label: "Busy",
    description: "Do not disturb",
  },
  {
    value: "offline",
    label: "Offline",
    description: "Appear offline",
  },
];

export default function EditProfilePage() {
  /*
   * ============================================================
   * SWR
   * ============================================================
   */

  const {
    data: serverProfile,
    error,
    isLoading,
    mutate,
  } = useSWR<ProfileData>("/api/users/profile/me", fetcher);

  /*
   * ============================================================
   * LOCAL FORM STATE
   * ============================================================
   */

  const [profile, setProfile] = useState<ProfileData | null>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  /*
   * ============================================================
   * SYNC SERVER DATA → FORM
   * ============================================================
   */

  useEffect(() => {
    if (serverProfile) {
      setProfile(serverProfile);
    }
  }, [serverProfile]);

  /*
   * ============================================================
   * INITIALS
   * ============================================================
   */

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
   * UPDATE LOCAL STATE
   * ============================================================
   */

  const updateProfile = <K extends keyof ProfileData>(
    key: K,
    value: ProfileData[K],
  ) => {
    setProfile((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        [key]: value,
      };
    });

    setSaved(false);
  };

  /*
   * ============================================================
   * SAVE
   *
   * PATCH /api/users/profile/me
   * ============================================================
   */

  const handleSave = async () => {
    if (!profile || saving) {
      return;
    }

    setSaving(true);
    setSaved(false);

    try {
      const response = await fetch("/api/users/profile/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profile.name,
          username: profile.username,
          phone: profile.phone,
          alternatePhone: profile.alternatePhone,
          location: profile.location,
          bio: profile.bio,
          status: profile.status,
          isPublic: profile.isPublic,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to save profile");
      }

      /*
       * Update the local form with the server response.
       */
      setProfile(data);

      /*
       * Update the SWR cache.
       */
      await mutate(data, false);

      setSaved(true);

      window.setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setSaving(false);
    }
  };

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
        <div className="mb-6">
          <Link
            href="/profile/me"
            className="mb-4 inline-flex items-center gap-2 text-sm text-mutedText transition hover:text-brightText"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to profile
          </Link>

          <h1 className="text-2xl font-semibold tracking-tight text-brightText">
            Edit profile
          </h1>
        </div>

        <section className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-mutedText">
            {error.message || "Unable to load your profile."}
          </p>
        </section>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-5xl pb-10">
      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="mb-8">
        <Link
          href="/profile/me"
          className="mb-4 inline-flex items-center gap-2 text-sm text-mutedText transition hover:text-brightText"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Link>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-brightText">
            Edit profile
          </h1>

          <p className="mt-1 text-sm text-mutedText">
            Update your personal information and profile settings.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* ====================================================
            PERSONAL INFORMATION
            ==================================================== */}

        <section className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-5">
            <h2 className="font-medium text-brightText">
              Personal information
            </h2>

            <p className="mt-1 text-sm text-mutedText">
              This information is used across Valid Event Management.
            </p>
          </div>

          <div className="p-6">
            {/* Avatar */}

            <div className="mb-8 flex items-center gap-5">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 text-xl font-medium text-accent">
                  {initials}
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-brightText">
                  Profile photo
                </p>

                <p className="mt-1 text-xs text-mutedText">
                  JPG, PNG or WEBP. Maximum 5 MB.
                </p>

                <div className="mt-3 flex gap-2">
                  {/*
                   * Avatar functionality will be connected
                   * to /api/users/profile/me/avatar.
                   */}

                  <button
                    type="button"
                    disabled
                    className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-mutedText opacity-60"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    Change photo
                  </button>

                  {profile.avatarUrl && (
                    <button
                      type="button"
                      disabled
                      className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-mutedText opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Name */}

              <div>
                <label className="mb-2 block text-sm font-medium text-brightText">
                  Full name
                </label>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mutedText" />

                  <input
                    value={profile.name}
                    onChange={(e) => updateProfile("name", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-brightText outline-none transition focus:border-accent"
                  />
                </div>
              </div>

              {/* Username */}

              <div>
                <label className="mb-2 block text-sm font-medium text-brightText">
                  Username
                </label>

                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mutedText" />

                  <input
                    value={profile.username}
                    onChange={(e) => updateProfile("username", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-brightText outline-none transition focus:border-accent"
                  />
                </div>

                <p className="mt-1.5 text-xs text-mutedText">
                  Your public profile will be available at /profile/@
                  {profile.username || "username"}
                </p>
              </div>

              {/* Email */}

              <div>
                <label className="mb-2 block text-sm font-medium text-brightText">
                  Email
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mutedText" />

                  <input
                    value={profile.email}
                    disabled
                    className="w-full cursor-not-allowed rounded-lg border border-border bg-muted py-2.5 pl-10 pr-3 text-sm text-mutedText outline-none"
                  />
                </div>

                <p className="mt-1.5 text-xs text-mutedText">
                  Email is managed through your account.
                </p>
              </div>

              {/* Phone */}

              <div>
                <label className="mb-2 block text-sm font-medium text-brightText">
                  Phone
                </label>

                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mutedText" />

                  <input
                    value={profile.phone}
                    onChange={(e) => updateProfile("phone", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-brightText outline-none transition focus:border-accent"
                  />
                </div>
              </div>

              {/* Alternate Phone */}

              <div>
                <label className="mb-2 block text-sm font-medium text-brightText">
                  Alternate phone
                </label>

                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mutedText" />

                  <input
                    value={profile.alternatePhone}
                    onChange={(e) =>
                      updateProfile("alternatePhone", e.target.value)
                    }
                    placeholder="Optional"
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-brightText outline-none transition focus:border-accent"
                  />
                </div>
              </div>

              {/* Location */}

              <div>
                <label className="mb-2 block text-sm font-medium text-brightText">
                  Location
                </label>

                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mutedText" />

                  <input
                    value={profile.location}
                    onChange={(e) => updateProfile("location", e.target.value)}
                    placeholder="Mumbai, India"
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-brightText outline-none transition focus:border-accent"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-brightText">
                Bio
              </label>

              <textarea
                value={profile.bio}
                onChange={(e) => updateProfile("bio", e.target.value)}
                rows={4}
                maxLength={300}
                placeholder="Tell people a little about yourself..."
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-brightText outline-none transition focus:border-accent"
              />

              <p className="mt-1.5 text-right text-xs text-mutedText">
                {profile.bio.length}/300
              </p>
            </div>
          </div>
        </section>

        {/* ====================================================
            AVAILABILITY
            ==================================================== */}

        <section className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-5">
            <h2 className="font-medium text-brightText">Availability</h2>

            <p className="mt-1 text-sm text-mutedText">
              Let other event members know your current availability.
            </p>
          </div>

          <div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-4">
            {statusOptions.map((option) => {
              const selected = profile.status === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateProfile("status", option.value)}
                  className={`rounded-lg border p-4 text-left transition ${
                    selected
                      ? "border-accent bg-accent/5"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        option.value === "active"
                          ? "bg-green-500"
                          : option.value === "away"
                            ? "bg-yellow-500"
                            : option.value === "busy"
                              ? "bg-red-500"
                              : "bg-mutedText"
                      }`}
                    />

                    <span className="text-sm font-medium text-brightText">
                      {option.label}
                    </span>

                    {selected && (
                      <Check className="ml-auto h-4 w-4 text-accent" />
                    )}
                  </div>

                  <p className="mt-2 text-xs text-mutedText">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* ====================================================
            PRIVACY
            ==================================================== */}

        <section className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-5">
            <h2 className="font-medium text-brightText">Privacy</h2>

            <p className="mt-1 text-sm text-mutedText">
              Control how your profile appears to other people.
            </p>
          </div>

          <div className="p-6">
            <button
              type="button"
              onClick={() => updateProfile("isPublic", !profile.isPublic)}
              className="flex w-full items-center justify-between gap-5 text-left"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-muted p-2">
                  {profile.isPublic ? (
                    <Globe className="h-4 w-4 text-mutedText" />
                  ) : (
                    <User className="h-4 w-4 text-mutedText" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-brightText">
                    Public profile
                  </p>

                  <p className="mt-1 text-xs text-mutedText">
                    Allow other members to view your public profile.
                  </p>
                </div>
              </div>

              <div
                className={`relative h-6 w-11 rounded-full transition ${
                  profile.isPublic ? "bg-accent" : "bg-muted"
                }`}
              >
                <div
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                    profile.isPublic ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </div>
            </button>
          </div>
        </section>

        {/* ====================================================
            SAVE
            ==================================================== */}

        <div className="flex items-center justify-end gap-3">
          {saved && (
            <div className="flex items-center gap-1.5 text-sm text-green-500">
              <Check className="h-4 w-4" />
              Changes saved
            </div>
          )}

          <Link
            href="/profile/me"
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-brightText transition hover:bg-muted"
          >
            Cancel
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}

            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
