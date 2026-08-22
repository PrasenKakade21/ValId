"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";

export type VerificationStatus = "SUCCESS" | "ALREADY_CHECKED_IN" | "INVALID" | null;

export interface AttendeeRecord {
  fullName: string;
  role: string;
  company: string;
  ticketCode: string;
  checkedInAt?: string;
}

interface StatusModalProps {
  status: VerificationStatus;
  attendee?: AttendeeRecord | null;
  message?: string;
  onClose: () => void;
}

export default function StatusModal({ status, attendee, message, onClose }: StatusModalProps) {
  useEffect(() => {
    if (status === "SUCCESS") {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  }, [status]);

  if (!status) return null;

  const isSuccess = status === "SUCCESS";
  const isAlready = status === "ALREADY_CHECKED_IN";
  const isInvalid = status === "INVALID";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl border transition-all transform scale-100 ${
          isSuccess
            ? "bg-zinc-950 border-emerald-500/50 shadow-emerald-500/10"
            : isAlready
            ? "bg-zinc-950 border-amber-500/50 shadow-amber-500/10"
            : "bg-zinc-950 border-red-500/50 shadow-red-500/10"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full bg-zinc-900 border border-zinc-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Status Icon */}
        <div className="flex justify-center mb-4">
          {isSuccess && <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />}
          {isAlready && <AlertTriangle className="w-16 h-16 text-amber-400" />}
          {isInvalid && <XCircle className="w-16 h-16 text-red-400" />}
        </div>

        {/* Status Title */}
        <h2 className="text-xl font-bold tracking-tight text-white mb-1">
          {isSuccess && "Access Granted"}
          {isAlready && "Already Scanned"}
          {isInvalid && "Invalid Ticket"}
        </h2>

        <p className="text-xs text-zinc-400 mb-6">{message}</p>

        {/* Attendee Details Card */}
        {attendee && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-left space-y-2 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-sm text-white">{attendee.fullName}</h3>
                <p className="text-xs text-zinc-400">{attendee.company}</p>
              </div>
              <span className="px-2 py-0.5 bg-zinc-800 text-emerald-400 border border-zinc-700 text-[10px] font-mono rounded-full uppercase">
                {attendee.role}
              </span>
            </div>
            <div className="border-t border-zinc-800/80 pt-2 flex justify-between text-[10px] font-mono text-zinc-500">
              <span>CODE: {attendee.ticketCode}</span>
              {attendee.checkedInAt && <span>TIME: {attendee.checkedInAt}</span>}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className={`w-full py-3 rounded-xl font-semibold text-xs transition ${
            isSuccess
              ? "bg-emerald-500 hover:bg-emerald-400 text-black"
              : isAlready
              ? "bg-amber-500 hover:bg-amber-400 text-black"
              : "bg-red-500 hover:bg-red-400 text-white"
          }`}
        >
          Scan Next Badge
        </button>
      </div>
    </div>
  );
}