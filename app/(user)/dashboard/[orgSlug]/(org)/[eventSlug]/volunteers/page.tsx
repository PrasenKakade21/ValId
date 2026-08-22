"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  Download,
  RefreshCw,
  Loader2,
  Plus,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Trash2,
  Edit3,
  X,
} from "lucide-react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

interface Volunteer {
  id: string;
  volunteer_code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  team: string | null;
  role: "admin" | "volunteer";
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
}

const TEAMS = [
  "Registration",
  "Technical",
  "Hospitality",
  "Security",
  "Media",
  "Logistics",
  "Stage",
  "Food",
];

export default function VolunteersPage() {

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingVolunteer, setEditingVolunteer] =
    useState<Volunteer | null>(null);

  // --------------------------------------------------
  // FETCH
  // --------------------------------------------------
const {
  data,
  error,
  isLoading,
  mutate,
} = useSWR(
  "/api/volunteers",
  fetcher,
  {
    // Don't re-fetch the same data more than once
    // within 5 minutes.
    dedupingInterval: 5 * 60 * 1000,

    // If cached data is older than the
    // deduplication window, allow revalidation.
    revalidateIfStale: true,

    // Don't automatically refresh just because
    // the user switches tabs.
    revalidateOnFocus: false,

    // Don't automatically refresh when
    // internet reconnects.
    revalidateOnReconnect: false,
  }
);

const volunteers: Volunteer[] =
  data?.volunteers || [];

const loading = isLoading;

  // --------------------------------------------------
  // FILTERING
  // --------------------------------------------------

  const filteredVolunteers = useMemo(() => {
    const query = search.toLowerCase().trim();

    return volunteers.filter((volunteer) => {
      const matchesSearch =
        !query ||
        volunteer.full_name.toLowerCase().includes(query) ||
        volunteer.volunteer_code.toLowerCase().includes(query) ||
        volunteer.email?.toLowerCase().includes(query) ||
        volunteer.phone?.toLowerCase().includes(query);

      const matchesRole =
        roleFilter === "all" ||
        volunteer.role === roleFilter;

      const matchesTeam =
        teamFilter === "all" ||
        volunteer.team === teamFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "checked_in" &&
          volunteer.checked_in) ||
        (statusFilter === "pending" &&
          !volunteer.checked_in);

      return (
        matchesSearch &&
        matchesRole &&
        matchesTeam &&
        matchesStatus
      );
    });
  }, [
    volunteers,
    search,
    roleFilter,
    teamFilter,
    statusFilter,
  ]);

  // --------------------------------------------------
  // STATS
  // --------------------------------------------------

  const totalVolunteers = volunteers.length;

  const checkedInCount = volunteers.filter(
    (v) => v.checked_in
  ).length;

  const adminCount = volunteers.filter(
    (v) => v.role === "admin"
  ).length;

  // --------------------------------------------------
  // SELECTION
  // --------------------------------------------------

  const toggleSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const toggleSelectAll = () => {
    const visibleIds = filteredVolunteers.map(
      (v) => v.id
    );

    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) =>
        selectedIds.includes(id)
      );

    if (allSelected) {
      setSelectedIds((current) =>
        current.filter(
          (id) => !visibleIds.includes(id)
        )
      );
    } else {
      setSelectedIds((current) => [
        ...new Set([...current, ...visibleIds]),
      ]);
    }
  };

  // --------------------------------------------------
  // INDIVIDUAL CHECK-IN
  // --------------------------------------------------
const [updatingId, setUpdatingId] = useState<string | null>(null);
const [updateErrorId, setUpdateErrorId] = useState<string | null>(null);
const toggleCheckIn = async (volunteer: Volunteer) => {
  if (updatingId === volunteer.id) return;

  const checkedIn = !volunteer.checked_in;

  const checkedInAt = checkedIn
    ? new Date().toISOString()
    : null;

  setUpdatingId(volunteer.id);
  setUpdateErrorId(null);

  try {
    const res = await fetch(
      `/api/volunteers/${volunteer.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checked_in: checkedIn,
          checked_in_at: checkedInAt,
        }),
      }
    );

    if (!res.ok) {
      throw new Error(
        "Failed to update check-in"
      );
    }

    // Only update SWR after the server confirms it.
    await mutate();

  } catch (error) {
    console.error(
      "Failed to update check-in:",
      error
    );

    setUpdateErrorId(volunteer.id);

  } finally {
    setUpdatingId(null);
  }
};

  // --------------------------------------------------
  // BULK ACTION
  // --------------------------------------------------

  const bulkAction = async (
    action:
      | "check_in"
      | "check_out"
      | "make_admin"
      | "remove_admin"
      | "delete"
  ) => {
    if (selectedIds.length === 0) return;

    if (
      action === "delete" &&
      !confirm(
        `Delete ${selectedIds.length} selected volunteer${
          selectedIds.length > 1 ? "s" : ""
        }?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        "/api/volunteers/bulk",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ids: selectedIds,
            action,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Bulk action failed");
      }

      setSelectedIds([]);
      await mutate();
    } catch (error) {
      console.error("Bulk action failed:", error);
    }
  };

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  const deleteVolunteer = async (
    volunteer: Volunteer
  ) => {
    if (
      !confirm(
        `Delete ${volunteer.full_name}?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `/api/volunteers/${volunteer.id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete volunteer");
      }

      await mutate();
    } catch (error) {
      console.error(error);
    }
  };

  // --------------------------------------------------
  // EXPORT
  // --------------------------------------------------

  const exportCSV = () => {
    const headers = [
      "Volunteer ID",
      "Full Name",
      "Email",
      "Phone",
      "Team",
      "Role",
      "Checked In",
      "Checked In At",
    ];

    const rows = filteredVolunteers.map(
      (volunteer) =>
        [
          volunteer.volunteer_code,
          volunteer.full_name,
          volunteer.email || "",
          volunteer.phone || "",
          volunteer.team || "",
          volunteer.role,
          volunteer.checked_in ? "YES" : "NO",
          volunteer.checked_in_at
            ? new Date(
                volunteer.checked_in_at
              ).toLocaleString()
            : "",
        ]
          .map(
            (value) =>
              `"${String(value).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(",")
    );

    const csv = [
      headers.join(","),
      ...rows,
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv",
    });

    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download = `volunteers_${Date.now()}.csv`;
    link.click();

    window.URL.revokeObjectURL(url);
  };

  // --------------------------------------------------
  // MODAL
  // --------------------------------------------------

  const openAddModal = () => {
    setEditingVolunteer(null);
    setShowModal(true);
  };

  const openEditModal = (
    volunteer: Volunteer
  ) => {
    setEditingVolunteer(volunteer);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVolunteer(null);
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Volunteer Management
          </h1>

          <p className="text-xs text-zinc-400 mt-1">
            Manage volunteers, admins, teams and check-ins.
          </p>
        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={mutate}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition"
            title="Refresh"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                loading ? "animate-spin" : ""
              }`}
            />
          </button>

          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Volunteer</span>
          </button>

        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        <StatCard
          label="Total Volunteers"
          value={totalVolunteers}
          icon={
            <Users className="w-4 h-4" />
          }
        />

        <StatCard
          label="Checked In"
          value={checkedInCount}
          icon={
            <CheckCircle2 className="w-4 h-4" />
          }
        />

        <StatCard
          label="Admins"
          value={adminCount}
          icon={
            <ShieldCheck className="w-4 h-4" />
          }
        />

      </div>

      {/* SEARCH + FILTERS */}
      <div className="flex flex-col lg:flex-row gap-3">

        <div className="relative flex-1">

          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search name, volunteer ID, email..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 placeholder:text-zinc-500"
          />

        </div>

        <select
          value={roleFilter}
          onChange={(e) =>
            setRoleFilter(e.target.value)
          }
          className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
        >
          <option value="all">
            All Roles
          </option>
          <option value="volunteer">
            Volunteers
          </option>
          <option value="admin">
            Admins
          </option>
        </select>

        <select
          value={teamFilter}
          onChange={(e) =>
            setTeamFilter(e.target.value)
          }
          className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
        >
          <option value="all">
            All Teams
          </option>

          {TEAMS.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
        >
          <option value="all">
            All Status
          </option>
          <option value="checked_in">
            Checked In
          </option>
          <option value="pending">
            Pending
          </option>
        </select>

      </div>

      {/* BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="bg-zinc-950 border border-zinc-700 rounded-2xl p-3 flex flex-wrap items-center gap-2">

          <span className="text-xs font-semibold text-white mr-2">
            {selectedIds.length} selected
          </span>

          <button
            onClick={() =>
              bulkAction("check_in")
            }
            className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/20"
          >
            Check In
          </button>

          <button
            onClick={() =>
              bulkAction("check_out")
            }
            className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs hover:bg-amber-500/20"
          >
            Check Out
          </button>

          <button
            onClick={() =>
              bulkAction("make_admin")
            }
            className="px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs hover:bg-purple-500/20"
          >
            Make Admin
          </button>

          <button
            onClick={() =>
              bulkAction("remove_admin")
            }
            className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs hover:text-white"
          >
            Remove Admin
          </button>

          <button
            onClick={() =>
              bulkAction("delete")
            }
            className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/20"
          >
            Delete
          </button>

          <button
            onClick={() => setSelectedIds([])}
            className="ml-auto p-2 text-zinc-500 hover:text-white"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>

        </div>
      )}

      {/* TABLE */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden">

        {loading ? (

          <div className="p-12 flex flex-col items-center justify-center space-y-3 text-zinc-500">

            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />

            <span className="text-xs">
              Fetching volunteer records...
            </span>

          </div>

        ) : filteredVolunteers.length === 0 ? (

          <div className="p-12 text-center space-y-2">

            <Users className="w-8 h-8 text-zinc-600 mx-auto" />

            <p className="text-sm font-semibold text-zinc-300">
              No volunteers found
            </p>

            <p className="text-xs text-zinc-500">
              Try changing your search or filters.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left text-xs border-collapse">

              <thead>

                <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400">

                  <th className="py-3.5 px-4 w-10">

                    <input
                      type="checkbox"
                      checked={
                        filteredVolunteers.length > 0 &&
                        filteredVolunteers.every(
                          (v) =>
                            selectedIds.includes(
                              v.id
                            )
                        )
                      }
                      onChange={toggleSelectAll}
                      className="accent-emerald-500"
                    />

                  </th>

                  <th className="py-3.5 px-4 font-semibold">
                    Volunteer
                  </th>

                  <th className="py-3.5 px-4 font-semibold">
                    Volunteer ID
                  </th>

                  <th className="py-3.5 px-4 font-semibold">
                    Team
                  </th>

                  <th className="py-3.5 px-4 font-semibold">
                    Role
                  </th>

                  <th className="py-3.5 px-4 font-semibold">
                    Status
                  </th>

                  <th className="py-3.5 px-4 font-semibold">
                    Check-in Time
                  </th>

                  <th className="py-3.5 px-4 font-semibold text-right">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-zinc-800/50">

                {filteredVolunteers.map(
                  (volunteer) => (

                    <tr
                      key={volunteer.id}
                      className="hover:bg-zinc-900/50 transition"
                    >

                      {/* CHECKBOX */}
                      <td className="py-3.5 px-4">

                        <input
                          type="checkbox"
                          checked={selectedIds.includes(
                            volunteer.id
                          )}
                          onChange={() =>
                            toggleSelection(
                              volunteer.id
                            )
                          }
                          className="accent-emerald-500"
                        />

                      </td>

                      {/* NAME */}
                      <td className="py-3.5 px-4">

                        <div>
                          <p className="font-semibold text-white">
                            {volunteer.full_name}
                          </p>

                          <p className="text-[11px] text-zinc-500">
                            {volunteer.email ||
                              "No email provided"}
                          </p>
                        </div>

                      </td>

                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono text-zinc-300">

                        <span className="inline-flex px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800">
                          {volunteer.volunteer_code}
                        </span>

                      </td>

                      {/* TEAM */}
                      <td className="py-3.5 px-4 text-zinc-400">
                        {volunteer.team || "—"}
                      </td>

                      {/* ROLE */}
                      <td className="py-3.5 px-4">

                        {volunteer.role ===
                        "admin" ? (

                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px]">

                            <ShieldCheck className="w-3 h-3" />

                            Admin

                          </span>

                        ) : (

                          <span className="px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px]">
                            Volunteer
                          </span>

                        )}

                      </td>

                      {/* STATUS */}
                      <td className="py-3.5 px-4">
<button
  onClick={() => {
    if (updateErrorId === volunteer.id) {
      setUpdateErrorId(null);
    }

    toggleCheckIn(volunteer);
  }}
  disabled={updatingId === volunteer.id}
  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border transition ${
    updatingId === volunteer.id
      ? "bg-zinc-800 border-zinc-700 text-zinc-400 cursor-wait"
      : updateErrorId === volunteer.id
      ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
      : volunteer.checked_in
      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
      : "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
  }`}
>
  {updatingId === volunteer.id ? (
    <>
      <Loader2 className="w-3 h-3 animate-spin" />
      {volunteer.checked_in
        ? "Checking Out..."
        : "Checking In..."}
    </>
  ) : updateErrorId === volunteer.id ? (
    <>
      <XCircle className="w-3 h-3" />
      Retry
    </>
  ) : volunteer.checked_in ? (
    <>
      <CheckCircle2 className="w-3 h-3" />
      Check In
    </>
  ) : (
    <>
      <CheckCircle2 className="w-3 h-3" />
      Check Out
    </>
  )}
</button>
                      </td>

                      {/* TIME */}
                      <td className="py-3.5 px-4 text-zinc-500 text-[11px]">

                        {volunteer.checked_in_at
                          ? new Date(
                              volunteer.checked_in_at
                            ).toLocaleString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "numeric",
                              month: "short",
                            })
                          : "—"}

                      </td>

                      {/* ACTIONS */}
                      <td className="py-3.5 px-4">

                        <div className="flex justify-end gap-1">

                          <button
                            onClick={() =>
                              openEditModal(
                                volunteer
                              )
                            }
                            className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition"
                            title="Edit Volunteer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() =>
                              deleteVolunteer(
                                volunteer
                              )
                            }
                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition"
                            title="Delete Volunteer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

        {/* FOOTER */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/40 flex justify-between items-center text-xs text-zinc-400">

          <span>
            Showing{" "}
            <strong className="text-white">
              {filteredVolunteers.length}
            </strong>{" "}
            of{" "}
            <strong className="text-white">
              {volunteers.length}
            </strong>{" "}
            volunteers
          </span>

          <span className="text-[11px] text-zinc-500">
            {selectedIds.length > 0
              ? `${selectedIds.length} selected`
              : "Volunteer database"}
          </span>

        </div>

      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <VolunteerModal
          volunteer={editingVolunteer}
          onClose={closeModal}
          onSaved={() => {
            closeModal();
            mutate();
          }}
        />
      )}

    </div>
  );
}

/* ======================================================
   STAT CARD
====================================================== */

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4">

      <div className="flex items-center justify-between">

        <span className="text-[10px] text-zinc-500">
          {label}
        </span>

        <span className="text-zinc-600">
          {icon}
        </span>

      </div>

      <p className="text-xl font-bold text-white mt-2">
        {value}
      </p>

    </div>
  );
}

/* ======================================================
   ADD / EDIT MODAL
====================================================== */

function VolunteerModal({
  volunteer,
  onClose,
  onSaved,
}: {
  volunteer: Volunteer | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [fullName, setFullName] = useState(
    volunteer?.full_name || ""
  );

  const [email, setEmail] = useState(
    volunteer?.email || ""
  );

  const [phone, setPhone] = useState(
    volunteer?.phone || ""
  );

  const [team, setTeam] = useState(
    volunteer?.team || ""
  );

  const [role, setRole] = useState<
    "admin" | "volunteer"
  >(volunteer?.role || "volunteer");

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) {
      alert("Please enter the volunteer's name.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        full_name: fullName.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        team: team || null,
        role,
      };

      const res = await fetch(
        volunteer
          ? `/api/volunteers/${volunteer.id}`
          : "/api/volunteers",
        {
          method: volunteer ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const data = await res
          .json()
          .catch(() => ({}));

        throw new Error(
          data.error || "Failed to save volunteer"
        );
      }

      onSaved();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save volunteer."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">

      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">

          <div>
            <h2 className="font-bold text-white">
              {volunteer
                ? "Edit Volunteer"
                : "Add Volunteer"}
            </h2>

            <p className="text-[11px] text-zinc-500 mt-1">
              {volunteer
                ? "Update volunteer information."
                : "Add someone to your volunteer team."}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-900"
          >
            <X className="w-4 h-4" />
          </button>

        </div>

        {/* FORM */}
        <div className="p-5 space-y-4">

          <FormInput
            label="Full Name"
            value={fullName}
            onChange={setFullName}
            placeholder="John Doe"
          />

          <FormInput
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="john@example.com"
          />

          <FormInput
            label="Phone"
            value={phone}
            onChange={setPhone}
            placeholder="+91..."
          />

          <div className="grid grid-cols-2 gap-3">

            <FormSelect
              label="Team"
              value={team}
              onChange={setTeam}
              options={TEAMS}
            />

            <FormSelect
              label="Role"
              value={role}
              onChange={(value) =>
                setRole(
                  value as
                    | "admin"
                    | "volunteer"
                )
              }
              options={[
                "volunteer",
                "admin",
              ]}
            />

          </div>

          {volunteer && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">

              <p className="text-[10px] text-zinc-500">
                Volunteer ID
              </p>

              <p className="font-mono text-xs text-zinc-300 mt-1">
                {volunteer.volunteer_code}
              </p>

            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-zinc-800 flex justify-end gap-2">

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-zinc-400 hover:text-white"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black rounded-xl text-xs font-bold"
          >
            {saving
              ? "Saving..."
              : volunteer
              ? "Save Changes"
              : "Add Volunteer"}
          </button>

        </div>

      </div>

    </div>
  );
}

/* ======================================================
   FORM INPUT
====================================================== */

function FormInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>

      <label className="text-[10px] text-zinc-500">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="mt-1 w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 placeholder:text-zinc-600"
      />

    </div>
  );
}

/* ======================================================
   FORM SELECT
====================================================== */

function FormSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>

      <label className="text-[10px] text-zinc-500">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="mt-1 w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
      >
        <option value="">
          Select {label}
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>

    </div>
  );
}