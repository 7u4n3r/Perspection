/**
 * IndexedDB storage layer for offline-first data persistence.
 * Stores entries and photos separately to handle large binary data efficiently.
 * No sync — all data stays on-device.
 */

const DB_NAME = "adsmore_tracker";
const DB_VERSION = 1;
const ENTRIES_STORE = "entries";
const PHOTOS_STORE = "photos";

export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type Category =
  | "noise"
  | "traffic"
  | "property_damage"
  | "environmental"
  | "health"
  | "vibration"
  | "light"
  | "other";

export interface TrackerEntry {
  id: string;
  timestamp: string;
  description: string;
  category: Category;
  severity: Severity;
  tags: string[];
  photoIds: string[];
  location?: string;
  notes?: string;
}

export interface PhotoRecord {
  id: string;
  entryId: string;
  data: Blob;
  mimeType: string;
  timestamp: string;
  thumbnail?: string; // base64 small thumbnail for list views
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(ENTRIES_STORE)) {
        const entryStore = db.createObjectStore(ENTRIES_STORE, { keyPath: "id" });
        entryStore.createIndex("timestamp", "timestamp", { unique: false });
        entryStore.createIndex("category", "category", { unique: false });
        entryStore.createIndex("severity", "severity", { unique: false });
      }
      if (!db.objectStoreNames.contains(PHOTOS_STORE)) {
        const photoStore = db.createObjectStore(PHOTOS_STORE, { keyPath: "id" });
        photoStore.createIndex("entryId", "entryId", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// --- Entry operations ---

export async function getAllEntries(): Promise<TrackerEntry[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ENTRIES_STORE, "readonly");
    const store = tx.objectStore(ENTRIES_STORE);
    const request = store.getAll();
    request.onsuccess = () => {
      const entries = request.result as TrackerEntry[];
      entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      resolve(entries);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getEntry(id: string): Promise<TrackerEntry | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ENTRIES_STORE, "readonly");
    const store = tx.objectStore(ENTRIES_STORE);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result as TrackerEntry | undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function addEntry(entry: TrackerEntry): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ENTRIES_STORE, "readwrite");
    const store = tx.objectStore(ENTRIES_STORE);
    store.put(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function updateEntry(id: string, updates: Partial<TrackerEntry>): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ENTRIES_STORE, "readwrite");
    const store = tx.objectStore(ENTRIES_STORE);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      if (getReq.result) {
        store.put({ ...getReq.result, ...updates });
      }
      tx.oncomplete = () => resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await openDB();
  // Delete entry and associated photos
  const tx = db.transaction([ENTRIES_STORE, PHOTOS_STORE], "readwrite");
  tx.objectStore(ENTRIES_STORE).delete(id);
  const photoStore = tx.objectStore(PHOTOS_STORE);
  const photoIndex = photoStore.index("entryId");
  const photoReq = photoIndex.getAllKeys(id);
  photoReq.onsuccess = () => {
    for (const key of photoReq.result) {
      photoStore.delete(key);
    }
  };
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// --- Photo operations ---

export async function addPhoto(photo: PhotoRecord): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTOS_STORE, "readwrite");
    tx.objectStore(PHOTOS_STORE).put(photo);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPhotosForEntry(entryId: string): Promise<PhotoRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTOS_STORE, "readonly");
    const store = tx.objectStore(PHOTOS_STORE);
    const index = store.index("entryId");
    const request = index.getAll(entryId);
    request.onsuccess = () => resolve(request.result as PhotoRecord[]);
    request.onerror = () => reject(request.error);
  });
}

export async function deletePhoto(photoId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTOS_STORE, "readwrite");
    tx.objectStore(PHOTOS_STORE).delete(photoId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// --- Search & Filter ---

export async function searchEntries(query: string): Promise<TrackerEntry[]> {
  const entries = await getAllEntries();
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
}

export interface FilterOptions {
  category?: Category;
  severity?: Severity;
  startDate?: string;
  endDate?: string;
}

export async function filterEntries(filters: FilterOptions): Promise<TrackerEntry[]> {
  const entries = await getAllEntries();
  return entries.filter((e) => {
    if (filters.category && e.category !== filters.category) return false;
    if (filters.severity && e.severity !== filters.severity) return false;
    if (filters.startDate && e.timestamp < filters.startDate) return false;
    if (filters.endDate && e.timestamp > filters.endDate) return false;
    return true;
  });
}

// --- Export ---

export async function exportEntries(format: "json" | "csv"): Promise<string> {
  const entries = await getAllEntries();
  if (format === "json") {
    return JSON.stringify(entries, null, 2);
  }
  const headers = ["ID", "Timestamp", "Description", "Category", "Severity", "Tags", "Location", "Notes", "Photos"];
  const rows = entries.map((e) => [
    e.id,
    e.timestamp,
    `"${e.description.replace(/"/g, '""')}"`,
    e.category,
    e.severity,
    e.tags.join(";"),
    e.location || "",
    `"${(e.notes || "").replace(/"/g, '""')}"`,
    e.photoIds.length.toString(),
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

// --- Utility ---

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export async function getEntryCount(): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ENTRIES_STORE, "readonly");
    const store = tx.objectStore(ENTRIES_STORE);
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function createThumbnail(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 80;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      const scale = Math.max(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.6));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve("");
    };
    img.src = url;
  });
}
