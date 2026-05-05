/**
 * ExportPage — Export records for reporting or legal use
 * Design: Field Instrument
 * - Clear format options
 * - Download triggers immediately
 * - Shows entry count and date range
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, FileJson, FileSpreadsheet, Download } from "lucide-react";
import { exportEntries, getAllEntries, type TrackerEntry } from "@/lib/db";
import { toast } from "sonner";

export default function ExportPage() {
  const [, navigate] = useLocation();
  const [entries, setEntries] = useState<TrackerEntry[]>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getAllEntries().then(setEntries);
  }, []);

  async function handleExport(format: "json" | "csv") {
    if (entries.length === 0) {
      toast.error("No entries to export");
      return;
    }
    setExporting(true);
    try {
      const data = await exportEntries(format);
      const blob = new Blob([data], {
        type: format === "json" ? "application/json" : "text/csv",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const dateStr = new Date().toISOString().split("T")[0];
      a.download = `adsmore-tracker-${dateStr}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${entries.length} entries as ${format.toUpperCase()}`);
    } catch (e) {
      console.error("Export failed:", e);
      toast.error("Export failed");
    }
    setExporting(false);
  }

  const dateRange = entries.length > 0
    ? {
        oldest: new Date(entries[entries.length - 1].timestamp).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }),
        newest: new Date(entries[0].timestamp).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }),
      }
    : null;

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="touch-target rounded-lg hover:bg-accent transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-mono text-sm font-semibold tracking-tight text-foreground uppercase">
            Export Records
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Summary */}
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="font-mono text-xs text-muted-foreground uppercase tracking-wide mb-2">
            Records Summary
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total entries</span>
              <span className="font-mono text-sm text-foreground font-semibold">{entries.length}</span>
            </div>
            {dateRange && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Oldest</span>
                  <span className="font-mono text-xs text-foreground">{dateRange.oldest}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Newest</span>
                  <span className="font-mono text-xs text-foreground">{dateRange.newest}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Export options */}
        <div className="space-y-3">
          <div className="font-mono text-xs text-muted-foreground uppercase tracking-wide">
            Export Format
          </div>

          <button
            onClick={() => handleExport("json")}
            disabled={exporting || entries.length === 0}
            className="w-full flex items-center gap-4 bg-card border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors disabled:opacity-50"
          >
            <div className="w-12 h-12 rounded-lg bg-severity-info/15 flex items-center justify-center flex-shrink-0">
              <FileJson className="w-6 h-6 text-severity-info" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-semibold text-foreground">JSON</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Structured data format. Best for backup and programmatic use.
              </div>
            </div>
            <Download className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </button>

          <button
            onClick={() => handleExport("csv")}
            disabled={exporting || entries.length === 0}
            className="w-full flex items-center gap-4 bg-card border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors disabled:opacity-50"
          >
            <div className="w-12 h-12 rounded-lg bg-severity-low/15 flex items-center justify-center flex-shrink-0">
              <FileSpreadsheet className="w-6 h-6 text-severity-low" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-semibold text-foreground">CSV</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Spreadsheet format. Best for reporting and legal documentation.
              </div>
            </div>
            <Download className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </button>
        </div>

        {/* Note */}
        <div className="bg-severity-high/5 border border-severity-high/20 rounded-lg p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-severity-high">Note:</span> Photos are not included in exports due to file size. They remain stored securely on this device in the app's local database.
          </p>
        </div>
      </main>
    </div>
  );
}
