/**
 * QuickEntry — Bottom sheet for rapid event logging
 * Designed for one-hand, one-thumb operation under pressure
 * - Large touch targets
 * - Minimal required fields (description only)
 * - Optional category/severity/photo
 * - Auto-timestamps on submit
 */
import { useState, useRef, useEffect } from "react";
import { X, Camera, Send, MapPin } from "lucide-react";
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

interface QuickEntryProps {
  onClose: () => void;
}

export default function QuickEntry({ onClose }: QuickEntryProps) {
  const { addEntry } = useTracker();
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("incident");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [photos, setPhotos] = useState<string[]>([]);
  const [tags, setTags] = useState("");
  const [location, setLocation] = useState("");
  const [showExtras, setShowExtras] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus textarea immediately for fast entry
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, []);

  const handleSubmit = () => {
    if (!description.trim()) {
      toast.error("Description required");
      return;
    }

    const entry = addEntry({
      description: description.trim(),
      category,
      severity,
      photos,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      location: location || undefined,
    });

    toast.success("Event logged", {
      description: `${severity.toUpperCase()} • ${category}`,
    });
    onClose();
  };

  const handlePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setPhotos((prev) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation(
            `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`
          );
          toast.success("Location captured");
        },
        () => {
          toast.error("Location unavailable");
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative mt-auto bg-card border-t border-border rounded-t-2xl max-h-[90vh] overflow-y-auto safe-bottom">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3">
          <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wide">
            Log Event
          </h2>
          <button
            onClick={onClose}
            className="touch-target rounded-lg hover:bg-accent"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="px-4 pb-6 space-y-4">
          {/* Description — Primary input */}
          <div>
            <textarea
              ref={textareaRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What happened?"
              className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground text-base placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              rows={3}
            />
          </div>

          {/* Severity — Large touch targets */}
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

          {/* Category — Scrollable chips */}
          <div>
            <label className="font-mono text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
              Category
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`shrink-0 px-4 py-2.5 rounded-lg font-mono text-xs font-medium transition-all ${
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

          {/* Quick actions row */}
          <div className="flex gap-2">
            <button
              onClick={handlePhoto}
              className="flex items-center gap-2 px-4 py-3 bg-secondary rounded-lg text-secondary-foreground font-mono text-xs"
            >
              <Camera className="w-4 h-4" />
              Photo{photos.length > 0 && ` (${photos.length})`}
            </button>
            <button
              onClick={handleGetLocation}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-mono text-xs ${
                location
                  ? "bg-severity-low/20 text-severity-low"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              <MapPin className="w-4 h-4" />
              {location ? "Located" : "Location"}
            </button>
            <button
              onClick={() => setShowExtras(!showExtras)}
              className="flex items-center gap-2 px-4 py-3 bg-secondary rounded-lg text-secondary-foreground font-mono text-xs"
            >
              More
            </button>
          </div>

          {/* Photo previews */}
          {photos.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              {photos.map((photo, i) => (
                <div key={i} className="relative shrink-0">
                  <img
                    src={photo}
                    alt={`Photo ${i + 1}`}
                    className="w-16 h-16 rounded-lg object-cover border border-border"
                  />
                  <button
                    onClick={() =>
                      setPhotos((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-destructive-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Extras */}
          {showExtras && (
            <div className="space-y-3 pt-2 border-t border-border">
              <div>
                <label className="font-mono text-xs text-muted-foreground uppercase tracking-wide mb-1 block">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="water, noise, boundary..."
                  className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              {location && (
                <div className="font-mono text-xs text-muted-foreground">
                  📍 {location}
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-mono font-bold text-sm py-4 rounded-lg active:scale-[0.98] transition-transform mt-2"
          >
            <Send className="w-4 h-4" />
            RECORD
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
