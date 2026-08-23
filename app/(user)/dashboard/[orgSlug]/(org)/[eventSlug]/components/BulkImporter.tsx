"use client";

import React, { useState, useCallback } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, Check, AlertCircle, ArrowRight } from "lucide-react";
import type {
  AttendeeInput,
  AttendeeRecord,
} from "@/types/attendee";

interface ParsedData {
  headers: string[];
  rows: Record<string, string>[];
}

interface BulkImporterProps {
  onDataMapped: (mappedAttendees: AttendeeInput[]) => void;
}

const REQUIRED_APP_FIELDS: { key: keyof AttendeeInput; label: string; required: boolean }[] = [
  { key: "fullName", label: "Full Name", required: true },
  { key: "role", label: "Role / Badge Type", required: false },
  { key: "company", label: "Company / Org", required: false },
  { key: "email", label: "Email Address", required: true },
  { key: "ticketCode", label: "Ticket Code / ID", required: false },
];

export default function BulkImporter({ onDataMapped }: BulkImporterProps) {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [fieldMapping, setFieldMapping] = useState<Record<keyof AttendeeInput, string>>({
    fullName: "",
    role: "",
    company: "",
    email: "",
    ticketCode: "",
  });
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-guess column mappings based on header name similarity
  const autoMapHeaders = (headers: string[]) => {
    const initialMapping: Record<keyof AttendeeInput, string> = {
      fullName: "",
      role: "",
      company: "",
      email: "",
      ticketCode: "",
    };

    headers.forEach((header) => {
      const cleanHeader = header.toLowerCase().trim();
      if (cleanHeader.includes("name")) initialMapping.fullName = header;
      else if (cleanHeader.includes("role") || cleanHeader.includes("type") || cleanHeader.includes("category")) initialMapping.role = header;
      else if (cleanHeader.includes("company") || cleanHeader.includes("org")) initialMapping.company = header;
      else if (cleanHeader.includes("email") || cleanHeader.includes("mail")) initialMapping.email = header;
      else if (cleanHeader.includes("code") || cleanHeader.includes("id") || cleanHeader.includes("ticket")) initialMapping.ticketCode = header;
    });

    setFieldMapping(initialMapping);
  };

  const processFile = (file: File) => {
    setError(null);
    const fileExt = file.name.split(".").pop()?.toLowerCase();

    if (fileExt === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.meta.fields && results.data.length > 0) {
            setParsedData({
              headers: results.meta.fields,
              rows: results.data as Record<string, string>[],
            });
            autoMapHeaders(results.meta.fields);
          } else {
            setError("CSV file appears to be empty or malformed.");
          }
        },
        error: (err) => setError(`CSV Parse Error: ${err.message}`),
      });
    } else if (fileExt === "xlsx" || fileExt === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result;
          const workbook = XLSX.read(buffer, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, { header: 1 });

          if (jsonData.length > 1) {
            const headers = (jsonData[0] as unknown as string[]).map((h) => String(h).trim());
            const rows = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet);

            setParsedData({ headers, rows });
            autoMapHeaders(headers);
          } else {
            setError("Excel sheet is empty.");
          }
        } catch (err) {
          setError("Failed to process Excel file.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError("Unsupported file format. Upload .csv, .xlsx, or .xls");
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleMappingChange = (targetField: keyof AttendeeRecord, sourceColumn: string) => {
    setFieldMapping((prev) => ({ ...prev, [targetField]: sourceColumn }));
  };

  const handleConfirmMapping = () => {
    if (!parsedData) return;

    // Validate required mappings
    if (!fieldMapping.fullName || !fieldMapping.email) {
      setError("Full Name and Email mappings are required.");
      return;
    }

    const mappedAttendees: AttendeeInput[] = parsedData.rows.map((row, index) => ({
      fullName: row[fieldMapping.fullName] || "Attendee",
      role: row[fieldMapping.role] || "General",
      company: row[fieldMapping.company] || "",
      email: row[fieldMapping.email] || "",
      ticketCode: row[fieldMapping.ticketCode] || `TCK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    }));

    onDataMapped(mappedAttendees);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-white">
      {/* 1. Drag and Drop Zone */}
      {!parsedData && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 ${
            isDragging
              ? "border-emerald-500 bg-emerald-500/10 scale-[0.99]"
              : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
          }`}
        >
          <div className="p-4 bg-zinc-800 rounded-full border border-zinc-700 text-emerald-400">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Upload Attendee List</h3>
            <p className="text-sm text-zinc-400 mt-1">Drag and drop your CSV or Excel (.xlsx) file here</p>
          </div>
          <label className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs rounded-lg cursor-pointer transition">
            Browse File
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
            />
          </label>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Column Mapping Step */}
      {parsedData && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
            <div className="flex items-center space-x-3">
              <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="font-bold text-base">Map Spreadsheet Columns</h3>
                <p className="text-xs text-zinc-400">Found {parsedData.rows.length} rows</p>
              </div>
            </div>
            <button
              onClick={() => setParsedData(null)}
              className="text-xs text-zinc-400 hover:text-white underline"
            >
              Upload Different File
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REQUIRED_APP_FIELDS.map((field) => (
              <div key={field.key} className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 space-y-2">
                <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                  <span>
                    {field.label} {field.required && <span className="text-red-400">*</span>}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-normal">Card Field</span>
                </label>
                <select
                  value={fieldMapping[field.key]}
                  onChange={(e) => handleMappingChange(field.key, e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 text-white text-xs rounded-lg p-2.5 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Ignore / Not Mapped --</option>
                  {parsedData.headers.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Action Footer */}
          <div className="flex justify-end pt-4 border-t border-zinc-800">
            <button
              onClick={handleConfirmMapping}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs rounded-xl flex items-center space-x-2 transition"
            >
              <span>Process {parsedData.rows.length} IDs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}