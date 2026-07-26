"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import BookUploadPanel from "@/components/BookUploadPanel";
import type { MediaItem } from "@/lib/media-types";
import { profile } from "@/lib/profile";

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
    <div
      className={`flex items-center gap-3 ${className}`}
      aria-hidden
    >
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--book-gold)] to-[var(--book-gold)]" />
      <span className="h-1.5 w-1.5 rotate-45 bg-[var(--book-gold)]" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[var(--book-gold)] to-[var(--book-gold)]" />
    </div>
  );
}

type Photo = {
  src: string;
  alt: string;
  caption: string;
  span?: "wide" | "tall";
};

export default function BookPage() {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [uploads, setUploads] = useState<MediaItem[]>([]);
  const [blobEnabled, setBlobEnabled] = useState(false);
  const [pinRequired, setPinRequired] = useState(false);

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
        setBlobEnabled(Boolean(data.blobEnabled));
        setPinRequired(Boolean(data.pinRequired));
      } catch {
        // empty book
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const photos = useMemo<Photo[]>(
    () =>
      uploads
        .filter((item) => item.kind === "photo")
        .map((item, index) => ({
          src: item.url,
          alt: item.caption || "Photo professionnelle",
          caption: item.caption || "Création",
          span: index % 5 === 0 ? ("wide" as const) : undefined,
        })),
    [uploads]
  );

  const videos = useMemo(
    () =>
      uploads
        .filter((item) => item.kind === "video")
        .map((item) => ({
          src: item.url,
          title: item.caption || "Vidéo professionnelle",
          description: "Vidéo ajoutée au book professionnel.",
        })),
    [uploads]
  );

  const heroSrc = photos[0]?.src;

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight" && photos.length) {
        setLightbox((i) => (i === null ? null : (i + 1) % photos.length));
      }
      if (e.key === "ArrowLeft" && photos.length) {
        setLightbox((i) =>
          i === null ? null : (i - 1 + photos.length) % photos.length
        );
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, photos.length]);

  return (
    <div className="book-root min-h-screen bg-black text-[var(--book-cream)]">
      <div className="book-patisserie-glow pointer-events-none fixed inset-0" aria-hidden />
      <div className="book-foil-pattern pointer-events-none fixed inset-0" aria-hidden />

      <header className="relative z-20 flex items-center justify-between border-b border-[var(--book-gold)]/25 px-5 py-5 sm:px-8 lg:px-12">
        <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-[var(--book-gold)]">
          Book professionnel
        </p>
        <button
          type="button"
          onClick={() => window.print()}
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
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.42em] text-[var(--book-gold)]">
            {profile.title}
          </p>

          <h1 className="font-display text-[clamp(2.75rem,8vw,6.5rem)] font-semibold leading-[0.95] tracking-tight">
            <span className="block text-[var(--book-cream)]">
              {profile.firstName}
            </span>
            <span className="book-gold-foil mt-1 block">{profile.lastName}</span>
          </h1>

          <GoldRule className="mt-8 max-w-xs" />

          <p className="mt-6 max-w-md font-display text-lg leading-relaxed text-[var(--book-cream)]/85 sm:text-xl">
            {profile.tagline}
          </p>
          <p className="mt-3 text-sm tracking-[0.12em] text-[var(--book-gold-soft)]">
            {profile.location}
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

      <section className="relative z-10 border-t border-[var(--book-gold)]/30">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:gap-20 lg:px-12 lg:py-28">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--book-gold)]">
              Identité professionnelle
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-[var(--book-cream)] sm:text-4xl">
              Un métier, une exigence
            </h2>
            <GoldRule className="mt-6 max-w-[12rem]" />
          </div>

          <div className="space-y-6">
            {profile.bio.map((paragraph) => (
              <p
                key={paragraph.slice(0, 40)}
                className="text-base leading-relaxed text-[var(--book-cream)]/70 sm:text-lg"
              >
                {paragraph}
              </p>
            ))}

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

      <section className="relative z-10 bg-black px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto mb-14 max-w-6xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--book-gold)]">
            Portfolio photographique
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-[var(--book-cream)] sm:text-5xl">
            Créations
          </h2>
          <GoldRule className="mx-auto mt-6 max-w-xs" />
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-[var(--book-cream)]/60 sm:text-base">
            Photographies professionnelles illustrant le travail pâtissier et la
            qualité des réalisations.
          </p>
        </div>

        {photos.length === 0 ? (
          <div className="mx-auto max-w-xl border border-dashed border-[var(--book-gold)]/30 px-6 py-16 text-center">
            <p className="font-display text-xl text-[var(--book-cream)]/80">
              Aucune photo pour le moment
            </p>
            <p className="mt-3 text-sm text-[var(--book-cream)]/50">
              Utilisez le bouton « Ajouter photos / vidéos » pour remplir le
              book.
            </p>
          </div>
        ) : (
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
            {photos.map((photo, index) => {
              const remote = photo.src.startsWith("http");
              const spanClass =
                photo.span === "wide"
                  ? "md:col-span-2"
                  : photo.span === "tall"
                    ? "md:row-span-2"
                    : "";
              return (
                <button
                  key={`${photo.src}-${index}`}
                  type="button"
                  onClick={() => setLightbox(index)}
                  className={`group relative overflow-hidden bg-black text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--book-gold)] ${spanClass}`}
                >
                  <div
                    className={`relative w-full overflow-hidden ${
                      photo.span === "tall"
                        ? "aspect-[3/4] md:aspect-auto md:h-full"
                        : "aspect-[4/3]"
                    }`}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      unoptimized={remote}
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      quality={90}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                      <p className="font-display text-sm text-[var(--book-cream)] sm:text-base">
                        {photo.caption}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-[var(--book-gold)]">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="relative z-10 border-t border-[var(--book-gold)]/30 bg-[var(--book-noir)] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto mb-14 max-w-6xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--book-gold)]">
            Portfolio vidéo
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-[var(--book-cream)] sm:text-5xl">
            Le geste en mouvement
          </h2>
          <GoldRule className="mt-6 max-w-xs" />
        </div>

        {videos.length === 0 ? (
          <div className="mx-auto max-w-xl border border-dashed border-[var(--book-gold)]/30 px-6 py-14 text-center">
            <p className="text-sm text-[var(--book-cream)]/50">
              Aucune vidéo pour le moment. Ajoutez vos vidéos professionnelles.
            </p>
          </div>
        ) : (
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
            {videos.map((video) => (
              <figure key={video.src + video.title}>
                <div className="relative overflow-hidden bg-black p-[1px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--book-gold)] via-[var(--book-gold-dim)] to-[var(--book-gold)] opacity-80" />
                  <div className="relative aspect-[9/16] max-h-[70vh] overflow-hidden bg-black md:aspect-video md:max-h-none">
                    <video
                      controls
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    >
                      <source src={video.src} />
                    </video>
                  </div>
                </div>
                <figcaption className="mt-5">
                  <p className="font-display text-xl text-[var(--book-cream)]">
                    {video.title}
                  </p>
                  <p className="mt-2 text-sm text-[var(--book-cream)]/55">
                    {video.description}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      <section className="relative z-10 border-t border-[var(--book-gold)]/35 bg-black">
        <div className="relative mx-auto max-w-3xl px-5 py-20 text-center sm:px-8 lg:py-28">
          <GoldCorners className="opacity-60" />
          <div className="relative px-4 py-10 sm:px-10 sm:py-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--book-gold)]">
              Coordonnées professionnelles
            </p>
            <h2 className="book-gold-foil mt-6 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {profile.fullName}
            </h2>
            <p className="mt-3 text-sm uppercase tracking-[0.28em] text-[var(--book-gold-soft)]">
              {profile.title}
            </p>
            <GoldRule className="mx-auto mt-8 max-w-[14rem]" />
            <div className="mt-10 flex flex-col items-center gap-4 text-sm text-[var(--book-cream)]/75">
              {profile.email ? (
                <a
                  href={`mailto:${profile.email}`}
                  className="transition-colors hover:text-[var(--book-gold)]"
                >
                  {profile.email}
                </a>
              ) : null}
              <p>{profile.location}</p>
            </div>
            <p className="mx-auto mt-14 max-w-md text-xs leading-relaxed text-[var(--book-gold)]/40">
              Document de présentation professionnelle — photos et vidéos des
              réalisations pâtissières. Destiné à illustrer l’exercice d’une
              activité professionnelle.
            </p>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-[var(--book-gold)]/20 bg-black px-5 py-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--book-gold)]/45">
          © {new Date().getFullYear()} {profile.fullName}
        </p>
      </footer>

      <BookUploadPanel
        items={uploads}
        blobEnabled={blobEnabled}
        pinRequired={pinRequired}
        onChange={setUploads}
      />

      {lightbox !== null && photos[lightbox] && (
        <div
          className="book-no-print fixed inset-0 z-50 flex items-center justify-center bg-black/97 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Aperçu photo"
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
                src={photos[lightbox].src}
                alt={photos[lightbox].alt}
                fill
                unoptimized={photos[lightbox].src.startsWith("http")}
                className="object-contain"
                sizes="90vw"
                quality={95}
                priority
              />
            </div>
            <p className="mt-4 text-center font-display text-lg text-[var(--book-cream)]">
              {photos[lightbox].caption}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
