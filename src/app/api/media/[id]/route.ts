import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function PATCH() {
  return NextResponse.json(
    { error: "Modification des médias désactivée." },
    { status: 403 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Suppression des médias désactivée." },
    { status: 403 }
  );
}
