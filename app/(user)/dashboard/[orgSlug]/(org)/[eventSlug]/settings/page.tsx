"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  GripVertical,
  MapPin,
  Plus,
  Save,
  Settings,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
export type EventStatus =
  | "draft"
  | "published"
  | "archived";

export type Event = {
  id: string;
  org_id: string;
  organizationSlug: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  starts_at: string;
  status: EventStatus;
};

export interface EventRole {
  id: string;
  eventId: string;
  name: string;
  rank: number;
  permissions: {
    manageEvent: boolean;
    manageTeam: boolean;
    manageMembers: boolean;
    manageRegistrations: boolean;
  };
};
export interface AttendeeRole {
  id: string;
  eventId: string;
  name: string;
  description: string;
  rank: number;
}
/* -------------------------------------------------------------------------- */
/* Dummy Data                                                                 */
/* -------------------------------------------------------------------------- */

const dummyEvent: Event = {
  id: "event_001",
  org_id: "org_001",
  organizationSlug: "valid-events",
  name: "Valid Community Conference 2026",
  slug: "valid-community-conference-2026",
  description:
    "A community-focused event bringing together organizers, volunteers, speakers, and attendees for a day of talks, workshops, and networking.",
  location: "Mumbai, Maharashtra",
  starts_at: "2026-10-18T10:00:00.000Z",
  status: "published",
};

const dummyRoles: EventRole[] = [
  {
    id: "role_001",
    eventId: "event_001",
    name: "Admin",
    rank: 1,
    permissions: {
      manageEvent: true,
      manageTeam: true,
      manageMembers: true,
      manageRegistrations: true,
    },
  },
  {
    id: "role_002",
    eventId: "event_001",
    name: "Team Lead",
    rank: 2,
    permissions: {
      manageEvent: false,
      manageTeam: true,
      manageMembers: true,
      manageRegistrations: true,
    },
  },
  {
    id: "role_003",
    eventId: "event_001",
    name: "Volunteer",
    rank: 3,
    permissions: {
      manageEvent: false,
      manageTeam: false,
      manageMembers: false,
      manageRegistrations: false,
    },
  },
];
const dummyAttendeeRoles: AttendeeRole[] = [
  {
    id: "attendee_role_001",
    eventId: "event_001",
    name: "General Attendee",
    description:
      "Standard attendee with regular event access.",
    rank: 1,
  },
  {
    id: "attendee_role_002",
    eventId: "event_001",
    name: "Speaker",
    description:
      "Speakers and presenters participating in the event.",
    rank: 2,
  },
  {
    id: "attendee_role_003",
    eventId: "event_001",
    name: "VIP",
    description:
      "VIP attendees with special access and privileges.",
    rank: 3,
  },
  {
    id: "attendee_role_004",
    eventId: "event_001",
    name: "Sponsor",
    description:
      "Representatives from event sponsors.",
    rank: 4,
  },
];
/* -------------------------------------------------------------------------- */
/* Permission Labels                                                          */
/* -------------------------------------------------------------------------- */

const permissionLabels = {
  manageEvent: {
    title: "Manage event",
    description:
      "Edit event details, schedule, and settings.",
  },
  manageTeam: {
    title: "Manage team",
    description:
      "Manage event teams and assign team leads.",
  },
  manageMembers: {
    title: "Manage members",
    description:
      "Add, remove, and manage event members.",
  },
  manageRegistrations: {
    title: "Manage registrations",
    description:
      "View and manage attendee registrations.",
  },
};

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function EventSettingsPage() {
 const [activeSection, setActiveSection] =
  useState<
    | "details"
    | "roles"
    | "attendee-roles"
    | "advanced"
  >("details");

  const [eventData, setEventData] =
    useState<Event>(dummyEvent);

  const [roles, setRoles] =
    useState<EventRole[]>(dummyRoles);

  const [saving, setSaving] =
    useState(false);

  function updateEvent(
    field: keyof Event,
    value: string
  ) {
    setEventData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveEvent() {
    setSaving(true);

    await new Promise((resolve) =>
      setTimeout(resolve, 700)
    );

    console.log("Saved event:", eventData);

    setSaving(false);
  }

  function updateRoles(
    updatedRoles: EventRole[]
  ) {
    setRoles(updatedRoles);

    console.log(
      "Updated roles:",
      updatedRoles
    );
  }

  const sections = [
    {
      id: "details" as const,
      label: "Event details",
      description: "Name, description and schedule",
      icon: Settings,
    },
    {
      id: "roles" as const,
      label: "Event roles",
      description: "Roles and permissions",
      icon: Users,
    },
        {
  id: "attendee-roles" as const,
  label: "Attendee roles",
  description: "Manage attendee categories",
  icon: UserRound,
},
    {
      id: "advanced" as const,
      label: "Advanced",
      description: "Destructive event actions",
      icon: AlertTriangle,
    },

  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
  
          <div className="mt-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              Event settings
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage your event details, team roles,
              and advanced settings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[230px_minmax(0,1fr)]">

          {/* Sidebar */}
          <aside>
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                const active =
                  activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() =>
                      setActiveSection(
                        section.id
                      )
                    }
                    className={[
                      "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition",
                      active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4 shrink-0" />

                    <div className="min-w-0">
                      <div className="text-sm font-medium">
                        {section.label}
                      </div>

                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {section.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <main className="min-w-0">

            {/* ---------------------------------------------------------------- */}
            {/* Event Details                                                    */}
            {/* ---------------------------------------------------------------- */}

            {activeSection === "details" && (
              <SettingsCard
                title="Event details"
                description="Update the information attendees see about your event."
              >
                <div className="space-y-6">

                  <Field
                    label="Event name"
                    value={eventData.name}
                    onChange={(value) =>
                      updateEvent(
                        "name",
                        value
                      )
                    }
                  />

           <div>
  <label className="mb-2 block text-sm font-medium">
    Event slug
  </label>

  <p className="mb-3 text-xs text-muted-foreground">
    Choose a unique URL for your event.
  </p>

  <div className="flex min-w-0 items-center rounded-md border bg-background">
    <div className="shrink-0 whitespace-nowrap border-r bg-muted px-3 py-2.5 text-sm text-muted-foreground">
      {eventData.organizationSlug}
      <span className="px-1">/</span>
    </div>

    <input
      value={eventData.slug}
      onChange={(e) =>
        updateEvent(
          "slug",
          e.target.value
        )
      }
      className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
      placeholder="my-event"
    />
  </div>
</div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Description
                    </label>

                    <textarea
                      rows={5}
                      value={
                        eventData.description
                      }
                      onChange={(e) =>
                        updateEvent(
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Describe your event..."
                      className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <Field
                    label="Location"
                    value={
                      eventData.location
                    }
                    onChange={(value) =>
                      updateEvent(
                        "location",
                        value
                      )
                    }
                    icon={MapPin}
                    placeholder="Event location"
                  />

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Start date and time
                    </label>

                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <input
                        type="datetime-local"
                        value={toDateTimeLocal(
                          eventData.starts_at
                        )}
                        onChange={(e) =>
                          updateEvent(
                            "starts_at",
                            new Date(
                              e.target.value
                            ).toISOString()
                          )
                        }
                        className="h-10 w-full rounded-md border bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Status
                    </label>

                    <select
                      value={
                        eventData.status
                      }
                      onChange={(e) =>
                        updateEvent(
                          "status",
                          e.target.value
                        )
                      }
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="draft">
                        Draft
                      </option>

                      <option value="published">
                        Published
                      </option>

                      <option value="archived">
                        Archived
                      </option>
                    </select>
                  </div>

                  <SaveButton
                    saving={saving}
                    onClick={saveEvent}
                  />
                </div>
              </SettingsCard>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* Event Roles                                                      */}
            {/* ---------------------------------------------------------------- */}

            {activeSection === "roles" && (
              <EventRolesSettings
                roles={roles}
                eventId={eventData.id}
                onChange={updateRoles}
              />
            )}
     {/* ---------------------------------------------------------------- */}
            {/* Attendee Roles                                                      */}
            {/* ---------------------------------------------------------------- */}
{activeSection === "attendee-roles" && (
  <AttendeeRolesSettings
    eventId={eventData.id}
  />
)}

            {/* ---------------------------------------------------------------- */}
            {/* Advanced                                                          */}
            {/* ---------------------------------------------------------------- */}

            {activeSection === "advanced" && (
              <AdvancedSettings
                event={eventData}
              />
            )}

          </main>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Event Roles                                                                */
/* -------------------------------------------------------------------------- */

function EventRolesSettings({
  roles,
  eventId,
  onChange,
}: {
  roles: EventRole[];
  eventId: string;
  onChange: (roles: EventRole[]) => void;
}) {
  // Draft state. Nothing is applied to the parent
  // until "Save changes" is pressed.
  const [draftRoles, setDraftRoles] =
    useState<EventRole[]>(roles);

  const [newRole, setNewRole] =
    useState("");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [saving, setSaving] =
    useState(false);

  const sortedRoles = [...draftRoles].sort(
    (a, b) => a.rank - b.rank
  );

  function updateRoleName(
    id: string,
    name: string
  ) {
    setDraftRoles((current) =>
      current.map((role) =>
        role.id === id
          ? {
              ...role,
              name,
            }
          : role
      )
    );
  }

  function updatePermission(
    roleId: string,
    permission: keyof EventRole["permissions"],
    value: boolean
  ) {
    setDraftRoles((current) =>
      current.map((role) =>
        role.id === roleId
          ? {
              ...role,
              permissions: {
                ...role.permissions,
                [permission]: value,
              },
            }
          : role
      )
    );
  }

  function addRole() {
    const name = newRole.trim();

    if (!name) return;

    const highestRank =
      draftRoles.length > 0
        ? Math.max(
            ...draftRoles.map(
              (role) => role.rank
            )
          )
        : 0;

    const role: EventRole = {
      id: crypto.randomUUID(),
      eventId,
      name,
      rank: highestRank + 1,
      permissions: {
        manageEvent: false,
        manageTeam: false,
        manageMembers: false,
        manageRegistrations: false,
      },
    };

    setDraftRoles((current) => [
      ...current,
      role,
    ]);

    setNewRole("");
  }

  function deleteRole(id: string) {
    setDraftRoles((current) =>
      current
        .filter(
          (role) => role.id !== id
        )
        .sort(
          (a, b) => a.rank - b.rank
        )
        .map((role, index) => ({
          ...role,
          rank: index + 1,
        }))
    );
  }

  function moveRole(
    id: string,
    direction: "up" | "down"
  ) {
    const sorted = [...draftRoles].sort(
      (a, b) => a.rank - b.rank
    );

    const index = sorted.findIndex(
      (role) => role.id === id
    );

    if (index === -1) return;

    const targetIndex =
      direction === "up"
        ? index - 1
        : index + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= sorted.length
    ) {
      return;
    }

    [
      sorted[index],
      sorted[targetIndex],
    ] = [
      sorted[targetIndex],
      sorted[index],
    ];

    setDraftRoles(
      sorted.map((role, index) => ({
        ...role,
        rank: index + 1,
      }))
    );
  }

  async function saveChanges() {
    setSaving(true);

    try {
      // Simulate API request
      await new Promise((resolve) =>
        setTimeout(resolve, 700)
      );

      // This is the important part:
      // Only now do the changes get applied
      // to the parent/saved state.
      onChange(draftRoles);

      console.log(
        "Saved event roles:",
        draftRoles
      );
    } finally {
      setSaving(false);
    }
  }

  function resetChanges() {
    setDraftRoles(roles);
    setEditingId(null);
    setNewRole("");
  }

  const hasChanges =
    JSON.stringify(draftRoles) !==
    JSON.stringify(roles);

  return (
    <SettingsCard
      title="Event roles"
      description="Define roles and control what each role can do within this event."
    >
      <div className="space-y-6">

        {/* Explanation */}
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm font-medium">
            Roles & permissions
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Define the roles people can have within
            this event and choose what each role can
            manage.
          </p>
        </div>

        {/* Permission Matrix */}
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="w-[240px] px-4 py-3 text-left font-medium">
                  Role
                </th>

                <th className="px-4 py-3 text-center font-medium">
                  Manage Event
                </th>

                <th className="px-4 py-3 text-center font-medium">
                  Manage Team
                </th>

                <th className="px-4 py-3 text-center font-medium">
                  Manage Members
                </th>

                <th className="px-4 py-3 text-center font-medium">
                  Registrations
                </th>

                <th className="w-[120px] px-3 py-3" />
              </tr>
            </thead>

            <tbody>
              {sortedRoles.map(
                (role, index) => (
                  <tr
                    key={role.id}
                    className="border-b last:border-b-0 hover:bg-muted/20"
                  >
                    {/* Role */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">

                        {/* Reorder */}
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            disabled={
                              index === 0
                            }
                            onClick={() =>
                              moveRole(
                                role.id,
                                "up"
                              )
                            }
                            className="rounded p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-20"
                            aria-label="Move role up"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            disabled={
                              index ===
                              sortedRoles.length -
                                1
                            }
                            onClick={() =>
                              moveRole(
                                role.id,
                                "down"
                              )
                            }
                            className="rounded p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-20"
                            aria-label="Move role down"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Rank */}
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium">
                          {role.rank}
                        </div>

                        {/* Name */}
                        {editingId ===
                        role.id ? (
                          <input
                            autoFocus
                            value={
                              role.name
                            }
                            onChange={(e) =>
                              updateRoleName(
                                role.id,
                                e.target
                                  .value
                              )
                            }
                            onKeyDown={(
                              e
                            ) => {
                              if (
                                e.key ===
                                "Enter"
                              ) {
                                setEditingId(
                                  null
                                );
                              }

                              if (
                                e.key ===
                                "Escape"
                              ) {
                                setEditingId(
                                  null
                                );
                              }
                            }}
                            className="h-8 min-w-0 flex-1 rounded-md border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                          />
                        ) : (
                          <span className="font-medium">
                            {role.name}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Manage Event */}
                    <PermissionCell
                      checked={
                        role.permissions
                          .manageEvent
                      }
                      onChange={(checked) =>
                        updatePermission(
                          role.id,
                          "manageEvent",
                          checked
                        )
                      }
                    />

                    {/* Manage Team */}
                    <PermissionCell
                      checked={
                        role.permissions
                          .manageTeam
                      }
                      onChange={(checked) =>
                        updatePermission(
                          role.id,
                          "manageTeam",
                          checked
                        )
                      }
                    />

                    {/* Manage Members */}
                    <PermissionCell
                      checked={
                        role.permissions
                          .manageMembers
                      }
                      onChange={(checked) =>
                        updatePermission(
                          role.id,
                          "manageMembers",
                          checked
                        )
                      }
                    />

                    {/* Registrations */}
                    <PermissionCell
                      checked={
                        role.permissions
                          .manageRegistrations
                      }
                      onChange={(checked) =>
                        updatePermission(
                          role.id,
                          "manageRegistrations",
                          checked
                        )
                      }
                    />

                    {/* Actions */}
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1">

                        <button
                          type="button"
                          onClick={() =>
                            setEditingId(
                              editingId ===
                                role.id
                                ? null
                                : role.id
                            )
                          }
                          className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        >
                          {editingId ===
                          role.id
                            ? "Done"
                            : "Rename"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteRole(
                              role.id
                            )
                          }
                          className="rounded-md p-1.5 text-muted-foreground transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                          aria-label={`Delete ${role.name} role`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                      </div>
                    </td>
                  </tr>
                )
              )}

              {sortedRoles.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center"
                  >
                    <Users className="mx-auto h-8 w-8 text-muted-foreground" />

                    <p className="mt-3 text-sm font-medium">
                      No event roles
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Add a role below to start
                      managing event permissions.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Permission descriptions */}
        <div className="grid gap-3 sm:grid-cols-2">
          <PermissionDescription
            title="Manage Event"
            description="Edit event details, schedule, and settings."
          />

          <PermissionDescription
            title="Manage Team"
            description="Manage event teams and assign team leads."
          />

          <PermissionDescription
            title="Manage Members"
            description="Add, remove, and manage event members."
          />

          <PermissionDescription
            title="Registrations"
            description="View and manage attendee registrations."
          />
        </div>

        {/* Add Role */}
        <div className="border-t pt-5">
          <label className="mb-2 block text-sm font-medium">
            Add role
          </label>

          <div className="flex gap-2">
            <input
              value={newRole}
              onChange={(e) =>
                setNewRole(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter"
                ) {
                  addRole();
                }
              }}
              placeholder="e.g. Coordinator"
              className="h-10 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />

            <button
              type="button"
              onClick={addRole}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-foreground px-4 text-sm font-medium text-background transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" />

              <span className="hidden sm:inline">
                Add role
              </span>
            </button>
          </div>
        </div>

        {/* Save */}
        <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {hasChanges ? (
              <>
                <p className="text-sm font-medium">
                  Unsaved changes
                </p>

                <p className="text-xs text-muted-foreground">
                  Your changes will not be applied
                  until you save them.
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                No new changes.
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {hasChanges && (
              <button
                type="button"
                onClick={resetChanges}
                disabled={saving}
                className="rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
              >
                Discard
              </button>
            )}

            <button
              type="button"
              disabled={
                saving || !hasChanges
              }
              onClick={saveChanges}
              className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Save className="h-4 w-4" />

              {saving
                ? "Saving..."
                : "Save changes"}
            </button>
          </div>
        </div>

      </div>
    </SettingsCard>
  );
}
function PermissionCell({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <td className="px-4 py-3 text-center">
      <label className="inline-flex cursor-pointer items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) =>
            onChange(
              e.target.checked
            )
          }
          className="h-4 w-4 cursor-pointer rounded border-input accent-foreground"
        />
      </label>
    </td>
  );
}

function PermissionDescription({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg bg-muted/40 px-3 py-2.5">
      <p className="text-xs font-medium">
        {title}
      </p>

      <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
/* -------------------------------------------------------------------------- */
/* Attendee Roles                                                                */
/* -------------------------------------------------------------------------- */

function AttendeeRolesSettings({
  eventId,
}: {
  eventId: string;
}) {
  const [roles, setRoles] =
    useState<AttendeeRole[]>(
      dummyAttendeeRoles
    );

  const [newRole, setNewRole] =
    useState("");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [saving, setSaving] =
    useState(false);

  const sortedRoles = [...roles].sort(
    (a, b) => a.rank - b.rank
  );

  function addRole() {
    const name = newRole.trim();

    if (!name) return;

    const role: AttendeeRole = {
      id: crypto.randomUUID(),
      eventId,
      name,
      description: "",
      rank: roles.length + 1,
    };

    setRoles((current) => [
      ...current,
      role,
    ]);

    setNewRole("");
  }

  function updateRole(
    id: string,
    changes: Partial<AttendeeRole>
  ) {
    setRoles((current) =>
      current.map((role) =>
        role.id === id
          ? {
              ...role,
              ...changes,
            }
          : role
      )
    );
  }

  function deleteRole(id: string) {
    setRoles((current) =>
      current
        .filter(
          (role) => role.id !== id
        )
        .sort(
          (a, b) => a.rank - b.rank
        )
        .map((role, index) => ({
          ...role,
          rank: index + 1,
        }))
    );
  }

  function moveRole(
    id: string,
    direction: "up" | "down"
  ) {
    const sorted = [...roles].sort(
      (a, b) => a.rank - b.rank
    );

    const index = sorted.findIndex(
      (role) => role.id === id
    );

    if (index === -1) return;

    const targetIndex =
      direction === "up"
        ? index - 1
        : index + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= sorted.length
    ) {
      return;
    }

    [
      sorted[index],
      sorted[targetIndex],
    ] = [
      sorted[targetIndex],
      sorted[index],
    ];

    setRoles(
      sorted.map((role, index) => ({
        ...role,
        rank: index + 1,
      }))
    );
  }

  async function saveChanges() {
    setSaving(true);

    await new Promise((resolve) =>
      setTimeout(resolve, 700)
    );

    console.log(
      "Saved attendee roles:",
      roles
    );

    setSaving(false);
  }

  return (
    <SettingsCard
      title="Attendee roles"
      description="Create categories for attendees and organize how they are identified within your event."
    >
      <div className="space-y-6">

        {/* Explanation */}
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="flex gap-3">
            <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

            <div>
              <p className="text-sm font-medium">
                Attendee categories
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Use attendee roles to distinguish
                different types of people attending
                your event. These roles don't grant
                management permissions.
              </p>
            </div>
          </div>
        </div>

        {/* Role list */}
        <div className="overflow-hidden rounded-lg border">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_100px] border-b bg-muted/40 px-4 py-3 text-xs font-medium text-muted-foreground">
            <div>Role</div>
            <div>Description</div>
            <div className="text-right">
              Actions
            </div>
          </div>

          {sortedRoles.map(
            (role, index) => (
              <div
                key={role.id}
                className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_100px] items-center gap-4 border-b px-4 py-3 last:border-b-0 hover:bg-muted/20"
              >
                {/* Role */}
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      disabled={
                        index === 0
                      }
                      onClick={() =>
                        moveRole(
                          role.id,
                          "up"
                        )
                      }
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-20"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={
                        index ===
                        sortedRoles.length -
                          1
                      }
                      onClick={() =>
                        moveRole(
                          role.id,
                          "down"
                        )
                      }
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-20"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium">
                    {role.rank}
                  </div>

                  {editingId ===
                  role.id ? (
                    <input
                      autoFocus
                      value={role.name}
                      onChange={(e) =>
                        updateRole(
                          role.id,
                          {
                            name: e.target
                              .value,
                          }
                        )
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key ===
                            "Enter" ||
                          e.key ===
                            "Escape"
                        ) {
                          setEditingId(
                            null
                          );
                        }
                      }}
                      className="h-8 min-w-0 w-full rounded-md border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  ) : (
                    <span className="truncate text-sm font-medium">
                      {role.name}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className="min-w-0">
                  <input
                    value={
                      role.description
                    }
                    onChange={(e) =>
                      updateRole(
                        role.id,
                        {
                          description:
                            e.target.value,
                        }
                      )
                    }
                    placeholder="Add a description..."
                    className="h-8 w-full min-w-0 border-0 bg-transparent px-0 text-sm text-muted-foreground outline-none placeholder:text-muted-foreground/60 focus:text-foreground"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingId(
                        editingId ===
                          role.id
                          ? null
                          : role.id
                      )
                    }
                    className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {editingId ===
                    role.id
                      ? "Done"
                      : "Rename"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteRole(
                        role.id
                      )
                    }
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        {/* Add role */}
        <div className="border-t pt-5">
          <label className="mb-2 block text-sm font-medium">
            Add attendee role
          </label>

          <div className="flex gap-2">
            <input
              value={newRole}
              onChange={(e) =>
                setNewRole(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter"
                ) {
                  addRole();
                }
              }}
              placeholder="e.g. Press, Staff, Guest"
              className="h-10 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />

            <button
              type="button"
              onClick={addRole}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-foreground px-4 text-sm font-medium text-background hover:opacity-90"
            >
              <Plus className="h-4 w-4" />

              <span className="hidden sm:inline">
                Add role
              </span>
            </button>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center justify-end border-t pt-5">
          <button
            type="button"
            disabled={saving}
            onClick={saveChanges}
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />

            {saving
              ? "Saving..."
              : "Save changes"}
          </button>
        </div>

      </div>
    </SettingsCard>
  );
}
/* -------------------------------------------------------------------------- */
/* Advanced                                                                    */
/* -------------------------------------------------------------------------- */

function AdvancedSettings({
  event,
}: {
  event: Event;
}) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState(false);

  return (
    <SettingsCard
      title="Advanced"
      description="Actions that can significantly affect this event."
    >
      <div className="space-y-0">

        {/* Archive */}
        <div className="flex flex-col gap-4 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">
              Archive event
            </p>

            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Archive this event when it is no
              longer active. The event and its
              data will remain available.
            </p>
          </div>

          <button
            type="button"
            className="shrink-0 rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Archive event
          </button>
        </div>

        <div className="my-6 border-t" />

        {/* Delete */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">
              Delete event
            </p>

            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Permanently delete this event and
              all of its associated data. This
              action cannot be undone.
            </p>
          </div>

          {!showDeleteConfirmation ? (
            <button
              type="button"
              onClick={() =>
                setShowDeleteConfirmation(
                  true
                )
              }
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30"
            >
              <Trash2 className="h-4 w-4" />
              Delete event
            </button>
          ) : (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                Are you sure?
              </p>

              <p className="mt-1 text-xs text-red-600/80 dark:text-red-400/70">
                This will permanently delete{" "}
                <strong>
                  {event.name}
                </strong>
                .
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setShowDeleteConfirmation(
                      false
                    )
                  }
                  className="rounded-md border bg-background px-3 py-1.5 text-xs font-medium"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                >
                  Yes, delete event
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Danger notice */}
      <div className="mt-6 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

        <div>
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            This is the danger zone
          </p>

          <p className="mt-1 text-xs leading-5 text-red-600/80 dark:text-red-400/70">
            Actions in this section can remove or
            significantly change your event data.
            Make sure you understand the consequences
            before continuing.
          </p>
        </div>
      </div>
    </SettingsCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared Components                                                          */
/* -------------------------------------------------------------------------- */

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card">
      <div className="border-b px-5 py-5 sm:px-6">
        <h2 className="font-semibold">
          {title}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
  prefix,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ElementType;
  prefix?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <div className="relative flex">
        {prefix && (
          <div className="flex h-10 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
            {prefix}
          </div>
        )}

        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        )}

        <input
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder={placeholder}
          className={[
            "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring",
            Icon ? "pl-10" : "",
            prefix
              ? "rounded-l-none"
              : "",
          ].join(" ")}
        />
      </div>
    </div>
  );
}

function SaveButton({
  saving,
  onClick,
}: {
  saving: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex justify-end border-t pt-5">
      <button
        type="button"
        disabled={saving}
        onClick={onClick}
        className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Save className="h-4 w-4" />

        {saving
          ? "Saving..."
          : "Save changes"}
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function toDateTimeLocal(
  value: string
) {
  if (!value) return "";

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "";
  }

  const offset =
    date.getTimezoneOffset();

  const localDate = new Date(
    date.getTime() -
      offset * 60 * 1000
  );

  return localDate
    .toISOString()
    .slice(0, 16);
}