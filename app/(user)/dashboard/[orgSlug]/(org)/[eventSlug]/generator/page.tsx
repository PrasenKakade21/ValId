"use client";

import React, { useRef, useState } from "react";
import useSWR from "swr";

import CardCanvas from "../components/CardCanvas";
import SingleForm from "../components/SingleForm";
import BulkImporter from "../components/BulkImporter";

import {
  exportCardToPng,
  exportBatchToZip,
  exportBatchToPdf,
} from "@/lib/exporter";

import { fetcher } from "@/lib/fetcher";

import {
  Download,
  FileArchive,
  FileText,
  UserPlus,
  FileSpreadsheet,
  Loader2,
  Save,
  RefreshCw,
} from "lucide-react";

import { saveAs } from "file-saver";
import { AttendeeInput,AttendeeRecord } from "@/types/attendee";
import { useEvent } from "@/components/EventProvider";

type AttendeesResponse = {
  attendees: AttendeeRecord[];
  count?: number;
};


// =========================================================
// Page
// =========================================================

export default function GeneratorPage() {
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");
  const event = useEvent()
 const eventId = event.id
  // ---------------------------------------------------------
  // Single card
  // ---------------------------------------------------------

const [singleAttendee, setSingleAttendee] =
  useState<AttendeeInput>({
    ticketCode: "TCK-882910",
    fullName: "Alex Mercer",
    role: "Speaker",
    company: "Vercel Labs",
    email: "alex@vercel.com",
  });

  // ---------------------------------------------------------
  // Bulk processing
  // ---------------------------------------------------------

const [bulkList, setBulkList] = useState<AttendeeInput[]>([]);

  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [saveStatus, setSaveStatus] = useState<string | null>(
    null
  );

  const [exportProgress, setExportProgress] = useState({
    current: 0,
    total: 0,
  });

  // ---------------------------------------------------------
  // Refs
  // ---------------------------------------------------------

  const singleCardRef = useRef<HTMLDivElement>(null);

  const batchRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ---------------------------------------------------------
  // SWR
  // ---------------------------------------------------------

  const attendeesUrl = `/api/events/${eventId}/attendees`;

  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<AttendeesResponse>(
    eventId ? attendeesUrl : null,
    fetcher,
    {
          refreshInterval: 180000,
      revalidateOnFocus: false,
    }
  );

  const savedAttendees = data?.attendees ?? [];

  // ---------------------------------------------------------
  // Save attendees
  // ---------------------------------------------------------

  const saveAttendeesToDb = async (
    attendees: AttendeeInput[]
  ) => {


    setIsSaving(true);
    setSaveStatus(null);

    try {
      const res = await fetch(attendeesUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attendees,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(
          result.error || "Failed to save attendees"
        );
      }

      setSaveStatus(
        `Successfully saved ${
          result.count ?? attendees.length
        } badge(s) to the database.`
      );

      // Refresh SWR cache
      await mutate();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to save attendees";

      setSaveStatus(`Database Error: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ---------------------------------------------------------
  // Single export
  // ---------------------------------------------------------

  const handleSingleExport = async () => {
    if (!singleCardRef.current) return;

    await saveAttendeesToDb([singleAttendee]);

    const blob = await exportCardToPng(
      singleCardRef.current,
      singleAttendee.ticketCode
    );

    saveAs(blob, `${singleAttendee.ticketCode}.png`);
  };

  // ---------------------------------------------------------
  // Bulk data mapped
  // ---------------------------------------------------------

  const handleBulkDataMapped = async (
    mappedData: AttendeeInput[]
  ) => {
    setBulkList(mappedData);

    await saveAttendeesToDb(mappedData);
  };

  // ---------------------------------------------------------
  // ZIP export
  // ---------------------------------------------------------

  const handleBatchZipExport = async () => {
    const validRefs = batchRefs.current.filter(
      (ref): ref is HTMLDivElement => ref !== null
    );

    if (validRefs.length === 0) return;

    setIsExporting(true);

    setExportProgress({
      current: 0,
      total: validRefs.length,
    });

    const filenames = bulkList.map(
      (item) =>
        item.ticketCode ||
        item.fullName.replace(/\s+/g, "_")
    );

    try {
      await exportBatchToZip(
        validRefs,
        filenames,
        (current, total) => {
          setExportProgress({
            current,
            total,
          });
        }
      );
    } finally {
      setIsExporting(false);
    }
  };

  // ---------------------------------------------------------
  // PDF export
  // ---------------------------------------------------------

  const handleBatchPdfExport = async () => {
    const validRefs = batchRefs.current.filter(
      (ref): ref is HTMLDivElement => ref !== null
    );

    if (validRefs.length === 0) return;

    setIsExporting(true);

    setExportProgress({
      current: 0,
      total: validRefs.length,
    });

    try {
      await exportBatchToPdf(
        validRefs,
        (current, total) => {
          setExportProgress({
            current,
            total,
          });
        }
      );
    } finally {
      setIsExporting(false);
    }
  };

  // ---------------------------------------------------------
  // Loading
  // ---------------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
        <span className="ml-2 text-xs text-zinc-400">
          Loading attendees...
        </span>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Error
  // ---------------------------------------------------------

  if (error) {
    return (
      <div className="p-4 bg-zinc-900 border border-red-500/30 rounded-xl">
        <p className="text-xs text-red-400">
          Failed to load attendees.
        </p>

        <button
          onClick={() => mutate()}
          className="mt-3 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs"
        >
          Retry
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Event ID Studio
          </h1>

          <p className="text-xs text-zinc-400 mt-1">
            Generate, save, and export custom event badges.
          </p>
        </div>

        {/* Mode Switcher */}

        <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl self-start">
          <button
            onClick={() => setActiveTab("single")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "single"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Single Entry</span>
          </button>

          <button
            onClick={() => setActiveTab("bulk")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "bulk"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Bulk CSV/Excel</span>
          </button>
        </div>
      </div>

      {/* Save status */}

      {saveStatus && (
        <div className="p-3 bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 rounded-xl flex items-center space-x-2">
          <Save className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* =====================================================
          SINGLE MODE
          ===================================================== */}

      {activeTab === "single" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <SingleForm
              data={singleAttendee}
              onChange={setSingleAttendee}
            />

            <button
              onClick={() =>
                saveAttendeesToDb([singleAttendee])
              }
              disabled={isSaving}
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4 text-emerald-400" />
              )}

              <span>Save Record to Supabase</span>
            </button>
          </div>

          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8 space-y-6">
            <CardCanvas
              ref={singleCardRef}
              attendee={singleAttendee}
            />

            <button
              onClick={handleSingleExport}
              disabled={isSaving}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs rounded-xl flex items-center space-x-2 transition disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}

              <span>Save & Download PNG</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          BULK MODE
          ===================================================== */}

      {activeTab === "bulk" && (
        <div className="space-y-8">
          <BulkImporter
            onDataMapped={handleBulkDataMapped}
          />

          {bulkList.length > 0 && (
            <div className="space-y-6">
              {/* Bulk header */}

              <div className="flex flex-col sm:flex-row justify-between items-center bg-zinc-900 border border-zinc-800 p-4 rounded-2xl gap-4">
                <div>
                  <h3 className="text-sm font-semibold">
                    Loaded & Saved {bulkList.length} ID Badges
                  </h3>

                  <p className="text-xs text-zinc-400">
                    Synced with Supabase and ready to export.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    disabled={isExporting}
                    onClick={handleBatchZipExport}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 border border-zinc-700 transition"
                  >
                    <FileArchive className="w-4 h-4 text-emerald-400" />
                    <span>Export ZIP (PNGs)</span>
                  </button>

                  <button
                    disabled={isExporting}
                    onClick={handleBatchPdfExport}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-xs font-semibold rounded-xl flex items-center space-x-2 transition"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Export Print PDF</span>
                  </button>
                </div>
              </div>

              {/* Export progress */}

              {isExporting && (
                <div className="p-4 bg-zinc-900 border border-emerald-500/30 rounded-xl flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />

                  <span className="text-xs text-zinc-300">
                    Generating badges:{" "}
                    {exportProgress.current} /{" "}
                    {exportProgress.total}
                  </span>
                </div>
              )}

              {/* Badge preview */}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {bulkList.map((attendee, idx) => (
                  <div
                    key={idx}
                    className="scale-90 origin-top flex justify-center"
                  >
                    <CardCanvas
                      ref={(el) => {
                        batchRefs.current[idx] = el;
                      }}
                      attendee={attendee}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          SAVED ATTENDEES
          ===================================================== */}

      {savedAttendees.length > 0 && (
        <div className="border-t border-zinc-800 pt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold">
                Saved Attendees
              </h2>

              <p className="text-xs text-zinc-400 mt-1">
                {savedAttendees.length} attendee
                {savedAttendees.length === 1 ? "" : "s"} in
                this event.
              </p>
            </div>

            <button
              onClick={() => mutate()}
              className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="divide-y divide-zinc-800">
              {savedAttendees.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {record.full_name}
                    </p>

                    <p className="text-xs text-zinc-500">
                      {record.ticket_code} · {record.role}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-zinc-400">
                      {record.email || "No email"}
                    </p>

                    <p
                      className={`text-[10px] mt-1 ${
                        record.checked_in
                          ? "text-emerald-400"
                          : "text-zinc-500"
                      }`}
                    >
                      {record.checked_in
                        ? "Checked in"
                        : "Not checked in"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}