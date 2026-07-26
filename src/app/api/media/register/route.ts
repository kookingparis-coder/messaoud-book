import { NextResponse } from "next/server";
import {
  assertAdminPin,
  kindFromMime,
  maxBytesForKind,
  registerRemoteUpload,
} from "@/lib/media-store";

export const runtime = "nodejs";

type Body = {
  pin?: string;
  url?: string;
  pathname?: string;
  filename?: string;
  mimeType?: string;
  size?: number;
  caption?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;

  if (!assertAdminPin(body.pin)) {
    return NextResponse.json({ error: "Code d’accès incorrect." }, { status: 401 });
  }

  if (!body.url || !body.filename || !body.mimeType) {
    return NextResponse.json({ error: "Métadonnées incomplètes." }, { status: 400 });
  }

  const kind = kindFromMime(body.mimeType);
  if (!kind) {
    return NextResponse.json({ error: "Format non supporté." }, { status: 400 });
  }

  const size = body.size ?? 0;
  if (size > maxBytesForKind(kind)) {
    return NextResponse.json({ error: "Fichier trop volumineux." }, { status: 400 });
  }

  try {
    const item = await registerRemoteUpload({
      url: body.url,
      pathname: body.pathname,
      filename: body.filename,
      mimeType: body.mimeType,
      size,
      caption: body.caption,
    });
    return NextResponse.json({ item });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Échec de l’enregistrement.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
