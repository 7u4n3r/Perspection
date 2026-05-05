/**
 * SearchPage — Full-text search across all entries
 * Design: Field Instrument
 * - Immediate results as you type
 * - Same entry card format as timeline
 */
import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Search } from "lucide-react";
import { searchEntries, type TrackerEntry, type Severity, type Category } from "@/lib/db";

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

export default function SearchPage() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TrackerEntry[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (q.trim().length > 0) {
      const r = await searchEntries(q);
      setResults(r);
      setSearched(true);
    } else {
      setResults([]);
      setSearched(false);
    }
  }, []);

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
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search entries..."
              className="w-full bg-secondary text-foreground rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
          </div>
        </div>
      </header>

      {/* Results */}
      <main className="flex-1 overflow-y-auto">
        {searched && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <p className="text-muted-foreground text-sm font-mono">
              No results found
            </p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              Try different keywords
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {results.map((entry) => (
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

        {!searched && (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <Search className="w-8 h-8 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground/60 text-xs">
              Search by description, category, location, or notes
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
