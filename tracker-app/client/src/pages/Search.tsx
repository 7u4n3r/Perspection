/**
 * Search — Full-text search across all entries
 * - Instant results as you type
 * - Highlights matching entries
 * - Quick navigation to detail view
 */
import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Search as SearchIcon, X } from "lucide-react";
import { useTracker } from "@/contexts/TrackerContext";
import EntryCard from "@/components/EntryCard";

export default function Search() {
  const [, navigate] = useLocation();
  const { searchEntries } = useTracker();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const results = query.trim() ? searchEntries(query) : [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with search input */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="touch-target rounded-lg hover:bg-accent shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search entries..."
              className="w-full bg-input border border-border rounded-lg pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
        {query.trim() && (
          <div className="mt-2 font-mono text-xs text-muted-foreground">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </div>
        )}
      </header>

      {/* Results */}
      <main className="flex-1">
        {!query.trim() ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <SearchIcon className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm font-mono">
              Search descriptions, tags, categories
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <p className="text-muted-foreground text-sm font-mono">
              No matches for "{query}"
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {results.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onClick={() => navigate(`/entry/${entry.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
