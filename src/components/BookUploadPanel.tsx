"use client";

import { upload } from "@vercel/blob/client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaItem } from "@/lib/media-types";

const PIN_KEY = "book-admin-pin";

type Props = {
  items: MediaItem[];
  blobEnabled: boolean;
  pinRequired: boolean;
  onChange: (items: MediaItem[]) => void;
};

export default function BookUploadPanel({
  items,
  blobEnabled,
  pinRequired,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(!pinRequired);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(PIN_KEY);
    if (saved) {
      setPin(saved);
      setUnlocked(true);
    } else if (!pinRequired) {
      setUnlocked(true);
    }
  }, [pinRequired]);

  const unlock = () => {
    if (pinRequired && !pin.trim()) {
      setError("Entrez le code d’accès.");
      return;
    }
    sessionStorage.setItem(PIN_KEY, pin.trim());
    setUnlocked(true);
    setError(null);
  };

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (!list.length) return;

      setBusy(true);
      setError(null);

      try {
        const nextItems = [...items];

        for (let i = 0; i < list.length; i++) {
          const file = list[i];
          setProgress(`Upload ${i + 1}/${list.length} — ${file.name}`);

          if (blobEnabled) {
            const blob = await upload(file.name, file, {
              access: "public",
              handleUploadUrl: "/api/upload",
              clientPayload: JSON.stringify({
                pin,
                caption: caption.trim() || undefined,
              }),
            });

            const res = await fetch("/api/media/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                pin,
                url: blob.url,
                pathname: blob.pathname,
                filename: file.name,
                mimeType: file.type || blob.contentType,
                size: file.size,
                caption: caption.trim() || undefined,
              }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Échec enregistrement.");
            nextItems.unshift(data.item);
          } else {
            const form = new FormData();
            form.append("file", file);
            form.append("pin", pin);
            if (caption.trim()) form.append("caption", caption.trim());

            const res = await fetch("/api/media", {
              method: "POST",
              headers: { "x-book-admin-pin": pin },
              body: form,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Échec upload.");
            nextItems.unshift(data.item);
          }
        }

        onChange(nextItems);
        setCaption("");
        setProgress(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Échec de l’upload.");
        setProgress(null);
      } finally {
        setBusy(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [blobEnabled, caption, items, onChange, pin]
  );

  const removeItem = async (id: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: "DELETE",
        headers: { "x-book-admin-pin": pin },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Suppression impossible.");
      onChange(items.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="book-no-print fixed bottom-6 right-5 z-40 border border-[var(--book-gold)] bg-black/90 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--book-gold)] shadow-[0_0_40px_rgb(212_175_55_/_0.2)] backdrop-blur-md transition hover:bg-[var(--book-gold)]/10 sm:right-8"
      >
        + Ajouter photos / vidéos
      </button>

      {open && (
        <div
          className="book-no-print fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Ajouter des médias"
          onClick={() => !busy && setOpen(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto border border-[var(--book-gold)]/40 bg-black p-5 sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--book-gold)]">
                  Gestion du book
                </p>
                <h3 className="mt-2 font-display text-2xl text-[var(--book-cream)]">
                  Photos & vidéos
                </h3>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => setOpen(false)}
                className="text-[10px] uppercase tracking-[0.22em] text-[var(--book-gold)]/70 hover:text-[var(--book-gold)]"
              >
                Fermer
              </button>
            </div>

            {!unlocked ? (
              <div className="space-y-4">
                <p className="text-sm text-[var(--book-cream)]/65">
                  Entrez le code d’accès pour ajouter ou supprimer des médias.
                </p>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Code d’accès"
                  className="w-full border border-[var(--book-gold)]/35 bg-black px-4 py-3 text-sm text-[var(--book-cream)] outline-none focus:border-[var(--book-gold)]"
                  onKeyDown={(e) => e.key === "Enter" && unlock()}
                />
                <button
                  type="button"
                  onClick={unlock}
                  className="w-full border border-[var(--book-gold)] bg-[var(--book-gold)]/10 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--book-gold)]"
                >
                  Déverrouiller
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Légende (optionnel)"
                  className="w-full border border-[var(--book-gold)]/35 bg-black px-4 py-3 text-sm text-[var(--book-cream)] outline-none focus:border-[var(--book-gold)]"
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    if (e.dataTransfer.files?.length) {
                      void uploadFiles(e.dataTransfer.files);
                    }
                  }}
                  className={`border border-dashed px-4 py-10 text-center transition-colors ${
                    dragOver
                      ? "border-[var(--book-gold)] bg-[var(--book-gold)]/10"
                      : "border-[var(--book-gold)]/40"
                  }`}
                >
                  <p className="font-display text-lg text-[var(--book-cream)]">
                    Glissez vos fichiers ici
                  </p>
                  <p className="mt-2 text-xs text-[var(--book-cream)]/50">
                    Photos JPG/PNG/WEBP · Vidéos MP4/WEBM
                  </p>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => inputRef.current?.click()}
                    className="mt-5 border border-[var(--book-gold)] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--book-gold)] hover:bg-[var(--book-gold)]/10 disabled:opacity-50"
                  >
                    Choisir des fichiers
                  </button>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.length) void uploadFiles(e.target.files);
                    }}
                  />
                </div>

                {progress && (
                  <p className="text-xs text-[var(--book-gold)]">{progress}</p>
                )}
                {error && <p className="text-xs text-red-300">{error}</p>}

                <div>
                  <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[var(--book-gold)]/70">
                    Médias ajoutés ({items.length})
                  </p>
                  {items.length === 0 ? (
                    <p className="text-sm text-[var(--book-cream)]/45">
                      Aucun média pour l’instant. Ajoutez vos photos et vidéos
                      professionnelles.
                    </p>
                  ) : (
                    <ul className="max-h-56 space-y-2 overflow-y-auto">
                      {items.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between gap-3 border border-[var(--book-gold)]/20 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm text-[var(--book-cream)]">
                              {item.caption}
                            </p>
                            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--book-gold)]/60">
                              {item.kind === "photo" ? "Photo" : "Vidéo"}
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void removeItem(item.id)}
                            className="shrink-0 text-[10px] uppercase tracking-[0.18em] text-red-300/80 hover:text-red-200 disabled:opacity-50"
                          >
                            Supprimer
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
