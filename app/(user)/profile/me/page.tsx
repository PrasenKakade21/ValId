"use client";

import React, { useMemo, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  AtSign,
  Globe,
  Bell,
  Circle,
  Save,
} from "lucide-react";

type ProfileStatus = "active" | "away" | "busy" | "offline";

type InvitationPreference = "auto" | "manual" | "decline";

type ProfileData = {
  name: string;
  username: string;
  email: string;
  phone: string;
  alternatePhone: string;
  location: string;
  bio: string;
  status: ProfileStatus;
  isPublic: boolean;
  invitationPreference: InvitationPreference;
};

const initialProfile: ProfileData = {
  name: "Prasen Kakade",
  username: "prasen",
  email: "prasen@example.com",
  phone: "+91 98765 43210",
  alternatePhone: "",
  location: "Mumbai, India",
  bio: "Building products, experimenting with ideas, and working on interesting things.",
  status: "active",
  isPublic: true,
  invitationPreference: "manual",
};

export default function ProfilePage() {
  const [profile, setProfile] =
    useState<ProfileData>(initialProfile);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  /*
   * ============================================================
   * API IMPLEMENTATION REFERENCES
   * ============================================================
   *
   * GET PROFILE
   * GET /api/profile
   *
   * PATCH PROFILE
   * PATCH /api/profile
   *
   * Body:
   * {
   *   name,
   *   username,
   *   phone,
   *   alternatePhone,
   *   location,
   *   bio,
   *   status,
   *   isPublic,
   *   invitationPreference
   * }
   *
   *
   * AVATAR
   * POST   /api/profile/avatar
   * DELETE /api/profile/avatar
   *
   *
   * STATUS
   * PATCH /api/profile/status
   *
   * Body:
   * {
   *   status: "active" | "away" | "busy" | "offline"
   * }
   *
   *
   * PRIVACY
   * PATCH /api/profile/privacy
   *
   * Body:
   * {
   *   isPublic: boolean
   * }
   *
   *
   * INVITATIONS
   * PATCH /api/profile/invitations
   *
   * Body:
   * {
   *   preference: "auto" | "manual" | "decline"
   * }
   *
   *
   * SUPABASE AUTH
   *
   * const supabase = createClient();
   *
   * const {
   *   data: { user },
   * } = await supabase.auth.getUser();
   */

  const initials = useMemo(() => {
    return profile.name
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [profile.name]);

  const updateProfile = <K extends keyof ProfileData>(
    key: K,
    value: ProfileData[K]
  ) => {
    setProfile((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);

    /*
     * TODO:
     *
     * const response = await fetch("/api/profile", {
     *   method: "PATCH",
     *   headers: {
     *     "Content-Type": "application/json",
     *   },
     *   body: JSON.stringify(profile),
     * });
     *
     * if (!response.ok) {
     *   throw new Error("Failed to save profile");
     * }
     *
     * const updatedProfile = await response.json();
     * setProfile(updatedProfile);
     */

    await new Promise((resolve) =>
      setTimeout(resolve, 600)
    );

    setSaving(false);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
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

  const invitationOptions: {
    value: InvitationPreference;
    label: string;
    description: string;
  }[] = [
    {
      value: "auto",
      label: "Auto accept",
      description: "Accept automatically",
    },
    {
      value: "manual",
      label: "Ask me",
      description: "Review each invitation",
    },
    {
      value: "decline",
      label: "Auto decline",
      description: "Decline automatically",
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto pb-8">
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Profile
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Manage your personal information, privacy, and
            availability.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* ====================================================== */}
      {/* PROFILE SUMMARY */}
      {/* ====================================================== */}

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border-b border-zinc-800" />

        <div className="px-6 pb-5">
          <div className="-mt-9 flex items-end gap-4">
            <div className="w-[72px] h-[72px] shrink-0 rounded-2xl bg-zinc-800 border-4 border-zinc-950 flex items-center justify-center">
              <span className="text-lg font-semibold text-zinc-300">
                {initials}
              </span>
            </div>

            <div className="pb-1 min-w-0">
              <h2 className="text-lg font-semibold text-white">
                {profile.name}
              </h2>

              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-zinc-500">
                  @{profile.username}
                </span>

                <span className="text-zinc-700">•</span>

                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <Circle className="w-2 h-2 fill-current" />
                  {statusOptions.find(
                    (status) =>
                      status.value === profile.status
                  )?.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================== */}
      {/* MAIN GRID */}
      {/* ====================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        {/* ================================================== */}
        {/* PERSONAL INFORMATION */}
        {/* ================================================== */}

        <section className="xl:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-950">
          <div className="px-6 py-5 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-white">
              Personal Information
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Your personal details and contact information.
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                  Full Name
                </label>

                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />

                  <input
                    type="text"
                    value={profile.name}
                    onChange={(event) =>
                      updateProfile(
                        "name",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 pl-10 pr-3.5 py-3 text-sm text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/10 transition"
                    placeholder="Your full name"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                  Username
                </label>

                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />

                  <input
                    type="text"
                    value={profile.username}
                    onChange={(event) =>
                      updateProfile(
                        "username",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 pl-10 pr-3.5 py-3 text-sm text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/10 transition"
                    placeholder="username"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />

                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 pl-10 pr-3.5 py-3 text-sm text-zinc-500 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                  Phone Number
                </label>

                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />

                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(event) =>
                      updateProfile(
                        "phone",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 pl-10 pr-3.5 py-3 text-sm text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/10 transition"
                    placeholder="+91 00000 00000"
                  />
                </div>
              </div>

              {/* Alternate Phone */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                  Alternate Phone
                  <span className="ml-1 text-zinc-600">
                    Optional
                  </span>
                </label>

                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />

                  <input
                    type="tel"
                    value={profile.alternatePhone}
                    onChange={(event) =>
                      updateProfile(
                        "alternatePhone",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 pl-10 pr-3.5 py-3 text-sm text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/10 transition"
                    placeholder="+91 00000 00000"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                  Location
                </label>

                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />

                  <input
                    type="text"
                    value={profile.location}
                    onChange={(event) =>
                      updateProfile(
                        "location",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 pl-10 pr-3.5 py-3 text-sm text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/10 transition"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                  Bio
                </label>

                <textarea
                  value={profile.bio}
                  onChange={(event) =>
                    updateProfile(
                      "bio",
                      event.target.value
                    )
                  }
                  rows={3}
                  maxLength={300}
                  className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-3 text-sm text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/10 transition"
                  placeholder="Tell people a little about yourself..."
                />

                <div className="mt-1.5 flex justify-end">
                  <span className="text-[11px] text-zinc-600">
                    {profile.bio.length}/300
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* RIGHT COLUMN */}
        {/* ================================================== */}

        <div className="space-y-6">
          {/* ============================================== */}
          {/* AVAILABILITY */}
          {/* ============================================== */}

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950">
            <div className="px-5 py-4 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-white">
                Availability
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Your current status.
              </p>
            </div>

            <div className="p-4 grid grid-cols-2 gap-2">
              {statusOptions.map((option) => {
                const selected =
                  profile.status === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() =>
                      updateProfile(
                        "status",
                        option.value
                      )
                    }
                    className={`rounded-xl border p-3 text-left transition ${
                      selected
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Circle
                        className={`w-2.5 h-2.5 fill-current ${
                          selected
                            ? "text-emerald-400"
                            : "text-zinc-600"
                        }`}
                      />

                      <span
                        className={`text-xs font-medium ${
                          selected
                            ? "text-emerald-400"
                            : "text-zinc-300"
                        }`}
                      >
                        {option.label}
                      </span>
                    </div>

                    <p className="mt-1.5 text-[10px] text-zinc-600">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ============================================== */}
          {/* PRIVACY */}
          {/* ============================================== */}

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950">
            <div className="px-5 py-4 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-white">
                Privacy
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Control profile visibility.
              </p>
            </div>

            <div className="p-5">
              <button
                onClick={() =>
                  updateProfile(
                    "isPublic",
                    !profile.isPublic
                  )
                }
                className="w-full flex items-center gap-3 text-left"
              >
                <div className="w-9 h-9 shrink-0 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-zinc-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200">
                    Public Profile
                  </p>

                  <p className="mt-0.5 text-[11px] text-zinc-600">
                    Allow other members to view your profile.
                  </p>
                </div>

                <div
                  className={`relative w-10 h-5.5 shrink-0 rounded-full transition ${
                    profile.isPublic
                      ? "bg-emerald-500"
                      : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${
                      profile.isPublic
                        ? "translate-x-5"
                        : "translate-x-0.5"
                    }`}
                  />
                </div>
              </button>
            </div>
          </section>

          {/* ============================================== */}
          {/* INVITATIONS */}
          {/* ============================================== */}

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950">
            <div className="px-5 py-4 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-white">
                Invitations
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                How incoming invitations are handled.
              </p>
            </div>

            <div className="p-4 space-y-2">
              {invitationOptions.map((option) => {
                const selected =
                  profile.invitationPreference ===
                  option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() =>
                      updateProfile(
                        "invitationPreference",
                        option.value
                      )
                    }
                    className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                      selected
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                    }`}
                  >
                    <Bell
                      className={`w-4 h-4 shrink-0 ${
                        selected
                          ? "text-emerald-400"
                          : "text-zinc-600"
                      }`}
                    />

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-medium ${
                          selected
                            ? "text-emerald-400"
                            : "text-zinc-300"
                        }`}
                      >
                        {option.label}
                      </p>

                      <p className="mt-0.5 text-[10px] text-zinc-600">
                        {option.description}
                      </p>
                    </div>

                    <div
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        selected
                          ? "border-emerald-400"
                          : "border-zinc-700"
                      }`}
                    >
                      {selected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* ====================================================== */}
      {/* SAVE STATUS */}
      {/* ====================================================== */}

      {saved && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-emerald-500/20 bg-zinc-950 px-4 py-3 shadow-2xl shadow-black/40">
          <p className="text-xs font-medium text-emerald-400">
            Profile changes saved.
          </p>
        </div>
      )}
    </div>
  );
}