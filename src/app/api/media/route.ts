import { NextResponse } from "next/server";
import { readMedia } from "@/lib/media-store";

export const runtime = "nodejs";

export async function GET() {
  const store = await readMedia();
  return NextResponse.json({
    items: store.items,
  });
}

export async function POST() {
  return NextResponse.json(
    { error: "Ajout de médias désactivé." },
    { status: 403 }
  );
}
