"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, ChevronsUpDown, Check, Plus } from "lucide-react";

type Event = {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  status: string;
};

type Organization = {
  id: string;
  name: string;
  slug: string;
  role: string;
};

interface EventSelectorProps {
  events: Event[];
  selectedEvent?: Event;
  selectedOrg?: Organization;
  onDropdownToggle?: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function EventSelector({
  events,
  selectedEvent,
  selectedOrg,
  isOpen,
  setIsOpen,
  onDropdownToggle,
}: EventSelectorProps) {
  const router = useRouter();

  const handleEventChange = (event: Event) => {
    setIsOpen(false);
    if (!selectedOrg) return;
    router.push(`/dashboard/${selectedOrg.slug}/${event.slug}`);
  };

  return (
    <div className="p-4 border-b border-zinc-800 relative">
      <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 px-1">
        Select Event
      </label>

      <button
        onClick={() => {
          setIsOpen(!isOpen);
          onDropdownToggle?.();
        }}
        className="w-full flex items-center justify-between bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl px-3 py-2.5 transition text-left"
      >
        <div className="flex items-center space-x-2.5 truncate">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          </div>

          <div className="truncate">
            <p className="text-xs font-semibold text-zinc-100 truncate">
              {selectedEvent?.name ?? "Select Event"}
            </p>
          </div>
        </div>

        <ChevronsUpDown className="w-4 h-4 text-zinc-500 shrink-0" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute left-4 right-4 top-[70px] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-20 overflow-hidden p-1">
            <div className="max-h-52 overflow-y-auto space-y-0.5">
              {events.map((event) => {
                const isSelected = event.id === selectedEvent?.id;

                return (
                  <button
                    key={event.id}
                    onClick={() => handleEventChange(event)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                      isSelected
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
                    }`}
                  >
                    <span className="truncate">{event.name}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-1 mt-1 border-t border-zinc-800">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push(`/dashboard/${selectedOrg?.slug}/events/new`);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Event</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}