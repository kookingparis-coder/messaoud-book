import type { MediaItem } from "@/lib/media-types";
import { profile } from "@/lib/profile";

type Props = {
  portrait?: MediaItem;
  identityPhoto?: MediaItem;
  trompe: MediaItem[];
  gateaux: MediaItem[];
  evenementiels: MediaItem[];
  highlight: MediaItem[];
  certificates: MediaItem[];
};

function chunk<T>(items: T[], size: number): T[][] {
  if (!items.length) return [];
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}

function PhotoSection({
  title,
  subtitle,
  photos,
  perPage,
  gridClass,
  skipPageIndexes = [],
}: {
  title: string;
  subtitle: string;
  photos: MediaItem[];
  perPage: number;
  gridClass: string;
  /** Pages 1-based à retirer du PDF (ex. [4] pour enlever la page 4/6) */
  skipPageIndexes?: number[];
}) {
  const pages = chunk(photos, perPage).filter(
    (_, index) => !skipPageIndexes.includes(index + 1)
  );
  if (!pages.length) return null;

  return (
    <>
      {pages.map((pagePhotos, pageIndex) => (
        <section
          key={`${title}-${pageIndex}`}
          className="print-page print-photos"
        >
          <div className="print-frame">
            <div className="print-photos-header">
              <div>
                <p className="print-eyebrow">{title}</p>
                <p className="print-section-sub">{subtitle}</p>
              </div>
              <p className="print-page-num">
                {pageIndex + 1} / {pages.length}
              </p>
            </div>
            <div className="print-rule" />
            <div className={`print-photo-grid ${gridClass}`}>
              {pagePhotos.map((photo) => (
                <figure key={photo.id} className="print-photo-cell">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt="" />
                </figure>
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

export default function BookPrint({
  portrait,
  identityPhoto,
  trompe,
  gateaux,
  evenementiels,
  highlight,
  certificates,
}: Props) {
  const year = new Date().getFullYear();
  const page2Photo = identityPhoto || portrait;
  const highlightPhotos = highlight.slice(0, 2);

  return (
    <div className="book-print" aria-hidden>
      <section className="print-page print-cover">
        <div className="print-frame">
          <p className="print-eyebrow">Book professionnel</p>
          <div className="print-rule" />
          <h1 className="print-cover-name">
            <span>{profile.firstName}</span>
            <span className="print-gold">{profile.lastName}</span>
          </h1>
          <p className="print-cover-title">{profile.title}</p>
          <div className="print-rule print-rule-short" />
          <p className="print-cover-tag">Portfolio photographique</p>
          {portrait ? (
            <div className="print-cover-portrait">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={portrait.url} alt="" />
            </div>
          ) : null}
        </div>
      </section>

      <section className="print-page print-identity">
        <div className="print-frame">
          <p className="print-eyebrow">Identité professionnelle</p>
          <h2 className="print-heading">Un métier, une exigence</h2>
          <div className="print-rule print-rule-short" />

          <div className="print-identity-grid">
            {page2Photo ? (
              <div className="print-identity-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={page2Photo.url} alt="" />
              </div>
            ) : null}
            <div className="print-identity-text">
              {profile.bio.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
              <dl className="print-meta">
                <div>
                  <dt>Nom</dt>
                  <dd>{profile.fullName}</dd>
                </div>
                <div>
                  <dt>Profession</dt>
                  <dd>{profile.title}</dd>
                </div>
                <div>
                  <dt>Activité</dt>
                  <dd>{profile.activity}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {certificates.length > 0 ? (
        <section className="print-page print-certificates">
          <div className="print-frame">
            <p className="print-eyebrow">Certificats</p>
            <h2 className="print-heading">Formations & certifications</h2>
            <div className="print-rule print-rule-short" />
            <p className="print-cert-intro">{profile.certificatesIntro}</p>
            <div className="print-cert-grid">
              {certificates.slice(0, 2).map((item) => (
                <figure key={item.id} className="print-cert-cell">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${item.url}?v=2`} alt="" />
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <PhotoSection
        title="Trompe-l’œil"
        subtitle="Sculptures pâtissières & illusions"
        photos={trompe}
        perPage={9}
        gridClass="print-photo-grid-9"
      />

      <PhotoSection
        title="Gâteaux & créations"
        subtitle="Entremets, tartes, pièces & mignardises"
        photos={gateaux}
        perPage={12}
        gridClass="print-photo-grid-12"
        skipPageIndexes={[2, 3, 4, 5, 6]}
      />

      <PhotoSection
        title="Événementiels"
        subtitle="Baby shower, anniversaire, mariage, séminaire…"
        photos={evenementiels}
        perPage={5}
        gridClass="print-photo-grid-evenementiels"
      />

      <section className="print-page print-closing">
        <div className="print-frame print-closing-inner">
          <p className="print-eyebrow">Coordonnées professionnelles</p>
          <div className="print-rule print-rule-short" />
          <h2 className="print-closing-name print-gold">{profile.fullName}</h2>
          <p className="print-cover-title">{profile.title}</p>
          <div className="print-contact">
            <p>{profile.email}</p>
            <p>{profile.phoneDisplay}</p>
          </div>
          <p className="print-closing-note">
            Document de présentation professionnelle — portfolio photographique
            et certificats, destiné à illustrer l’exercice d’une activité de
            pâtissier artisan.
          </p>
          <p className="print-footer">
            © {year} {profile.fullName}
          </p>
        </div>
      </section>

      {highlightPhotos.length > 0 ? (
        <section className="print-page print-highlight">
          <div className="print-frame">
            <p className="print-eyebrow">{profile.highlightEyebrow}</p>
            <h2 className="print-heading print-gold">
              {profile.highlightTitle}
            </h2>
            <div className="print-rule print-rule-short" />
            <p className="print-highlight-intro">{profile.highlightIntro}</p>
            <div
              className={
                highlightPhotos.length === 1
                  ? "print-highlight-grid print-highlight-grid-one"
                  : "print-highlight-grid"
              }
            >
              {highlightPhotos.map((item) => (
                <figure key={item.id} className="print-highlight-cell">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt="" />
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
