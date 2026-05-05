/**
 * Home — Main timeline view with quick-entry input
 * Design: Field Instrument / Industrial Utility
 * - Dark background, high-contrast signal colors
 * - Bottom-anchored input in thumb zone
 * - Severity color strips on entries
 * - Monospace timestamps
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { Plus, Search, Download } from "lucide-react";
import { useTracker } from "@/contexts/TrackerContext";
import QuickEntry from "@/components/QuickEntry";
import EntryCard from "@/components/EntryCard";
import FilterBar from "@/components/FilterBar";
import type { FilterOptions } from "@/contexts/TrackerContext";

export default function Home() {
  const [, navigate] = useLocation();
  const { entries, filterEntries } = useTracker();
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({});

  const displayedEntries =
    Object.keys(activeFilters).length > 0
      ? filterEntries(activeFilters)
      : entries;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-severity-low animate-pulse" />
            <h1 className="font-mono text-sm font-semibold tracking-tight text-foreground uppercase">
              Perspection
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

        {/* Entry count */}
        <div className="mt-1 font-mono text-xs text-muted-foreground">
          {displayedEntries.length} record{displayedEntries.length !== 1 ? "s" : ""}
          {Object.keys(activeFilters).length > 0 && (
            <span className="text-severity-medium ml-2">• filtered</span>
          )}
        </div>
      </header>

      {/* Filter Bar */}
      <FilterBar filters={activeFilters} onFilterChange={setActiveFilters} />

      {/* Timeline */}
      <main className="flex-1 overflow-y-auto pb-24">
        {displayedEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
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
            {displayedEntries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onClick={() => navigate(`/entry/${entry.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Bottom Action Bar — Thumb Zone */}
      <div className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
        <div className="bg-background/95 backdrop-blur-sm border-t border-border px-4 py-3">
          <button
            onClick={() => setShowQuickEntry(true)}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-mono font-semibold text-sm py-4 rounded-lg active:scale-[0.98] transition-transform"
          >
            <Plus className="w-5 h-5" />
            LOG EVENT
          </button>
        </div>
      </div>

      {/* Quick Entry Sheet */}
      {showQuickEntry && (
        <QuickEntry onClose={() => setShowQuickEntry(false)} />
      )}
    </div>
  );
}
