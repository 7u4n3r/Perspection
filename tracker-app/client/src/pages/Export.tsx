/**
 * Export — Download records for reporting or legal use
 * - JSON and CSV formats
 * - Filter what to export
 * - Clear download action
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Download, FileJson, FileText, CheckCircle } from "lucide-react";
import { useTracker } from "@/contexts/TrackerContext";
import { toast } from "sonner";

export default function Export() {
  const [, navigate] = useLocation();
  const { entries, exportEntries } = useTracker();
  const [format, setFormat] = useState<"json" | "csv">("json");

  const handleExport = () => {
    if (entries.length === 0) {
      toast.error("No entries to export");
      return;
    }

    const content = exportEntries(format);
    const mimeType = format === "json" ? "application/json" : "text/csv";
    const extension = format;
    const filename = `perspection_export_${new Date().toISOString().slice(0, 10)}.${extension}`;

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${entries.length} entries as ${format.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="touch-target rounded-lg hover:bg-accent"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wide">
            Export Records
          </h1>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6">
        {/* Summary */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="font-mono text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Records Available
          </div>
          <div className="font-mono text-2xl text-foreground tabular-nums">
            {entries.length}
          </div>
          <div className="font-mono text-[11px] text-muted-foreground/60 mt-1">
            All entries will be exported (photos excluded from file export)
          </div>
        </div>

        {/* Format selection */}
        <div>
          <label className="font-mono text-xs text-muted-foreground uppercase tracking-wide mb-3 block">
            Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormat("json")}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
                format === "json"
                  ? "border-primary bg-primary/10 ring-2 ring-primary"
                  : "border-border bg-card"
              }`}
            >
              <FileJson
                className={`w-8 h-8 ${
                  format === "json" ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span className="font-mono text-xs font-semibold text-foreground">
                JSON
              </span>
              <span className="font-mono text-[10px] text-muted-foreground text-center">
                Structured data for systems
              </span>
            </button>
            <button
              onClick={() => setFormat("csv")}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
                format === "csv"
                  ? "border-primary bg-primary/10 ring-2 ring-primary"
                  : "border-border bg-card"
              }`}
            >
              <FileText
                className={`w-8 h-8 ${
                  format === "csv" ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span className="font-mono text-xs font-semibold text-foreground">
                CSV
              </span>
              <span className="font-mono text-[10px] text-muted-foreground text-center">
                Spreadsheet compatible
              </span>
            </button>
          </div>
        </div>

        {/* Export info */}
        <div className="bg-card border border-border rounded-lg p-4 space-y-2">
          <div className="font-mono text-xs text-muted-foreground uppercase tracking-wide">
            Included Fields
          </div>
          <div className="grid grid-cols-2 gap-1">
            {[
              "ID",
              "Timestamp",
              "Description",
              "Category",
              "Severity",
              "Tags",
              "Location",
              "Notes",
              "Photo Count",
            ].map((field) => (
              <div key={field} className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-severity-low" />
                <span className="font-mono text-[11px] text-foreground/80">
                  {field}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Export button */}
        <button
          onClick={handleExport}
          disabled={entries.length === 0}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-mono font-bold text-sm py-4 rounded-lg active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          EXPORT {format.toUpperCase()}
        </button>

        {/* Legal note */}
        <div className="bg-accent/50 border border-border rounded-lg p-3">
          <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
            Exported records include timestamps generated at time of entry. 
            Records are stored locally on this device. Ensure backups are maintained 
            independently. Photo attachments are not included in file exports 
            due to size constraints.
          </p>
        </div>
      </main>
    </div>
  );
}
