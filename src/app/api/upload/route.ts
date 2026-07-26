import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    { error: "Ajout de médias désactivé." },
    { status: 403 }
  );
}
