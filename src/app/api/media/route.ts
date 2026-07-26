import { NextResponse } from "next/server";
import {
  assertAdminPin,
  getAdminPin,
  isBlobConfigured,
  readMedia,
  saveLocalUpload,
} from "@/lib/media-store";

export const runtime = "nodejs";

export async function GET() {
  const store = await readMedia();
  return NextResponse.json({
    items: store.items,
    blobEnabled: isBlobConfigured(),
    pinRequired: Boolean(getAdminPin()),
  });
}

export async function POST(request: Request) {
  const form = await request.formData();
  const pin =
    request.headers.get("x-book-admin-pin") ||
    (typeof form.get("pin") === "string" ? String(form.get("pin")) : null);

  if (!assertAdminPin(pin)) {
    return NextResponse.json({ error: "Code d’accès incorrect." }, { status: 401 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }

  const caption = form.get("caption");
  try {
    const item = await saveLocalUpload({
      file,
      caption: typeof caption === "string" ? caption : undefined,
    });
    return NextResponse.json({ item });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Échec de l’upload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
