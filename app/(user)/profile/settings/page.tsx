"use client";

import { useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Eye,
  Globe,
  Lock,
  Mail,
  Moon,
  Palette,
  Save,
  Shield,
  Sun,
  Trash2,
  User,
} from "lucide-react";

type SettingsSection =
  | "profile"
  | "account"
  | "notifications"
  | "events"
  | "appearance";

const sections = [
  {
    id: "profile" as const,
    label: "Profile",
    description: "Your personal information",
    icon: User,
  },
  {
    id: "account" as const,
    label: "Account",
    description: "Security and account access",
    icon: Shield,
  },
  {
    id: "notifications" as const,
    label: "Notifications",
    description: "Control what you hear about",
    icon: Bell,
  },
  {
    id: "events" as const,
    label: "Event defaults",
    description: "Default settings for your events",
    icon: CalendarDays,
  },
  {
    id: "appearance" as const,
    label: "Appearance",
    description: "Customize your experience",
    icon: Palette,
  },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");

  const [notifications, setNotifications] = useState({
    eventReminders: true,
    teamActivity: true,
    registrationUpdates: true,
    marketing: false,
  });

  const [eventDefaults, setEventDefaults] = useState({
    visibility: "private",
    allowRegistration: true,
    requireApproval: false,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your account and event preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside>
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                const active = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={[
                      "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition",
                      active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    ].join(" ")}
                  >
                    <Icon
                      className={[
                        "h-4 w-4 shrink-0",
                        active
                          ? "text-foreground"
                          : "text-muted-foreground",
                      ].join(" ")}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">
                        {section.label}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-muted-foreground">
                        {section.description}
                      </div>
                    </div>

                    <ChevronRight
                      className={[
                        "h-4 w-4 shrink-0 transition-opacity",
                        active
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-50",
                      ].join(" ")}
                    />
                  </button>
                );
              })}
            </nav>

            {/* Danger Zone Link */}
            <div className="mt-8 border-t pt-6">
              <button
                onClick={() => {
                  document
                    .getElementById("danger-zone")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Trash2 className="h-4 w-4" />

                <div>
                  <div className="text-sm font-medium">Danger zone</div>
                  <div className="text-xs text-red-500/70">
                    Delete your account
                  </div>
                </div>
              </button>
            </div>
          </aside>

          {/* Content */}
          <main className="min-w-0">
            {activeSection === "profile" && <ProfileSettings />}

            {activeSection === "account" && <AccountSettings />}

            {activeSection === "notifications" && (
              <NotificationSettings
                values={notifications}
                onChange={setNotifications}
              />
            )}

            {activeSection === "events" && (
              <EventSettings
                values={eventDefaults}
                onChange={setEventDefaults}
              />
            )}

            {activeSection === "appearance" && <AppearanceSettings />}

            {/* Danger Zone */}
            <div
              id="danger-zone"
              className="mt-10 rounded-xl border border-red-200 dark:border-red-900/50"
            >
              <div className="border-b border-red-200 px-5 py-4 dark:border-red-900/50">
                <h2 className="font-medium text-red-600">Danger zone</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Irreversible and destructive account actions.
                </p>
              </div>

              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Delete your account
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Permanently remove your account and associated data.
                  </p>
                </div>

                <button
                  type="button"
                  className="inline-flex shrink-0 items-center justify-center rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30"
                >
                  Delete account
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Profile                                                                    */
/* -------------------------------------------------------------------------- */

function ProfileSettings() {
  return (
    <SettingsCard
      title="Profile"
      description="Update the information people see when interacting with you."
    >
      <div className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-lg font-semibold">
            PK
          </div>

          <div>
            <button
              type="button"
              className="rounded-md border px-3 py-2 text-sm font-medium transition hover:bg-muted"
            >
              Change photo
            </button>

            <p className="mt-1.5 text-xs text-muted-foreground">
              JPG, PNG or WebP. Max 2MB.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="First name"
            defaultValue="Prasen"
          />

          <Field
            label="Last name"
            defaultValue="Kakade"
          />
        </div>

        <Field
          label="Email"
          type="email"
          defaultValue="you@example.com"
          icon={Mail}
        />

        <Field
          label="Bio"
          placeholder="Tell people a little about yourself..."
        />

        <SaveButton />
      </div>
    </SettingsCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Account                                                                    */
/* -------------------------------------------------------------------------- */

function AccountSettings() {
  return (
    <div className="space-y-6">
      <SettingsCard
        title="Account"
        description="Manage your account access and security."
      >
        <div className="space-y-5">
          <Field
            label="Current password"
            type="password"
            icon={Lock}
          />

          <Field
            label="New password"
            type="password"
            icon={Lock}
          />

          <Field
            label="Confirm new password"
            type="password"
            icon={Lock}
          />

          <SaveButton />
        </div>
      </SettingsCard>

      <SettingsCard
        title="Sessions"
        description="Manage devices currently signed in to your account."
      >
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="text-sm font-medium">
              Current session
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Chrome · Windows · Active now
            </p>
          </div>

          <span className="text-xs font-medium text-green-600">
            Active
          </span>
        </div>
      </SettingsCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Notifications                                                              */
/* -------------------------------------------------------------------------- */

function NotificationSettings({
  values,
  onChange,
}: {
  values: {
    eventReminders: boolean;
    teamActivity: boolean;
    registrationUpdates: boolean;
    marketing: boolean;
  };
  onChange: React.Dispatch<
    React.SetStateAction<typeof values>
  >;
}) {
  return (
    <SettingsCard
      title="Notifications"
      description="Choose which notifications you want to receive."
    >
      <div className="divide-y">
        <ToggleRow
          title="Event reminders"
          description="Get reminded about upcoming events and important deadlines."
          checked={values.eventReminders}
          onChange={(checked) =>
            onChange((current) => ({
              ...current,
              eventReminders: checked,
            }))
          }
        />

        <ToggleRow
          title="Team activity"
          description="Get notified when teammates make changes to an event."
          checked={values.teamActivity}
          onChange={(checked) =>
            onChange((current) => ({
              ...current,
              teamActivity: checked,
            }))
          }
        />

        <ToggleRow
          title="Registration updates"
          description="Receive updates when people register for your events."
          checked={values.registrationUpdates}
          onChange={(checked) =>
            onChange((current) => ({
              ...current,
              registrationUpdates: checked,
            }))
          }
        />

        <ToggleRow
          title="Product updates"
          description="Occasional news about Valid and new features."
          checked={values.marketing}
          onChange={(checked) =>
            onChange((current) => ({
              ...current,
              marketing: checked,
            }))
          }
        />
      </div>
    </SettingsCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Event defaults                                                             */
/* -------------------------------------------------------------------------- */

function EventSettings({
  values,
  onChange,
}: {
  values: {
    visibility: string;
    allowRegistration: boolean;
    requireApproval: boolean;
  };
  onChange: React.Dispatch<
    React.SetStateAction<typeof values>
  >;
}) {
  return (
    <SettingsCard
      title="Event defaults"
      description="Choose the defaults used when creating new events."
    >
      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Default visibility
          </label>

          <div className="relative">
            <Eye className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <select
              value={values.visibility}
              onChange={(e) =>
                onChange((current) => ({
                  ...current,
                  visibility: e.target.value,
                }))
              }
              className="h-10 w-full appearance-none rounded-md border bg-background pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-ring"
            >
              <option value="private">
                Private
              </option>
              <option value="unlisted">
                Unlisted
              </option>
              <option value="public">
                Public
              </option>
            </select>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            You can change visibility for individual events.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Timezone
          </label>

          <div className="relative">
            <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <select className="h-10 w-full appearance-none rounded-md border bg-background pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-ring">
              <option>Asia/Kolkata (IST)</option>
              <option>UTC</option>
              <option>America/New_York</option>
              <option>America/Los_Angeles</option>
              <option>Europe/London</option>
            </select>
          </div>
        </div>

        <div className="divide-y rounded-lg border">
          <ToggleRow
            title="Allow registration"
            description="Allow attendees to register for newly created events."
            checked={values.allowRegistration}
            onChange={(checked) =>
              onChange((current) => ({
                ...current,
                allowRegistration: checked,
              }))
            }
          />

          <ToggleRow
            title="Require registration approval"
            description="Manually approve attendees before they can join."
            checked={values.requireApproval}
            onChange={(checked) =>
              onChange((current) => ({
                ...current,
                requireApproval: checked,
              }))
            }
          />
        </div>

        <SaveButton />
      </div>
    </SettingsCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Appearance                                                                 */
/* -------------------------------------------------------------------------- */

function AppearanceSettings() {
  const [theme, setTheme] = useState("system");

  return (
    <SettingsCard
      title="Appearance"
      description="Customize how Valid looks for you."
    >
      <div>
        <label className="mb-3 block text-sm font-medium">
          Theme
        </label>

        <div className="grid grid-cols-3 gap-3">
          {[
            {
              id: "light",
              label: "Light",
              icon: Sun,
            },
            {
              id: "dark",
              label: "Dark",
              icon: Moon,
            },
            {
              id: "system",
              label: "System",
              icon: Globe,
            },
          ].map((item) => {
            const Icon = item.icon;
            const selected = theme === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTheme(item.id)}
                className={[
                  "flex flex-col items-center justify-center gap-2 rounded-lg border p-4 transition",
                  selected
                    ? "border-foreground bg-muted"
                    : "hover:bg-muted/60",
                ].join(" ")}
              >
                <Icon className="h-5 w-5" />

                <span className="text-sm font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </SettingsCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Reusable components                                                        */
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
        <h2 className="font-semibold">{title}</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  type = "text",
  defaultValue,
  placeholder,
  icon: Icon,
}: {
  label: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  icon?: React.ElementType;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        )}

        {label === "Bio" ? (
          <textarea
            rows={4}
            placeholder={placeholder}
            defaultValue={defaultValue}
            className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
        ) : (
          <input
            type={type}
            defaultValue={defaultValue}
            placeholder={placeholder}
            className={[
              "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring",
              Icon ? "pl-10" : "",
            ].join(" ")}
          />
        )}
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>

        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          "relative h-6 w-11 shrink-0 rounded-full transition",
          checked ? "bg-foreground" : "bg-muted",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-1 h-4 w-4 rounded-full bg-background shadow-sm transition",
            checked ? "left-6" : "left-1",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

function SaveButton() {
  return (
    <div className="flex justify-end border-t pt-5">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
      >
        <Save className="h-4 w-4" />
        Save changes
      </button>
    </div>
  );
}