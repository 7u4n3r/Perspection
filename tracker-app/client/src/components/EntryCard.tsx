/**
 * EntryCard — Compact timeline entry with severity strip
 * - Left color strip indicates severity
 * - Monospace timestamp
 * - Category badge
 * - Photo indicator
 */
import { Camera, ChevronRight, MapPin } from "lucide-react";
import type { TrackerEntry } from "@/contexts/TrackerContext";

interface EntryCardProps {
  entry: TrackerEntry;
  onClick: () => void;
}

function formatTimestamp(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return { date, time };
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case "critical":
      return "severity-critical";
    case "high":
      return "severity-high";
    case "medium":
      return "severity-medium";
    case "low":
      return "severity-low";
    case "info":
      return "severity-info";
    default:
      return "severity-info";
  }
}

export default function EntryCard({ entry, onClick }: EntryCardProps) {
  const { date, time } = formatTimestamp(entry.timestamp);

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 relative hover:bg-accent/50 active:bg-accent transition-colors"
    >
      {/* Severity strip */}
      <div className={`severity-strip ${getSeverityColor(entry.severity)}`} />

      <div className="pl-3 flex items-start gap-3">
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Timestamp + Category */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
              {time}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground/60">
              {date}
            </span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground uppercase">
              {entry.category}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-foreground line-clamp-2 leading-snug">
            {entry.description}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-1.5">
            {entry.photos.length > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Camera className="w-3 h-3" />
                {entry.photos.length}
              </span>
            )}
            {entry.location && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="w-3 h-3" />
              </span>
            )}
            {entry.tags.length > 0 && (
              <span className="text-[11px] text-muted-foreground font-mono">
                {entry.tags.slice(0, 3).join(" · ")}
              </span>
            )}
          </div>
        </div>

        {/* Chevron */}
        <ChevronRight className="w-4 h-4 text-muted-foreground/40 mt-1 shrink-0" />
      </div>
    </button>
  );
}
