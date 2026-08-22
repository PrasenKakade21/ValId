"use client";

import {
  ArrowLeft,
  Building2,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function NewOrganizationPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] =
    useState("");

  const [slugEdited, setSlugEdited] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  // ---------------------------------------------------------
  // SLUG GENERATOR
  // ---------------------------------------------------------

  const generateSlug = (
    value: string
  ) => {
    return value
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9\s-]/g,
        ""
      )
      .replace(
        /\s+/g,
        "-"
      )
      .replace(
        /-+/g,
        "-"
      )
      .replace(
        /^-|-$/g,
        ""
      );
  };


  // ---------------------------------------------------------
  // AUTO GENERATE SLUG
  // ---------------------------------------------------------

  useEffect(() => {
    if (!slugEdited) {
      setSlug(generateSlug(name));
    }
  }, [name, slugEdited]);


  // ---------------------------------------------------------
  // SUBMIT
  // ---------------------------------------------------------

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    const trimmedName =
      name.trim();

    const trimmedSlug =
      slug.trim();

    if (!trimmedName) {
      setError(
        "Organization name is required."
      );
      return;
    }

    if (!trimmedSlug) {
      setError(
        "Organization URL is required."
      );
      return;
    }

    if (trimmedSlug.length < 3) {
      setError(
        "Organization URL must be at least 3 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/orgs",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name:
                trimmedName,

              slug:
                trimmedSlug,

              description:
                description.trim(),
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to create organization"
        );
      }

      // ---------------------------------------------------
      // SUCCESS
      // ---------------------------------------------------

      const organization =
        data.organization;

      router.replace(
        `/dashboard/${organization.slug}`
      );

      router.refresh();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );

    } finally {
      setLoading(false);
    }
  };


  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">

      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-5 py-12">

        <div className="w-full max-w-2xl">


          {/* =================================================
              BACK
          ================================================= */}

          <Link
            href="/dashboard"
            className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-900 dark:hover:text-white"
          >
            <ArrowLeft size={16} />

            Back to dashboard
          </Link>


          {/* =================================================
              CARD
          ================================================= */}

          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="border-b border-zinc-200 px-6 py-7 sm:px-8 dark:border-zinc-800">

              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">

                  <Building2 size={22} />

                </div>


                <div>

                  <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                    Create organization
                  </h1>

                  <p className="mt-1 text-sm text-zinc-500">
                    Set up a workspace for your events,
                    attendees and volunteers.
                  </p>

                </div>

              </div>

            </div>


            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={handleSubmit}
              className="px-6 py-7 sm:px-8"
            >


              {/* =================================================
                  ORGANIZATION NAME
              ================================================= */}

              <div>

                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-zinc-900 dark:text-white"
                >
                  Organization name
                </label>

                <p className="mt-1 text-xs text-zinc-500">
                  The name people will see throughout your dashboard.
                </p>


                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  placeholder="Hacker House"
                  maxLength={80}
                  disabled={loading}
                  autoFocus
                  className="mt-3 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
                />

              </div>


              {/* =================================================
                  SLUG
              ================================================= */}

              <div className="mt-6">

                <label
                  htmlFor="slug"
                  className="block text-sm font-medium text-zinc-900 dark:text-white"
                >
                  Organization URL
                </label>

                <p className="mt-1 text-xs text-zinc-500">
                  This becomes your organization's URL.
                </p>


                <div className="mt-3 flex overflow-hidden rounded-xl border border-zinc-200 bg-white focus-within:border-zinc-400 focus-within:ring-4 focus-within:ring-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:focus-within:border-zinc-500 dark:focus-within:ring-zinc-800">

                  <div className="flex items-center border-r border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
                    ValID.com/
                  </div>

                  <input
                    id="slug"
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlugEdited(
                        true
                      );

                      setSlug(
                        generateSlug(
                          e.target.value
                        )
                      );
                    }}
                    placeholder="hacker-house"
                    maxLength={60}
                    disabled={loading}
                    className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 dark:text-white"
                  />

                </div>


                {slug && (
                  <p className="mt-2 text-xs text-zinc-400">
                    Your organization will use:
                    {" "}
                    <span className="text-zinc-600 dark:text-zinc-300">
                      ValID.com/{slug}
                    </span>
                  </p>
                )}

              </div>


              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <div className="mt-6">

                <div className="flex items-center justify-between">

                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-zinc-900 dark:text-white"
                  >
                    Description
                  </label>

                  <span className="text-[11px] text-zinc-400">
                    Optional
                  </span>

                </div>

                <p className="mt-1 text-xs text-zinc-500">
                  Briefly describe what this organization is for.
                </p>


                <textarea
                  id="description"
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  placeholder="A community for builders, developers and creators..."
                  maxLength={500}
                  rows={4}
                  disabled={loading}
                  className="mt-3 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
                />

                <div className="mt-1 text-right text-[11px] text-zinc-400">
                  {description.length}/500
                </div>

              </div>


              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                  {error}
                </div>
              )}


              {/* =================================================
                  INFO
              ================================================= */}

              <div className="mt-6 flex gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">

                <Sparkles
                  size={17}
                  className="mt-0.5 shrink-0 text-zinc-500"
                />

                <div>

                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    You'll become the owner
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                    You'll automatically become the
                    owner of this organization and can
                    invite other members later.
                  </p>

                </div>

              </div>


              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <Link
                  href="/dashboard"
                  className={`inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 px-5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 ${
                    loading
                      ? "pointer-events-none opacity-50"
                      : ""
                  }`}
                >
                  Cancel
                </Link>


                <button
                  type="submit"
                  disabled={
                    loading ||
                    !name.trim() ||
                    !slug.trim()
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                >

                  {loading ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />

                      Creating...
                    </>
                  ) : (
                    <>
                      <Check size={16} />

                      Create organization
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      </div>

    </main>
  );
}