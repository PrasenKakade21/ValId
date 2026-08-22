"use client";

import React, { useState } from "react";
import QRScanner from "./components/QRScanner";
import StatusModal, { VerificationStatus, AttendeeRecord } from "./components/StatusModal";
import { Search, QrCode, Keyboard, Loader2 } from "lucide-react";

export default function VerifierPage() {
  const [activeMode, setActiveMode] = useState<"camera" | "manual">("camera");
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Verification Outcome State
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(null);
  const [scannedAttendee, setScannedAttendee] = useState<AttendeeRecord | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const handleVerify = async (ticketCode: string) => {
    if (loading || !ticketCode) return;
    setLoading(true);

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationStatus(data.status); // "SUCCESS" | "ALREADY_CHECKED_IN"
        setScannedAttendee(data.attendee);
        setStatusMessage(data.message);
      } else {
        setVerificationStatus("INVALID");
        setScannedAttendee(null);
        setStatusMessage(data.message || "Ticket code not found in event database.");
      }
    } catch (err) {
      setVerificationStatus("INVALID");
      setStatusMessage("Network error verifying code.");
    } finally {
      setLoading(false);
    }
  };

  const parseScanText = (decodedText: string) => {
    try {
      // Handles JSON embedded QR codes (e.g. { "ticketCode": "TCK-123456" })
      const parsed = JSON.parse(decodedText);
      if (parsed.ticketCode) {
        handleVerify(parsed.ticketCode);
        return;
      }
    } catch {
      // Fallback if QR code is just raw string text
      handleVerify(decodedText.trim());
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 flex flex-col items-center justify-center relative">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black tracking-tight">Access Control</h1>
          <p className="text-xs text-zinc-400">Scan event badge QR or enter ticket ID manually.</p>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveMode("camera")}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-semibold transition ${
              activeMode === "camera"
                ? "bg-zinc-800 text-emerald-400 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Camera Scanner</span>
          </button>
          <button
            onClick={() => setActiveMode("manual")}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-semibold transition ${
              activeMode === "manual"
                ? "bg-zinc-800 text-emerald-400 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>Manual Code</span>
          </button>
        </div>

        {/* View 1: Camera Scanner */}
        {activeMode === "camera" && (
          <div className="space-y-4">
            <QRScanner onScanSuccess={parseScanText} />
            {loading && (
              <div className="flex items-center justify-center space-x-2 text-xs text-emerald-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying ticket...</span>
              </div>
            )}
          </div>
        )}

        {/* View 2: Manual Code Input */}
        {activeMode === "manual" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify(manualCode);
            }}
            className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4"
          >
            <div>
              <label className="text-xs font-medium text-zinc-400">Enter Ticket / Badge Code</label>
              <div className="relative mt-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  placeholder="e.g. TCK-882910"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-emerald-500 uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal"
                />
                <Search className="w-4 h-4 text-zinc-500 absolute right-3 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !manualCode.trim()}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 transition"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Verify Ticket</span>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Fullscreen Result Modal */}
      <StatusModal
        status={verificationStatus}
        attendee={scannedAttendee}
        message={statusMessage}
        onClose={() => {
          setVerificationStatus(null);
          setScannedAttendee(null);
          setManualCode("");
        }}
      />
    </div>
  );
}