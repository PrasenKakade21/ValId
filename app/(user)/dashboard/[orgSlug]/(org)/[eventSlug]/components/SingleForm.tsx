"use client";

import React from "react";
import { AttendeeData } from "./CardCanvas";

interface SingleFormProps {
  data: AttendeeData;
  onChange: (updated: AttendeeData) => void;
}

export default function SingleForm({ data, onChange }: SingleFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange({ ...data, [e.target.name]: e.target.value });
  };

  const generateNewCode = () => {
    const code = `TCK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    onChange({ ...data, ticketCode: code });
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
      <h3 className="text-sm font-semibold text-zinc-200">Attendee Details</h3>

      <div className="space-y-3">
        <div>
          <label className="text-[11px] font-medium text-zinc-400">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={data.fullName}
            onChange={handleChange}
            placeholder="e.g. Alex Mercer"
            className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-[11px] font-medium text-zinc-400">Email Address</label>
          <input
            type="email"
            name="email"
            value={data.email}
            onChange={handleChange}
            placeholder="alex@company.com"
            className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-medium text-zinc-400">Role / Badge</label>
            <select
              name="role"
              value={data.role}
              onChange={handleChange}
              className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Attendee">Attendee</option>
              <option value="Speaker">Speaker</option>
              <option value="VIP">VIP</option>
              <option value="Organizer">Organizer</option>
              <option value="Sponsor">Sponsor</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-zinc-400">Company</label>
            <input
              type="text"
              name="company"
              value={data.company}
              onChange={handleChange}
              placeholder="Acme Inc."
              className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-medium text-zinc-400 flex justify-between">
            <span>Ticket Code</span>
            <button
              type="button"
              onClick={generateNewCode}
              className="text-emerald-400 hover:underline text-[10px]"
            >
              Generate Random
            </button>
          </label>
          <input
            type="text"
            name="ticketCode"
            value={data.ticketCode}
            onChange={handleChange}
            className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>
    </div>
  );
}