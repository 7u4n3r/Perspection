import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { nanoid } from "nanoid";

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type Category =
  | "property"
  | "environmental"
  | "legal"
  | "safety"
  | "incident"
  | "compliance"
  | "other";

export interface TrackerEntry {
  id: string;
  timestamp: string;
  description: string;
  category: Category;
  severity: Severity;
  tags: string[];
  photos: string[]; // base64 data URLs
  location?: string;
  notes?: string;
}

interface TrackerContextType {
  entries: TrackerEntry[];
  addEntry: (entry: Omit<TrackerEntry, "id" | "timestamp">) => TrackerEntry;
  updateEntry: (id: string, updates: Partial<TrackerEntry>) => void;
  deleteEntry: (id: string) => void;
  getEntry: (id: string) => TrackerEntry | undefined;
  searchEntries: (query: string) => TrackerEntry[];
  filterEntries: (filters: FilterOptions) => TrackerEntry[];
  exportEntries: (format: "json" | "csv", entryIds?: string[]) => string;
}

export interface FilterOptions {
  category?: Category;
  severity?: Severity;
  startDate?: string;
  endDate?: string;
  tags?: string[];
}

const STORAGE_KEY = "perspection_entries";

function loadEntries(): TrackerEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load entries:", e);
  }
  return [];
}

function saveEntries(entries: TrackerEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error("Failed to save entries:", e);
  }
}

const TrackerContext = createContext<TrackerContextType | null>(null);

export function TrackerProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<TrackerEntry[]>(loadEntries);

  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  const addEntry = useCallback(
    (entry: Omit<TrackerEntry, "id" | "timestamp">): TrackerEntry => {
      const newEntry: TrackerEntry = {
        ...entry,
        id: nanoid(10),
        timestamp: new Date().toISOString(),
      };
      setEntries((prev) => [newEntry, ...prev]);
      return newEntry;
    },
    []
  );

  const updateEntry = useCallback((id: string, updates: Partial<TrackerEntry>) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const getEntry = useCallback(
    (id: string) => entries.find((e) => e.id === id),
    [entries]
  );

  const searchEntries = useCallback(
    (query: string): TrackerEntry[] => {
      const q = query.toLowerCase().trim();
      if (!q) return entries;
      return entries.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q)) ||
          (e.notes && e.notes.toLowerCase().includes(q)) ||
          (e.location && e.location.toLowerCase().includes(q))
      );
    },
    [entries]
  );

  const filterEntries = useCallback(
    (filters: FilterOptions): TrackerEntry[] => {
      return entries.filter((e) => {
        if (filters.category && e.category !== filters.category) return false;
        if (filters.severity && e.severity !== filters.severity) return false;
        if (filters.startDate && e.timestamp < filters.startDate) return false;
        if (filters.endDate && e.timestamp > filters.endDate) return false;
        if (
          filters.tags &&
          filters.tags.length > 0 &&
          !filters.tags.some((t) => e.tags.includes(t))
        )
          return false;
        return true;
      });
    },
    [entries]
  );

  const exportEntries = useCallback(
    (format: "json" | "csv", entryIds?: string[]): string => {
      const toExport = entryIds
        ? entries.filter((e) => entryIds.includes(e.id))
        : entries;

      if (format === "json") {
        return JSON.stringify(
          toExport.map(({ photos, ...rest }) => ({
            ...rest,
            photoCount: photos.length,
          })),
          null,
          2
        );
      }

      // CSV format
      const headers = [
        "ID",
        "Timestamp",
        "Description",
        "Category",
        "Severity",
        "Tags",
        "Location",
        "Notes",
        "Photo Count",
      ];
      const rows = toExport.map((e) => [
        e.id,
        e.timestamp,
        `"${e.description.replace(/"/g, '""')}"`,
        e.category,
        e.severity,
        e.tags.join(";"),
        e.location || "",
        `"${(e.notes || "").replace(/"/g, '""')}"`,
        e.photos.length.toString(),
      ]);
      return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    },
    [entries]
  );

  return (
    <TrackerContext.Provider
      value={{
        entries,
        addEntry,
        updateEntry,
        deleteEntry,
        getEntry,
        searchEntries,
        filterEntries,
        exportEntries,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
}

export function useTracker() {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error("useTracker must be used within a TrackerProvider");
  }
  return context;
}
