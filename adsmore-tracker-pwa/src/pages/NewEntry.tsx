/**
 * NewEntry — Quick event logging form
 * Design: Field Instrument
 * - Minimal fields, fast capture
 * - Camera button prominent
 * - Severity and category as tap chips
 * - One-thumb reachable submit
 */
import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Camera, X, MapPin } from "lucide-react";
import { addEntry, addPhoto, generateId, createThumbnail, type Category, type Severity } from "@/lib/db";
import { toast } from "sonner";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "noise", label: "Noise" },
  { value: "traffic", label: "Traffic" },
  { value: "property_damage", label: "Property Damage" },
  { value: "environmental", label: "Environmental" },
  { value: "health", label: "Health" },
  { value: "vibration", label: "Vibration" },
  { value: "light", label: "Light" },
  { value: "other", label: "Other" },
];

const SEVERITIES: { value: Severity; label: string; color: string }[] = [
  { value: "critical", label: "Critical", color: "bg-severity-critical" },
  { value: "high", label: "High", color: "bg-severity-high" },
  { value: "medium", label: "Medium", color: "bg-severity-medium" },
  { value: "low", label: "Low", color: "bg-severity-low" },
  { value: "info", label: "Info", color: "bg-severity-info" },
];

interface PendingPhoto {
  id: string;
  blob: Blob;
  preview: string;
}

export default function NewEntry() {
  const [, navigate] = useLocation();
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("noise");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState("");
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handlePhotoCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      const id = generateId();
      const preview = URL.createObjectURL(file);
      setPhotos((prev) => [...prev, { id, blob: file, preview }]);
    }
    // Reset input so same file can be selected again
    e.target.value = "";
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) URL.revokeObjectURL(photo.preview);
      return prev.filter((p) => p.id !== id);
    });
  }

  async function handleSubmit() {
    if (!description.trim()) {
      toast.error("Description required");
      return;
    }
    setSaving(true);
    try {
      const entryId = generateId();
      const photoIds: string[] = [];

      // Save photos to IndexedDB
      for (const photo of photos) {
        const thumbnail = await createThumbnail(photo.blob);
        await addPhoto({
          id: photo.id,
          entryId,
          data: photo.blob,
          mimeType: photo.blob.type,
          timestamp: new Date().toISOString(),
          thumbnail,
        });
        photoIds.push(photo.id);
      }

      // Save entry
      await addEntry({
        id: entryId,
        timestamp: new Date().toISOString(),
        description: description.trim(),
        category,
        severity,
        tags: [],
        photoIds,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      // Cleanup previews
      photos.forEach((p) => URL.revokeObjectURL(p.preview));

      toast.success("Event logged");
      navigate("/");
    } catch (e) {
      console.error("Failed to save:", e);
      toast.error("Failed to save entry");
    }
    setSaving(false);
  }

  function handleGetLocation() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
        },
        () => {
          toast.error("Location unavailable");
        }
      );
    }
  }

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
          <h1 className="font-mono text-sm font-semibold tracking-tight text-foreground uppercase">
            Log Event
          </h1>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-28 space-y-5">
        {/* Description */}
        <div>
          <label className="font-mono text-xs text-muted-foreground uppercase tracking-wide block mb-2">
            What happened
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the event..."
            className="w-full bg-secondary text-foreground rounded-lg px-4 py-3 text-sm resize-none min-h-[100px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
        </div>

        {/* Category */}
        <div>
          <label className="font-mono text-xs text-muted-foreground uppercase tracking-wide block mb-2">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`px-3 py-2 rounded-md font-mono text-xs transition-colors ${
                  category === c.value
                    ? "bg-foreground text-background font-semibold"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Severity */}
        <div>
          <label className="font-mono text-xs text-muted-foreground uppercase tracking-wide block mb-2">
            Severity
          </label>
          <div className="flex gap-2">
            {SEVERITIES.map((s) => (
              <button
                key={s.value}
                onClick={() => setSeverity(s.value)}
                className={`flex-1 px-2 py-2.5 rounded-md font-mono text-xs uppercase text-center transition-colors ${
                  severity === s.value
                    ? `${s.color} text-background font-semibold`
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Photos */}
        <div>
          <label className="font-mono text-xs text-muted-foreground uppercase tracking-wide block mb-2">
            Photos
          </label>
          <div className="flex gap-2 flex-wrap">
            {photos.map((p) => (
              <div key={p.id} className="relative w-20 h-20 rounded-lg overflow-hidden bg-secondary">
                <img src={p.preview} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(p.id)}
                  className="absolute top-0.5 right-0.5 w-6 h-6 bg-background/80 rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-foreground" />
                </button>
              </div>
            ))}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-lg bg-secondary border-2 border-dashed border-border flex items-center justify-center hover:border-muted-foreground transition-colors"
            >
              <Camera className="w-6 h-6 text-muted-foreground" />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handlePhotoCapture}
            className="hidden"
          />
        </div>

        {/* Location */}
        <div>
          <label className="font-mono text-xs text-muted-foreground uppercase tracking-wide block mb-2">
            Location
          </label>
          <div className="flex gap-2">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Optional location..."
              className="flex-1 bg-secondary text-foreground rounded-lg px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handleGetLocation}
              className="touch-target bg-secondary rounded-lg hover:bg-accent transition-colors"
              aria-label="Get current location"
            >
              <MapPin className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="font-mono text-xs text-muted-foreground uppercase tracking-wide block mb-2">
            Additional Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional details..."
            className="w-full bg-secondary text-foreground rounded-lg px-4 py-3 text-sm resize-none min-h-[80px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </main>

      {/* Submit — Thumb Zone */}
      <div className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
        <div className="bg-background/95 backdrop-blur-sm border-t border-border px-4 py-3">
          <button
            onClick={handleSubmit}
            disabled={saving || !description.trim()}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-mono font-semibold text-sm py-4 rounded-lg active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100"
          >
            {saving ? "SAVING..." : "SAVE ENTRY"}
          </button>
        </div>
      </div>
    </div>
  );
}
