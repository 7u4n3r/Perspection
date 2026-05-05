/**
 * Home — Main timeline view
 * Design: Field Instrument / Industrial Utility
 * - Dark background, high-contrast signal colors
 * - Bottom-anchored FAB in thumb zone
 * - Severity color strips on entries
 * - Monospace timestamps
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Plus, Search, Download, CircleDot } from "lucide-react";
import { getAllEntries, type TrackerEntry, type FilterOptions, type Category, type Severity, filterEntries } from "@/lib/db";

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: "bg-severity-critical",
  high: "bg-severity-high",
  medium: "bg-severity-medium",
  low: "bg-severity-low",
  info: "bg-severity-info",
};

const SEVERITY_STRIP: Record<Severity, string> = {
  critical: "severity-strip-critical",
  high: "severity-strip-high",
  medium: "severity-strip-medium",
  low: "severity-strip-low",
  info: "severity-strip-info",
};

const CATEGORY_LABELS: Record<Category, string> = {
  noise: "Noise",
  traffic: "Traffic",
  property_damage: "Property Damage",
  environmental: "Environmental",
  health: "Health",
  vibration: "Vibration",
  light: "Light",
  other: "Other",
};

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  if (isToday) return time;
  const date = d.toLocaleDateString([], { month: "short", day: "numeric" });
  return `${date} ${time}`;
}

export default function Home() {
  const [, navigate] = useLocation();
  const [entries, setEntries] = useState<TrackerEntry[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeSeverity, setActiveSeverity] = useState<Severity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, [activeCategory, activeSeverity]);

  async function loadEntries() {
    setLoading(true);
    try {
      const filters: FilterOptions = {};
      if (activeCategory) filters.category = activeCategory;
      if (activeSeverity) filters.severity = activeSeverity;
      const result = (activeCategory || activeSeverity)
        ? await filterEntries(filters)
        : await getAllEntries();
      setEntries(result);
    } catch (e) {
      console.error("Failed to load entries:", e);
    }
    setLoading(false);
  }

  const categories: Category[] = ["noise", "traffic", "property_damage", "environmental", "health", "vibration", "light", "other"];
  const severities: Severity[] = ["critical", "high", "medium", "low", "info"];

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CircleDot className="w-4 h-4 text-severity-high" />
            <h1 className="font-mono text-sm font-semibold tracking-tight text-foreground uppercase">
              Adsmore Tracker
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate("/search")}
              className="touch-target rounded-lg hover:bg-accent transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              onClick={() => navigate("/export")}
              className="touch-target rounded-lg hover:bg-accent transition-colors"
              aria-label="Export"
            >
              <Download className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="mt-1 font-mono text-xs text-muted-foreground">
          {entries.length} record{entries.length !== 1 ? "s" : ""}
          {(activeCategory || activeSeverity) && (
            <span className="text-severity-medium ml-2">• filtered</span>
          )}
        </div>
      </header>

      {/* Filter chips */}
      <div className="px-4 py-2 border-b border-border overflow-x-auto scrollbar-none">
        <div className="flex gap-2 pb-1">
          {/* Severity filters */}
          {severities.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSeverity(activeSeverity === s ? null : s)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-md font-mono text-xs uppercase transition-colors ${
                activeSeverity === s
                  ? `${SEVERITY_COLORS[s]} text-background font-semibold`
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-1.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(activeCategory === c ? null : c)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-md font-mono text-xs transition-colors ${
                activeCategory === c
                  ? "bg-foreground text-background font-semibold"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <main className="flex-1 overflow-y-auto pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-2 h-2 rounded-full bg-severity-high animate-pulse" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm font-mono">
              No entries recorded
            </p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              Tap + to log your first event
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {entries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => navigate(`/entry/${entry.id}`)}
                className={`w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors ${SEVERITY_STRIP[entry.severity]}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground line-clamp-2 leading-snug">
                      {entry.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-mono text-xs text-muted-foreground">
                        {CATEGORY_LABELS[entry.category]}
                      </span>
                      {entry.photoIds.length > 0 && (
                        <span className="font-mono text-xs text-muted-foreground">
                          📷 {entry.photoIds.length}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Bottom FAB — Thumb Zone */}
      <div className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
        <div className="bg-background/95 backdrop-blur-sm border-t border-border px-4 py-3">
          <button
            onClick={() => navigate("/new")}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-mono font-semibold text-sm py-4 rounded-lg active:scale-[0.98] transition-transform"
          >
            <Plus className="w-5 h-5" />
            LOG EVENT
          </button>
        </div>
      </div>
    </div>
  );
}
