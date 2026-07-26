import { NextResponse } from "next/server";
import {
  assertAdminPin,
  deleteMedia,
  updateMediaPrintGroup,
} from "@/lib/media-store";
import type { PrintGroup } from "@/lib/media-types";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

const PRINT_GROUPS = new Set<PrintGroup>([
  "trompe",
  "gateaux",
  "exclude",
  "highlight",
  "evenementiels",
]);

export async function PATCH(request: Request, { params }: Params) {
  const body = (await request.json().catch(() => null)) as {
    pin?: string;
    printGroup?: string;
  } | null;

  const pin =
    body?.pin ||
    request.headers.get("x-book-admin-pin") ||
    new URL(request.url).searchParams.get("pin");

  if (!assertAdminPin(pin)) {
    return NextResponse.json({ error: "Code d’accès incorrect." }, { status: 401 });
  }

  const printGroup = body?.printGroup;
  if (!printGroup || !PRINT_GROUPS.has(printGroup as PrintGroup)) {
    return NextResponse.json(
      { error: "Groupe d’impression invalide." },
      { status: 400 }
    );
  }

  const { id } = await params;
  const item = await updateMediaPrintGroup(id, printGroup as PrintGroup);
  if (!item) {
    return NextResponse.json({ error: "Média introuvable." }, { status: 404 });
  }
  return NextResponse.json({ item });
}

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
