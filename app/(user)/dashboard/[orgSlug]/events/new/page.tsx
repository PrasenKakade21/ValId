import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    orgSlug: string;
  }>;
};

export default async function NewEventPage({ params }: PageProps) {
  const { orgSlug } = await params;

  const supabase = await createClient();

  // ---------------------------------------------------------
  // AUTH
  // ---------------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ---------------------------------------------------------
  // GET ORGANIZATION
  // ---------------------------------------------------------

  const { data: organization, error } = await supabase
    .from("orgs")
    .select(
      `
      id,
      name,
      slug
    `,
    )
    .eq("slug", orgSlug)
    .single();

  if (error || !organization) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Organization not found</h1>

          <p className="mt-2 text-sm text-zinc-500">
            We couldn't find this organization.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      {/* -------------------------------------------------- */}
      {/* HEADER */}
      {/* -------------------------------------------------- */}

      <div className="mb-8">
        <Link
          href={`/dashboard/${organization.slug}/events`}
          className="text-sm text-zinc-500 transition hover:text-white"
        >
          ← Back to Events
        </Link>

        <h1 className="mt-5 text-3xl font-bold tracking-tight">Create Event</h1>

        <p className="mt-2 text-zinc-500">
          Create a new event for{" "}
          <span className="text-zinc-300">{organization.name}</span>
        </p>
      </div>

      {/* -------------------------------------------------- */}
      {/* FORM */}
      {/* -------------------------------------------------- */}

      <form action={createEvent} className="space-y-8">
        {/* We don't trust the client for the organization.
            The server action will resolve it from the slug. */}

        <input type="hidden" name="orgSlug" value={organization.slug} />

        {/* ------------------------------------------------ */}
        {/* BASIC INFORMATION */}
        {/* ------------------------------------------------ */}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Basic Information</h2>

            <p className="mt-1 text-sm text-zinc-500">
              Give your event a name and description.
            </p>
          </div>

          <div className="space-y-5">
            {/* EVENT NAME */}

            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Event Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Hackathon 2026"
                className="
                  w-full
                  rounded-xl
                  border
                  border-zinc-800
                  bg-zinc-950
                  px-4
                  py-3
                  text-sm
                  text-white
                  outline-none
                  transition
                  placeholder:text-zinc-600
                  focus:border-zinc-600
                "
              />
            </div>

            {/* EVENT SLUG */}

            <div>
              <label htmlFor="slug" className="mb-2 block text-sm font-medium">
                Event Slug
              </label>

              <input
                id="slug"
                name="slug"
                type="text"
                required
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                placeholder="hackathon-2026"
                className="
                  w-full
                  rounded-xl
                  border
                  border-zinc-800
                  bg-zinc-950
                  px-4
                  py-3
                  text-sm
                  text-white
                  outline-none
                  transition
                  placeholder:text-zinc-600
                  focus:border-zinc-600
                "
              />

              <p className="mt-2 text-xs text-zinc-600">
                Your event URL will be:
              </p>

              <p className="mt-1 text-sm text-zinc-400">
                /dashboard/{organization.slug}/
                <span className="text-zinc-200">your-event-slug</span>
              </p>
            </div>

            {/* DESCRIPTION */}

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                rows={5}
                placeholder="Describe your event..."
                className="
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-zinc-800
                  bg-zinc-950
                  px-4
                  py-3
                  text-sm
                  text-white
                  outline-none
                  transition
                  placeholder:text-zinc-600
                  focus:border-zinc-600
                "
              />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ */}
        {/* DATE & LOCATION */}
        {/* ------------------------------------------------ */}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Date & Location</h2>

            <p className="mt-1 text-sm text-zinc-500">
              When and where will your event take place?
            </p>
          </div>

          <div className="space-y-5">
            {/* DATES */}

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="start_date"
                  className="mb-2 block text-sm font-medium"
                >
                  Start Date & Time
                </label>

                <input
                  id="start_date"
                  name="start_date"
                  type="datetime-local"
                  required
                  className="
                    w-full
                    rounded-xl
                    border
                    border-zinc-800
                    bg-zinc-950
                    px-4
                    py-3
                    text-sm
                    text-white
                    outline-none
                    focus:border-zinc-600
                  "
                />
              </div>

              <div>
                <label
                  htmlFor="end_date"
                  className="mb-2 block text-sm font-medium"
                >
                  End Date & Time
                </label>

                <input
                  id="end_date"
                  name="end_date"
                  type="datetime-local"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-zinc-800
                    bg-zinc-950
                    px-4
                    py-3
                    text-sm
                    text-white
                    outline-none
                    focus:border-zinc-600
                  "
                />
              </div>
            </div>

            {/* LOCATION */}

            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-medium"
              >
                Location
              </label>

              <input
                id="location"
                name="location"
                type="text"
                placeholder="Pune, Maharashtra or Online"
                className="
                  w-full
                  rounded-xl
                  border
                  border-zinc-800
                  bg-zinc-950
                  px-4
                  py-3
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-zinc-600
                  focus:border-zinc-600
                "
              />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ */}
        {/* ACTIONS */}
        {/* ------------------------------------------------ */}

        <div className="flex items-center justify-end gap-3">
          <Link
            href={`/dashboard/${organization.slug}/events`}
            className="
              rounded-xl
              border
              border-zinc-800
              px-5
              py-3
              text-sm
              font-medium
              text-zinc-400
              transition
              hover:bg-zinc-900
              hover:text-white
            "
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="
              rounded-xl
              bg-white
              px-6
              py-3
              text-sm
              font-semibold
              text-black
              transition
              hover:bg-zinc-200
            "
          >
            Create Event
          </button>
        </div>
      </form>
    </main>
  );
}

// =========================================================
// SERVER ACTION
// =========================================================

async function createEvent(formData: FormData) {
  "use server";

  const supabase = await createClient();

  // -------------------------------------------------------
  // AUTH
  // -------------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // -------------------------------------------------------
  // FORM DATA
  // -------------------------------------------------------

  const orgSlug = String(formData.get("orgSlug") || "").trim();

  const name = String(formData.get("name") || "").trim();

  const slug = String(formData.get("slug") || "")
    .trim()
    .toLowerCase();

  const description = String(formData.get("description") || "").trim();

  const startDate = String(formData.get("start_date") || "").trim();

  const endDate = String(formData.get("end_date") || "").trim();

  const location = String(formData.get("location") || "").trim();

  // -------------------------------------------------------
  // VALIDATION
  // -------------------------------------------------------

  if (!orgSlug) {
    throw new Error("Organization is required");
  }

  if (!name) {
    throw new Error("Event name is required");
  }

  if (!slug) {
    throw new Error("Event slug is required");
  }

  if (!startDate) {
    throw new Error("Start date is required");
  }

  // -------------------------------------------------------
  // GET ORGANIZATION
  // -------------------------------------------------------

  const { data: organization, error: organizationError } = await supabase
    .from("orgs")
    .select("id, slug")
    .eq("slug", orgSlug)
    .single();

  if (organizationError || !organization) {
    throw new Error("Organization not found");
  }

  // -------------------------------------------------------
  // CREATE EVENT
  // -------------------------------------------------------

  const { data: event, error: eventError } = await supabase
    .from("events")
    .insert({
      org_id: organization.id,
      name,
      slug,
      description: description || null,
      starts_at: startDate,
      ends_at: endDate || null,
      location: location || null    })
    .select("id, slug")
    .single();

  if (eventError) {
    console.error("Create event error:", eventError);

    throw new Error(eventError.message);
  }

  // -------------------------------------------------------
  // REDIRECT
  // -------------------------------------------------------

  redirect(`/dashboard/${organization.slug}/${event.slug}`);
}
