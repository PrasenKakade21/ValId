"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Building2, ChevronsUpDown, Check, Plus } from "lucide-react";

type Organization = {
  id: string;
  name: string;
  slug: string;
  role: string;
};

type Event = {
  id: string;
  org_id: string;
  slug: string;
};

interface OrgSelectorProps {
  organizations: Organization[];
  selectedOrg?: Organization;
  events: Event[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onDropdownToggle?: () => void;
}

export const getRoleBadgeStyle = (role: string) => {
  switch (role.toLowerCase()) {
    case "owner":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "admin":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "volunteer":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    default:
      return "bg-zinc-800 text-zinc-300 border-zinc-700";
  }
};

export function OrgSelector({
  organizations,
  selectedOrg,
  events,
  isOpen,
  setIsOpen,
  onDropdownToggle,
}: OrgSelectorProps) {
  const router = useRouter();

  const handleOrganizationChange = (organization: Organization) => {
    const firstEvent = events.find((e) => e.org_id === organization.id);
    setIsOpen(false);

    if (!firstEvent) return;
    router.push(`/dashboard/${organization.slug}/${firstEvent.slug}`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          onDropdownToggle?.();
        }}
        className="flex items-center space-x-2.5 bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl px-3 py-1.5 transition text-left"
      >
        <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-zinc-100 truncate max-w-[140px] sm:max-w-[200px]">
            {selectedOrg?.name}
          </span>

          {selectedOrg && (
            <span
              className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${getRoleBadgeStyle(
                selectedOrg.role
              )}`}
            >
              {selectedOrg.role}
            </span>
          )}
        </div>

        <ChevronsUpDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute left-0 top-[48px] w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-20 overflow-hidden p-1">
            <div className="px-2 py-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              Select Organization
            </div>

            <div className="max-h-52 overflow-y-auto space-y-0.5">
              {organizations.map((org) => {
                const isSelected = org.id === selectedOrg?.id;

                return (
                  <button
                    key={org.id}
                    onClick={() => handleOrganizationChange(org)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                      isSelected
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Building2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">{org.name}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${getRoleBadgeStyle(
                          org.role
                        )}`}
                      >
                        {org.role}
                      </span>

                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-1 mt-1 border-t border-zinc-800">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push("/dashboard/organizations/new");
                }}
                className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Organization</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}