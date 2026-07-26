import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import {
  assertAdminPin,
  isBlobConfigured,
  MAX_VIDEO_BYTES,
} from "@/lib/media-store";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  if (!isBlobConfigured()) {
    return NextResponse.json(
      {
        error:
          "Stockage cloud non configuré. Ajoutez BLOB_READ_WRITE_TOKEN sur Vercel.",
      },
      { status: 503 }
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        let pin: string | undefined;
        try {
          const payload = clientPayload
            ? (JSON.parse(clientPayload) as { pin?: string })
            : {};
          pin = payload.pin;
        } catch {
          // ignore
        }

        if (!assertAdminPin(pin)) {
          throw new Error("Code d’accès incorrect.");
        }

        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "video/mp4",
            "video/webm",
            "video/quicktime",
          ],
          maximumSizeInBytes: MAX_VIDEO_BYTES,
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Échec de l’upload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
