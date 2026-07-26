import { NextResponse } from "next/server";
import { assertAdminPin, deleteMedia } from "@/lib/media-store";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: Params) {
  const pin =
    request.headers.get("x-book-admin-pin") ||
    new URL(request.url).searchParams.get("pin");

  if (!assertAdminPin(pin)) {
    return NextResponse.json({ error: "Code d’accès incorrect." }, { status: 401 });
  }

  const { id } = await params;
  const ok = await deleteMedia(id);
  if (!ok) {
    return NextResponse.json({ error: "Média introuvable." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
