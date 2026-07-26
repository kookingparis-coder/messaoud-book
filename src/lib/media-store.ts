import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { del } from "@vercel/blob";
import type {
  MediaItem,
  MediaKind,
  MediaStore,
  PrintGroup,
} from "@/lib/media-types";

export function detectPrintGroup(
  filename: string,
  kind: MediaKind
): PrintGroup | undefined {
  if (kind !== "photo") return undefined;
  if (/mbapp[eé]/i.test(filename)) return "highlight";
  return "gateaux";
}

const DATA_FILE = path.join(process.cwd(), "data", "media.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export function getAdminPin(): string {
  return process.env.BOOK_ADMIN_PIN?.trim() || "";
}

export function assertAdminPin(pin: string | null | undefined): boolean {
  const expected = getAdminPin();
  if (!expected) return true;
  return Boolean(pin && pin === expected);
}

export function kindFromMime(
  mimeType: string,
  preferred?: MediaKind
): MediaKind | null {
  if (VIDEO_TYPES.has(mimeType)) return "video";
  if (IMAGE_TYPES.has(mimeType)) {
    if (preferred === "certificate") return "certificate";
    return "photo";
  }
  return null;
}

export function maxBytesForKind(kind: MediaKind): number {
  return kind === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
}

async function ensureDirs(): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function readMedia(): Promise<MediaStore> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as MediaStore;
  } catch {
    return { items: [] };
  }
}

export async function writeMedia(store: MediaStore): Promise<void> {
  await ensureDirs();
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
}

function safeExtension(filename: string, mimeType: string): string {
  const fromName = path.extname(filename).toLowerCase().replace(/[^\w.]/g, "");
  if (fromName && fromName.length <= 8) return fromName;
  if (mimeType === "image/jpeg" || mimeType === "image/jpg") return ".jpg";
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  if (mimeType === "image/gif") return ".gif";
  if (mimeType === "video/mp4") return ".mp4";
  if (mimeType === "video/webm") return ".webm";
  if (mimeType === "video/quicktime") return ".mov";
  return "";
}

export async function saveLocalUpload(params: {
  file: File;
  kind?: MediaKind;
  printGroup?: PrintGroup;
}): Promise<MediaItem> {
  const mimeType = params.file.type || "application/octet-stream";
  const kind = kindFromMime(mimeType, params.kind);
  if (!kind) {
    throw new Error(
      "Format non supporté. Photos : JPG, PNG, WEBP. Vidéos : MP4, WEBM."
    );
  }

  if (params.kind === "video" && kind !== "video") {
    throw new Error("Ce fichier n’est pas une vidéo.");
  }
  if (
    (params.kind === "photo" || params.kind === "certificate") &&
    kind === "video"
  ) {
    throw new Error("Ce fichier n’est pas une image.");
  }

  if (params.file.size > maxBytesForKind(kind)) {
    throw new Error(
      kind === "video"
        ? "Vidéo trop lourde (max 100 Mo)."
        : "Photo trop lourde (max 12 Mo)."
    );
  }

  await ensureDirs();
  const id = randomUUID();
  const filename = `${id}${safeExtension(params.file.name, mimeType)}`;
  await fs.writeFile(
    path.join(UPLOAD_DIR, filename),
    Buffer.from(await params.file.arrayBuffer())
  );

  const item: MediaItem = {
    id,
    kind,
    url: `/uploads/${filename}`,
    pathname: filename,
    filename: params.file.name,
    caption: "",
    mimeType,
    size: params.file.size,
    createdAt: new Date().toISOString(),
    local: true,
    printGroup:
      kind === "photo"
        ? params.printGroup || detectPrintGroup(params.file.name, kind)
        : undefined,
  };

  const store = await readMedia();
  store.items = [item, ...store.items];
  await writeMedia(store);
  return item;
}

export async function registerRemoteUpload(params: {
  url: string;
  pathname?: string;
  filename: string;
  mimeType: string;
  size: number;
  kind?: MediaKind;
  printGroup?: PrintGroup;
}): Promise<MediaItem> {
  const kind = kindFromMime(params.mimeType, params.kind);
  if (!kind) throw new Error("Format non supporté.");

  const item: MediaItem = {
    id: randomUUID(),
    kind,
    url: params.url,
    pathname: params.pathname,
    filename: params.filename,
    caption: "",
    mimeType: params.mimeType,
    size: params.size,
    createdAt: new Date().toISOString(),
    local: false,
    printGroup:
      kind === "photo"
        ? params.printGroup || detectPrintGroup(params.filename, kind)
        : undefined,
  };

  const store = await readMedia();
  store.items = [item, ...store.items];
  await writeMedia(store);
  return item;
}

export async function updateMediaPrintGroup(
  id: string,
  printGroup: PrintGroup
): Promise<MediaItem | null> {
  const store = await readMedia();
  const index = store.items.findIndex((entry) => entry.id === id);
  if (index < 0) return null;
  store.items[index] = { ...store.items[index], printGroup };
  await writeMedia(store);
  return store.items[index];
}

export async function deleteMedia(id: string): Promise<boolean> {
  const store = await readMedia();
  const item = store.items.find((entry) => entry.id === id);
  if (!item) return false;

  if (item.local && item.pathname) {
    try {
      await fs.unlink(path.join(UPLOAD_DIR, item.pathname));
    } catch {
      // already gone
    }
  } else if (item.url && isBlobConfigured()) {
    try {
      await del(item.url);
    } catch (error) {
      console.error("[media] blob delete failed:", error);
    }
  }

  store.items = store.items.filter((entry) => entry.id !== id);
  await writeMedia(store);
  return true;
}
