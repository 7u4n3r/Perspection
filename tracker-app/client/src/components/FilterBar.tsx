/**
 * FilterBar — Horizontal scrollable filter chips
 * Quick access to category and severity filters
 */
import { X } from "lucide-react";
import type { FilterOptions, Category, Severity } from "@/contexts/TrackerContext";

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

const SEVERITY_OPTIONS: { value: Severity; label: string }[] = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "info", label: "Info" },
];

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "incident", label: "Incident" },
  { value: "property", label: "Property" },
  { value: "environmental", label: "Environ." },
  { value: "legal", label: "Legal" },
  { value: "safety", label: "Safety" },
  { value: "compliance", label: "Compliance" },
  { value: "other", label: "Other" },
];

export default function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const hasFilters = filters.category || filters.severity;

  return (
    <div className="px-4 py-2 border-b border-border overflow-x-auto">
      <div className="flex items-center gap-2">
        {/* Clear all */}
        {hasFilters && (
          <button
            onClick={() => onFilterChange({})}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-destructive/20 text-destructive text-[11px] font-mono font-medium"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}

        {/* Severity filters */}
        {SEVERITY_OPTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() =>
              onFilterChange({
                ...filters,
                severity: filters.severity === s.value ? undefined : s.value,
              })
            }
            className={`shrink-0 px-2.5 py-1.5 rounded-md text-[11px] font-mono font-medium transition-colors ${
              filters.severity === s.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {s.label}
          </button>
        ))}

        <div className="shrink-0 w-px h-4 bg-border" />

        {/* Category filters */}
        {CATEGORY_OPTIONS.map((c) => (
          <button
            key={c.value}
            onClick={() =>
              onFilterChange({
                ...filters,
                category: filters.category === c.value ? undefined : c.value,
              })
            }
            className={`shrink-0 px-2.5 py-1.5 rounded-md text-[11px] font-mono font-medium transition-colors ${
              filters.category === c.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
