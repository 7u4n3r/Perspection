/**
 * EntryDetail — View/edit a single entry
 * Design: Field Instrument
 * - Full entry display with all metadata
 * - Photo gallery
 * - Delete with confirmation
 */
import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Trash2, MapPin, Clock, Tag, AlertTriangle } from "lucide-react";
import { getEntry, deleteEntry, getPhotosForEntry, type TrackerEntry, type PhotoRecord, type Category, type Severity } from "@/lib/db";
import { toast } from "sonner";

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: "text-severity-critical",
  high: "text-severity-high",
  medium: "text-severity-medium",
  low: "text-severity-low",
  info: "text-severity-info",
};

const SEVERITY_BG: Record<Severity, string> = {
  critical: "bg-severity-critical/15",
  high: "bg-severity-high/15",
  medium: "bg-severity-medium/15",
  low: "bg-severity-low/15",
  info: "bg-severity-info/15",
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

export default function EntryDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [entry, setEntry] = useState<TrackerEntry | null>(null);
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadEntry(params.id);
    }
  }, [params.id]);

  async function loadEntry(id: string) {
    const e = await getEntry(id);
    if (e) {
      setEntry(e);
      const p = await getPhotosForEntry(id);
      setPhotos(p);
    }
  }

  async function handleDelete() {
    if (!entry) return;
    await deleteEntry(entry.id);
    toast.success("Entry deleted");
    navigate("/");
  }

  if (!entry) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="w-2 h-2 rounded-full bg-severity-high animate-pulse" />
      </div>
    );
  }

  const timestamp = new Date(entry.timestamp);

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="touch-target rounded-lg hover:bg-accent transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="font-mono text-sm font-semibold tracking-tight text-foreground uppercase">
              Entry Detail
            </h1>
          </div>
          <button
            onClick={() => setConfirmDelete(true)}
            className="touch-target rounded-lg hover:bg-destructive/10 transition-colors"
            aria-label="Delete"
          >
            <Trash2 className="w-5 h-5 text-destructive" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-8 space-y-5">
        {/* Severity + Category badge */}
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-md font-mono text-xs uppercase font-semibold ${SEVERITY_COLORS[entry.severity]} ${SEVERITY_BG[entry.severity]}`}>
            {entry.severity}
          </span>
          <span className="px-3 py-1.5 rounded-md font-mono text-xs bg-secondary text-muted-foreground">
            {CATEGORY_LABELS[entry.category]}
          </span>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="font-mono text-xs">
            {timestamp.toLocaleDateString([], { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
            {" "}
            {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
          </span>
        </div>

        {/* Description */}
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
            {entry.description}
          </p>
        </div>

        {/* Location */}
        {entry.location && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="font-mono text-xs">{entry.location}</span>
          </div>
        )}

        {/* Notes */}
        {entry.notes && (
          <div>
            <label className="font-mono text-xs text-muted-foreground uppercase tracking-wide block mb-2">
              Notes
            </label>
            <div className="bg-card rounded-lg p-4 border border-border">
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                {entry.notes}
              </p>
            </div>
          </div>
        )}

        {/* Photos */}
        {photos.length > 0 && (
          <div>
            <label className="font-mono text-xs text-muted-foreground uppercase tracking-wide block mb-2">
              Photos ({photos.length})
            </label>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo) => {
                const url = photo.thumbnail || URL.createObjectURL(photo.data);
                return (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo.id)}
                    className="aspect-square rounded-lg overflow-hidden bg-secondary"
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Entry ID */}
        <div className="pt-4 border-t border-border">
          <span className="font-mono text-xs text-muted-foreground/50">
            ID: {entry.id}
          </span>
        </div>
      </main>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm p-4 safe-bottom">
          <div className="w-full max-w-sm bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h2 className="font-mono text-sm font-semibold text-foreground">Delete Entry?</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              This will permanently delete this entry and all attached photos. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-3 rounded-lg bg-secondary text-foreground font-mono text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 rounded-lg bg-destructive text-destructive-foreground font-mono text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <img
            src={URL.createObjectURL(photos.find((p) => p.id === selectedPhoto)!.data)}
            alt=""
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
