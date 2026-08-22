"use client";

import React, { useState, useRef } from "react";
import CardCanvas, { AttendeeData } from "../components/CardCanvas";
import SingleForm from "../components/SingleForm";
import BulkImporter from "../components/BulkImporter";
import { exportCardToPng, exportBatchToZip, exportBatchToPdf } from "@/lib/exporter";
import { Download, FileArchive, FileText, UserPlus, FileSpreadsheet, Loader2, Save } from "lucide-react";
import { saveAs } from "file-saver";

export default function GeneratorPage() {
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");

  // Single card state
  const [singleAttendee, setSingleAttendee] = useState<AttendeeData>({
    fullName: "Alex Mercer",
    role: "Speaker",
    company: "Vercel Labs",
    email: "alex@vercel.com",
    ticketCode: "TCK-882910",
  });

  // Bulk processing state
  const [bulkList, setBulkList] = useState<AttendeeData[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 });

  // References
  const singleCardRef = useRef<HTMLDivElement>(null);
  const batchRefs = useRef<(HTMLDivElement | null)[]>([]);

  // API Helper
  const saveAttendeesToDb = async (attendees: AttendeeData[]) => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const res = await fetch("/api/ids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendees }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save to database");

      setSaveStatus(`Successfully saved ${data.count || attendees.length} badge(s) to database.`);
    } catch (err: any) {
      setSaveStatus(`Database Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handlers
  const handleSingleExport = async () => {
    if (!singleCardRef.current) return;
    await saveAttendeesToDb([singleAttendee]);
    const blob = await exportCardToPng(singleCardRef.current, singleAttendee.ticketCode);
    saveAs(blob, `${singleAttendee.ticketCode}.png`);
  };

  const handleBulkDataMapped = async (mappedData: AttendeeData[]) => {
    setBulkList(mappedData);
    await saveAttendeesToDb(mappedData);
  };

  const handleBatchZipExport = async () => {
    const validRefs = batchRefs.current.filter((ref): ref is HTMLDivElement => ref !== null);
    if (validRefs.length === 0) return;

    setIsExporting(true);
    const filenames = bulkList.map((item) => item.ticketCode || item.fullName.replace(/\s+/g, "_"));

    await exportBatchToZip(validRefs, filenames, (current, total) => {
      setExportProgress({ current, total });
    });

    setIsExporting(false);
  };

  const handleBatchPdfExport = async () => {
    const validRefs = batchRefs.current.filter((ref): ref is HTMLDivElement => ref !== null);
    if (validRefs.length === 0) return;

    setIsExporting(true);
    await exportBatchToPdf(validRefs, (current, total) => {
      setExportProgress({ current, total });
    });

    setIsExporting(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Event ID Studio</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Generate, save to database, and export custom verified event badges.
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

      {/* Database Save Notification */}
      {saveStatus && (
        <div className="p-3 bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 rounded-xl flex items-center space-x-2">
          <Save className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Single Mode */}
      {activeTab === "single" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <SingleForm data={singleAttendee} onChange={setSingleAttendee} />
            <button
              onClick={() => saveAttendeesToDb([singleAttendee])}
              disabled={isSaving}
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 transition"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-emerald-400" />}
              <span>Save Record to Supabase</span>
            </button>
          </div>

          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8 space-y-6">
            <CardCanvas ref={singleCardRef} attendee={singleAttendee} />
            <button
              onClick={handleSingleExport}
              disabled={isSaving}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs rounded-xl flex items-center space-x-2 transition"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>Save & Download PNG</span>
            </button>
          </div>
        </div>
      )}

      {/* Bulk Mode */}
      {activeTab === "bulk" && (
        <div className="space-y-8">
          <BulkImporter onDataMapped={handleBulkDataMapped} />

          {bulkList.length > 0 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-center bg-zinc-900 border border-zinc-800 p-4 rounded-2xl gap-4">
                <div>
                  <h3 className="text-sm font-semibold">Loaded & Saved {bulkList.length} ID Badges</h3>
                  <p className="text-xs text-zinc-400">Synced with Supabase and ready to export.</p>
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

              {isExporting && (
                <div className="p-4 bg-zinc-900 border border-emerald-500/30 rounded-xl flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                  <span className="text-xs text-zinc-300">
                    Generating badges: {exportProgress.current} / {exportProgress.total}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {bulkList.map((attendee, idx) => (
                  <div key={idx} className="scale-90 origin-top flex justify-center">
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
    </div>
  );
}