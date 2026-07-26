"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import BookPrint from "@/components/BookPrint";
import type { MediaItem } from "@/lib/media-types";
import { profile } from "@/lib/profile";

type Tab = "photo" | "video" | "certificate";

const TABS: { id: Tab; label: string }[] = [
  { id: "photo", label: "Photos" },
  { id: "video", label: "Vidéos" },
  { id: "certificate", label: "Certificats" },
];

function GoldCorners({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-3 sm:inset-5 ${className}`}
      aria-hidden
    >
      <span className="absolute left-0 top-0 h-8 w-8 border-l border-t border-[var(--book-gold)] sm:h-12 sm:w-12" />
      <span className="absolute right-0 top-0 h-8 w-8 border-r border-t border-[var(--book-gold)] sm:h-12 sm:w-12" />
      <span className="absolute bottom-0 left-0 h-8 w-8 border-b border-l border-[var(--book-gold)] sm:h-12 sm:w-12" />
      <span className="absolute bottom-0 right-0 h-8 w-8 border-b border-r border-[var(--book-gold)] sm:h-12 sm:w-12" />
    </div>
  );
}

function GoldRule({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--book-gold)] to-[var(--book-gold)]" />
      <span className="h-1.5 w-1.5 rotate-45 bg-[var(--book-gold)]" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[var(--book-gold)] to-[var(--book-gold)]" />
    </div>
  );
}

export default function BookPage() {
  const [tab, setTab] = useState<Tab>("photo");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [uploads, setUploads] = useState<MediaItem[]>([]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/media");
        const data = await res.json();
        if (cancelled) return;
        setUploads(data.items || []);
      } catch {
        // empty book
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const portrait = useMemo(
    () =>
      uploads.find((item) => item.role === "portrait") ||
      uploads.find((item) =>
        item.filename.includes("15.41.24 (3)")
      ),
    [uploads]
  );

  const identityPhoto = useMemo(
    () =>
      uploads.find((item) => item.role === "identity") ||
      uploads.find((item) =>
        item.filename.includes("15.39.27 (24)")
      ),
    [uploads]
  );

  const photos = useMemo(
    () =>
      uploads.filter(
        (item) => item.kind === "photo" && item.role !== "portrait"
      ),
    [uploads]
  );

  const printTrompe = useMemo(
    () =>
      uploads.filter(
        (item) => item.kind === "photo" && item.printGroup === "trompe"
      ),
    [uploads]
  );

  const printGateaux = useMemo(
    () =>
      uploads.filter(
        (item) =>
          item.kind === "photo" &&
          item.role !== "portrait" &&
          item.role !== "identity" &&
          item.printGroup !== "exclude" &&
          item.printGroup !== "trompe" &&
          item.printGroup !== "highlight" &&
          item.printGroup !== "evenementiels"
      ),
    [uploads]
  );

  const printEvenementiels = useMemo(
    () =>
      uploads
        .filter(
          (item) => item.kind === "photo" && item.printGroup === "evenementiels"
        )
        .slice()
        .sort((a, b) => a.filename.localeCompare(b.filename, "fr")),
    [uploads]
  );

  const printHighlight = useMemo(
    () =>
      uploads.filter(
        (item) => item.kind === "photo" && item.printGroup === "highlight"
      ),
    [uploads]
  );

  const videos = useMemo(
    () => uploads.filter((item) => item.kind === "video"),
    [uploads]
  );

  const certificates = useMemo(
    () => uploads.filter((item) => item.kind === "certificate"),
    [uploads]
  );

  const gallery = tab === "photo" ? photos : tab === "certificate" ? certificates : [];
  const heroSrc = portrait?.url || photos[0]?.url;

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight" && gallery.length) {
        setLightbox((i) => (i === null ? null : (i + 1) % gallery.length));
      }
      if (e.key === "ArrowLeft" && gallery.length) {
        setLightbox((i) =>
          i === null ? null : (i - 1 + gallery.length) % gallery.length
        );
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, gallery.length]);

  useEffect(() => {
    setLightbox(null);
  }, [tab]);

  const handlePrint = () => {
    const images = Array.from(
      document.querySelectorAll<HTMLImageElement>(".book-print img")
    );
    Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) {
              resolve();
              return;
            }
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
      )
    ).then(() => window.print());
  };

  return (
    <div className="book-root min-h-screen bg-black text-[var(--book-cream)]">
      <BookPrint
        portrait={portrait}
        identityPhoto={identityPhoto}
        trompe={printTrompe}
        gateaux={printGateaux}
        evenementiels={printEvenementiels}
        highlight={printHighlight}
        certificates={certificates}
      />

      <div className="book-screen">
      <div className="book-patisserie-glow pointer-events-none fixed inset-0" aria-hidden />
      <div className="book-foil-pattern pointer-events-none fixed inset-0" aria-hidden />

      <header className="relative z-20 flex items-center justify-between border-b border-[var(--book-gold)]/25 px-5 py-4 sm:px-8 lg:px-12">
        <Image
          src="/logo-mbs.png"
          alt={profile.fullName}
          width={56}
          height={56}
          className="h-12 w-12 rounded-full object-contain sm:h-14 sm:w-14"
          priority
        />
        <button
          type="button"
          onClick={handlePrint}
          className="book-no-print border border-[var(--book-gold)]/55 bg-black/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--book-gold)] transition-all hover:border-[var(--book-gold)] hover:bg-[var(--book-gold)]/10"
        >
          Imprimer / PDF
        </button>
      </header>

      <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
        <div className="absolute inset-0">
          {heroSrc ? (
            <Image
              src={heroSrc}
              alt=""
              fill
              priority
              unoptimized={heroSrc.startsWith("http")}
              className="object-cover object-center"
              sizes="100vw"
              quality={92}
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,#2a2110_0%,#000_55%),radial-gradient(ellipse_at_80%_70%,#1a1508_0%,#000_50%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/45" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/30 to-black/60" />
        </div>

        <GoldCorners className="z-10 opacity-70" />

        <div
          className={`relative z-10 mx-auto w-full max-w-6xl px-5 pb-20 pt-32 transition-all duration-1000 sm:px-8 sm:pb-28 lg:px-12 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <Image
            src="/logo-mbs.png"
            alt={profile.fullName}
            width={280}
            height={280}
            className="h-auto w-[min(52vw,220px)] rounded-full object-contain drop-shadow-[0_8px_40px_rgba(0,0,0,0.55)] sm:w-[240px] lg:w-[280px]"
            priority
          />

          <h1 className="sr-only">{profile.fullName}</h1>

          <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.42em] text-[var(--book-gold)]">
            {profile.title}
          </p>

          <GoldRule className="mt-6 max-w-xs" />

          <p className="mt-6 max-w-md font-display text-lg leading-relaxed text-[var(--book-cream)]/85 sm:text-xl">
            {profile.tagline}
          </p>
        </div>

        <div
          className="book-no-print absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
          aria-hidden
        >
          <span className="text-[9px] uppercase tracking-[0.32em] text-[var(--book-gold)]/75">
            Découvrir
          </span>
          <span className="book-scroll-line h-10 w-px bg-gradient-to-b from-[var(--book-gold)] to-transparent" />
        </div>
      </section>

      {/* Identity + portrait */}
      <section className="relative z-10 border-t border-[var(--book-gold)]/30">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:px-12 lg:py-28">
          <div className="relative mx-auto w-full max-w-sm lg:mx-0">
            <div className="relative aspect-[3/4] overflow-hidden bg-black ring-1 ring-[var(--book-gold)]/35">
              {(identityPhoto || portrait) ? (
                <Image
                  src={(identityPhoto || portrait)!.url}
                  alt={`${profile.fullName}, ${profile.title}`}
                  fill
                  unoptimized={(identityPhoto || portrait)!.url.startsWith("http")}
                  className="object-cover"
                  sizes="(max-width: 1024px) 90vw, 360px"
                  quality={92}
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[var(--book-noir)] px-6 text-center text-sm text-[var(--book-cream)]/40">
                  Portrait à ajouter
                </div>
              )}
            </div>
            <GoldCorners className="opacity-80" />
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--book-gold)]">
              Identité professionnelle
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-[var(--book-cream)] sm:text-4xl">
              Un métier, une exigence
            </h2>
            <GoldRule className="mt-6 max-w-[12rem]" />

            <div className="mt-8 space-y-5">
              {profile.bio.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="text-base leading-relaxed text-[var(--book-cream)]/70 sm:text-lg"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <dl className="mt-10 grid gap-6 border-t border-[var(--book-gold)]/25 pt-8 sm:grid-cols-2">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.25em] text-[var(--book-gold)]">
                  Nom
                </dt>
                <dd className="mt-2 font-display text-xl text-[var(--book-cream)]">
                  {profile.fullName}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.25em] text-[var(--book-gold)]">
                  Profession
                </dt>
                <dd className="mt-2 font-display text-xl text-[var(--book-cream)]">
                  {profile.title}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[10px] uppercase tracking-[0.25em] text-[var(--book-gold)]">
                  Activité
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-[var(--book-cream)]/65">
                  {profile.activity}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="relative z-10 overflow-hidden border-y border-[var(--book-gold)]/40 bg-[var(--book-noir)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-4 px-5 py-9 sm:px-8 lg:px-12">
          {profile.skills.map((skill) => (
            <span
              key={skill}
              className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--book-gold)]"
            >
              <span className="h-1.5 w-1.5 rotate-45 bg-[var(--book-gold)]" aria-hidden />
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* Tabs portfolio */}
      <section className="relative z-10 bg-black px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto mb-10 max-w-6xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--book-gold)]">
            Portfolio
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-[var(--book-cream)] sm:text-5xl">
            Réalisations
          </h2>
          <GoldRule className="mx-auto mt-6 max-w-xs" />
        </div>

        <div className="mx-auto mb-12 flex max-w-6xl flex-wrap justify-center gap-2 border-b border-[var(--book-gold)]/20 pb-1">
          {TABS.map((item) => {
            const count =
              item.id === "photo"
                ? photos.length
                : item.id === "video"
                  ? videos.length
                  : certificates.length;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`relative px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] transition ${
                  tab === item.id
                    ? "text-[var(--book-gold)]"
                    : "text-[var(--book-cream)]/45 hover:text-[var(--book-cream)]/75"
                }`}
              >
                {item.label}
                <span className="ml-2 text-[var(--book-gold)]/50">{count}</span>
                {tab === item.id && (
                  <span className="absolute inset-x-3 -bottom-px h-px bg-[var(--book-gold)]" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mx-auto max-w-6xl">
          {tab === "video" ? (
            videos.length === 0 ? (
              <EmptyState label="Aucune vidéo pour le moment." />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {videos.map((video) => (
                  <figure key={video.id} className="bg-black">
                    <div className="relative overflow-hidden p-[1px]">
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--book-gold)] via-[var(--book-gold-dim)] to-[var(--book-gold)] opacity-70" />
                      <div className="relative aspect-[9/16] overflow-hidden bg-black sm:aspect-video">
                        <video
                          controls
                          playsInline
                          preload="metadata"
                          className="h-full w-full object-cover"
                        >
                          <source src={video.url} />
                        </video>
                      </div>
                    </div>
                  </figure>
                ))}
              </div>
            )
          ) : tab === "certificate" ? (
            certificates.length === 0 ? (
              <EmptyState label="Aucun certificat pour le moment." />
            ) : (
              <div className="space-y-10">
                <p className="mx-auto max-w-3xl text-center text-base leading-relaxed text-[var(--book-cream)]/75 sm:text-lg">
                  {profile.certificatesIntro}
                </p>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {certificates.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLightbox(index)}
                      className="group relative aspect-[4/3] overflow-hidden bg-[var(--book-noir)] outline-none ring-1 ring-[var(--book-gold)]/30 focus-visible:ring-2 focus-visible:ring-[var(--book-gold)]"
                      aria-label={`Voir le certificat ${index + 1}`}
                    >
                      <Image
                        src={`${item.url}?v=2`}
                        alt=""
                        fill
                        unoptimized
                        className="object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        quality={92}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )
          ) : gallery.length === 0 ? (
            <EmptyState label="Aucune photo pour le moment." />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
              {gallery.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLightbox(index)}
                  className="group relative aspect-[4/3] overflow-hidden bg-black outline-none ring-1 ring-[var(--book-gold)]/15 focus-visible:ring-2 focus-visible:ring-[var(--book-gold)]"
                  aria-label={`Voir le média ${index + 1}`}
                >
                  <Image
                    src={item.url}
                    alt=""
                    fill
                    unoptimized={item.url.startsWith("http")}
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    quality={90}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="relative z-10 border-t border-[var(--book-gold)]/35 bg-black">
        <div className="relative mx-auto max-w-3xl px-5 py-20 text-center sm:px-8 lg:py-28">
          <GoldCorners className="opacity-60" />
          <div className="relative px-4 py-10 sm:px-10 sm:py-14">
            <Image
              src="/logo-mbs.png"
              alt=""
              width={120}
              height={120}
              className="mx-auto h-24 w-24 rounded-full object-contain sm:h-28 sm:w-28"
            />
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--book-gold)]">
              Coordonnées professionnelles
            </p>
            <h2 className="book-gold-foil mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {profile.fullName}
            </h2>
            <p className="mt-3 text-sm uppercase tracking-[0.28em] text-[var(--book-gold-soft)]">
              {profile.title}
            </p>
            <GoldRule className="mx-auto mt-8 max-w-[14rem]" />
            <div className="mt-10 flex flex-col items-center gap-3 text-sm text-[var(--book-cream)]/75">
              <a
                href={`mailto:${profile.email}`}
                className="transition-colors hover:text-[var(--book-gold)]"
              >
                {profile.email}
              </a>
              <a
                href={`tel:+33${profile.phone.slice(1)}`}
                className="tracking-wide transition-colors hover:text-[var(--book-gold)]"
              >
                {profile.phoneDisplay}
              </a>
            </div>
            <p className="mx-auto mt-14 max-w-md text-xs leading-relaxed text-[var(--book-gold)]/40">
              Document de présentation professionnelle — photos, vidéos et
              certificats. Destiné à illustrer l’exercice d’une activité
              professionnelle.
            </p>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-[var(--book-gold)]/20 bg-black px-5 py-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--book-gold)]/45">
          © {new Date().getFullYear()} {profile.fullName}
        </p>
      </footer>
      </div>

      {lightbox !== null && gallery[lightbox] && (
        <div
          className="book-no-print fixed inset-0 z-50 flex items-center justify-center bg-black/97 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Aperçu"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute right-5 top-5 text-[11px] uppercase tracking-[0.25em] text-[var(--book-gold)]"
            onClick={() => setLightbox(null)}
          >
            Fermer
          </button>
          <div
            className="relative max-h-[85vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden ring-1 ring-[var(--book-gold)]/40">
              <Image
                src={gallery[lightbox].url}
                alt=""
                fill
                unoptimized={gallery[lightbox].url.startsWith("http")}
                className="object-contain"
                sizes="90vw"
                quality={95}
                priority
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="mx-auto max-w-xl border border-dashed border-[var(--book-gold)]/30 px-6 py-16 text-center">
      <p className="text-sm text-[var(--book-cream)]/50">{label}</p>
    </div>
  );
}
