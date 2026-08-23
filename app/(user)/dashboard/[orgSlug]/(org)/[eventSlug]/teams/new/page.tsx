"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { Users, ArrowLeft, Loader2, Plus } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { useEvent, useOrg } from "@/components/EventProvider";

type DashboardData = {
  organizations: { id: string; slug: string }[];
  events: { id: string; org_id: string; slug: string }[];
};

export default function NewTeamPage() {
  const router = useRouter();
  const params = useParams();
  const event = useEvent();
  const org = useOrg();
  const orgSlug = params.orgSlug as string;
  const eventSlug = params.eventSlug as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current dashboard context to get target IDs
//   const { data } = useSWR<DashboardData>(`/api/events/${event.id}/teams`, fetcher);

  const selectedOrg = org;
  const selectedEvent = event

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (!selectedOrg?.id || !selectedEvent?.id) {
      setError("Organization or Event context missing.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/events/${event.id}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          eventId: selectedEvent.id,
          orgId: selectedOrg.id,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to create team");
      }

      // Redirect to the newly created team view
      router.push(`/dashboard/${orgSlug}/${eventSlug}/teams/${result.team.slug}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      {/* Back Link */}
      <Link
        href={`/dashboard/${orgSlug}/${eventSlug}/teams`}
        className="inline-flex items-center space-x-2 text-xs text-zinc-400 hover:text-white transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Teams</span>
      </Link>

      {/* Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-zinc-800">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Create New Team</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Add a team to assign attendees, leads, or management structures.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-5">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-300">
            Team Name <span className="text-emerald-400">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Design & Media Team"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-300">
            Description <span className="text-zinc-500">(Optional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Briefly describe this team's responsibilities..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition resize-none"
          />
        </div>

        <div className="pt-2 flex items-center justify-end space-x-3">
          <Link
            href={`/dashboard/${orgSlug}/${eventSlug}/teams`}
            className="px-4 py-2.5 rounded-xl border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Create Team</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}