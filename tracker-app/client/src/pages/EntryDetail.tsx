/**
 * EntryDetail — Full view of a single entry with edit/delete
 * - Shows all fields including photos
 * - Monospace timestamp header
 * - Edit and delete actions
 */
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Trash2, Edit2, Save, X, Camera, MapPin } from "lucide-react";
import { useTracker, type Severity, type Category } from "@/contexts/TrackerContext";
import { toast } from "sonner";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "incident", label: "Incident" },
  { value: "property", label: "Property" },
  { value: "environmental", label: "Environ." },
  { value: "legal", label: "Legal" },
  { value: "safety", label: "Safety" },
  { value: "compliance", label: "Compliance" },
  { value: "other", label: "Other" },
];

const SEVERITIES: { value: Severity; label: string; color: string }[] = [
  { value: "critical", label: "CRIT", color: "bg-severity-critical" },
  { value: "high", label: "HIGH", color: "bg-severity-high" },
  { value: "medium", label: "MED", color: "bg-severity-medium" },
  { value: "low", label: "LOW", color: "bg-severity-low" },
  { value: "info", label: "INFO", color: "bg-severity-info" },
];

export default function EntryDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { getEntry, updateEntry, deleteEntry } = useTracker();
  const [editing, setEditing] = useState(false);

  const entry = getEntry(params.id || "");

  const [description, setDescription] = useState(entry?.description || "");
  const [category, setCategory] = useState<Category>(entry?.category || "incident");
  const [severity, setSeverity] = useState<Severity>(entry?.severity || "medium");
  const [notes, setNotes] = useState(entry?.notes || "");

  if (!entry) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <p className="font-mono text-sm text-muted-foreground">Entry not found</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 font-mono text-xs text-primary underline"
        >
          Return to timeline
        </button>
      </div>
    );
  }

  const timestamp = new Date(entry.timestamp);

  const handleSave = () => {
    updateEntry(entry.id, { description, category, severity, notes: notes || undefined });
    setEditing(false);
    toast.success("Entry updated");
  };

  const handleDelete = () => {
    if (confirm("Delete this entry permanently?")) {
      deleteEntry(entry.id);
      toast.success("Entry deleted");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="touch-target rounded-lg hover:bg-accent"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-1">
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="touch-target rounded-lg hover:bg-accent"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
                <button
                  onClick={handleSave}
                  className="touch-target rounded-lg hover:bg-accent"
                >
                  <Save className="w-5 h-5 text-severity-low" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="touch-target rounded-lg hover:bg-accent"
                >
                  <Edit2 className="w-5 h-5 text-muted-foreground" />
                </button>
                <button
                  onClick={handleDelete}
                  className="touch-target rounded-lg hover:bg-accent"
                >
                  <Trash2 className="w-5 h-5 text-destructive" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 space-y-5">
        {/* Timestamp block */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="font-mono text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Recorded
          </div>
          <div className="font-mono text-lg text-foreground tabular-nums">
            {timestamp.toLocaleDateString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
            {" — "}
            {timestamp.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })}
          </div>
          <div className="font-mono text-[10px] text-muted-foreground/60 mt-1">
            ID: {entry.id}
          </div>
        </div>

        {/* Severity + Category */}
        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="font-mono text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                Severity
              </label>
              <div className="flex gap-2">
                {SEVERITIES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSeverity(s.value)}
                    className={`flex-1 py-3 rounded-lg font-mono text-xs font-semibold transition-all ${
                      severity === s.value
                        ? `${s.color} text-background ring-2 ring-ring`
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-mono text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                Category
              </label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setCategory(c.value)}
                    className={`px-4 py-2.5 rounded-lg font-mono text-xs font-medium transition-all ${
                      category === c.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1.5 rounded-md font-mono text-xs font-bold uppercase ${
                SEVERITIES.find((s) => s.value === entry.severity)?.color
              } text-background`}
            >
              {entry.severity}
            </span>
            <span className="px-3 py-1.5 rounded-md bg-secondary font-mono text-xs text-secondary-foreground uppercase">
              {entry.category}
            </span>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="font-mono text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
            Description
          </label>
          {editing ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              rows={4}
            />
          ) : (
            <p className="text-foreground text-sm leading-relaxed">
              {entry.description}
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="font-mono text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
            Notes
          </label>
          {editing ? (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              rows={3}
            />
          ) : (
            <p className="text-foreground/80 text-sm leading-relaxed">
              {entry.notes || (
                <span className="text-muted-foreground/50 italic">No notes</span>
              )}
            </p>
          )}
        </div>

        {/* Location */}
        {entry.location && (
          <div>
            <label className="font-mono text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
              Location
            </label>
            <div className="flex items-center gap-2 text-sm text-foreground/80">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono text-xs">{entry.location}</span>
            </div>
          </div>
        )}

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div>
            <label className="font-mono text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-md bg-accent font-mono text-[11px] text-accent-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Photos */}
        {entry.photos.length > 0 && (
          <div>
            <label className="font-mono text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
              Photos ({entry.photos.length})
            </label>
            <div className="grid grid-cols-2 gap-2">
              {entry.photos.map((photo, i) => (
                <img
                  key={i}
                  src={photo}
                  alt={`Evidence ${i + 1}`}
                  className="w-full aspect-square object-cover rounded-lg border border-border"
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
