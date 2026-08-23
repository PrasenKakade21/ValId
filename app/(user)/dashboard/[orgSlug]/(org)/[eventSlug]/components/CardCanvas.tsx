"use client";

import React, { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import type {
  AttendeeInput,
  AttendeeRecord,
} from "@/types/attendee";
interface CardCanvasProps {
  attendee: AttendeeInput;
}

const CardCanvas = forwardRef<HTMLDivElement, CardCanvasProps>(({ attendee }, ref) => {
  return (
    <div
      ref={ref}
      className="w-[320px] h-[500px] bg-zinc-950 text-white rounded-3xl p-6 flex flex-col justify-between border border-zinc-800/80 shadow-2xl relative overflow-hidden select-none"
    >
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-800/80 pb-3">
          <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold">
            DEVCONF 2026
          </span>
          <span className="px-2.5 py-0.5 bg-zinc-900 border border-zinc-700/60 text-zinc-300 text-[10px] font-semibold rounded-full uppercase tracking-wider">
            {attendee.role || "Attendee"}
          </span>
        </div>

        <div>
          <h2 className="text-xl font-black text-white tracking-tight leading-snug">
            {attendee.fullName || "Jane Doe"}
          </h2>
          <p className="text-xs text-zinc-400 font-medium truncate mt-0.5">
            {attendee.company || "Independent"}
          </p>
        </div>
      </div>

      {/* QR Code Container */}
      <div className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center self-center shadow-2xl">
        <QRCodeSVG
          value={JSON.stringify({ ticketCode: attendee.ticketCode || "TCK-DEMO" })}
          size={140}
          level="H"
        />
        <p className="text-[10px] font-mono text-zinc-900 font-bold mt-2 tracking-wider">
          {attendee.ticketCode || "TCK-DEMO"}
        </p>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-800/80 pt-3 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
        <span>SCAN FOR ACCESS</span>
        <span>VERIFIED BADGE</span>
      </div>
    </div>
  );
});

CardCanvas.displayName = "CardCanvas";
export default CardCanvas;