import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { fetchAllEvents, fetchRandomPhotos, getStorageUrl } from "@/lib/gallery";
import type { GalleryPhoto } from "@/types/gallery";

export const metadata: Metadata = {
  title: "Event Gallery | Shrike Media",
  description:
    "Browse photo galleries from Shrike Media events — 2016 Night, College Thursdays, Rosemont Vineyard, SAE House Party, and more.",
};

/** Slug → gallery URL. Events not listed here won't appear on the nexus page. */
const EVENT_URLS: Record<string, string> = {
  "theta-chi-house-party": "/events/theta-chi",
  "sae-house-party": "/events/SAE",
  "rosemont-tasting": "/gallery?event=rosemont-tasting",
  "college-thursday": "/events/collegethursday",
  "2016-night-at-press-club": "/events/pressclub",
};

const PREVIEW_COUNT = 5;

interface EventSection {
  title: string;
  url: string;
  photos: GalleryPhoto[];
}

async function loadEventSections(): Promise<EventSection[]> {
  const events = await fetchAllEvents(); // sorted by date desc from DB
  const sections: EventSection[] = [];

  for (const event of events) {
    const url = EVENT_URLS[event.slug];
    if (!url) continue; // skip events without a gallery page

    const photos = await fetchRandomPhotos(event.id, PREVIEW_COUNT);
    sections.push({ title: event.title, url, photos });
  }

  return sections;
}

export default async function NexusPage() {
  const sections = await loadEventSections();

  return (
    <main id="main-content" className="min-h-screen pb-24">
      {/* Hero */}
      <section className="pt-20 pb-12 px-6 text-center">
        <h1
          className="text-5xl md:text-6xl font-bold tracking-tight mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Event Gallery
        </h1>
        <p className="text-muted text-lg max-w-xl mx-auto">
          Moments captured at our events. Click into any gallery to browse,
          like, and download photos.
        </p>
      </section>

      {/* Event Sections */}
      <div className="space-y-20 max-w-7xl mx-auto px-6">
        {sections.map((section) => (
          <section key={section.title}>
            {/* Title + CTA row */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
              <h2
                className="text-3xl md:text-4xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {section.title}
              </h2>
              {section.photos.length > 0 && (
                <Link href={section.url} className="nexus-cta group">
                  View Gallery
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-0.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>

            {/* Photo Grid */}
            {section.photos.length === 0 ? (
              <div className="nexus-coming-soon">
                <p className="text-muted text-lg">Gallery not available yet</p>
              </div>
            ) : (
              <div className="nexus-grid">
                {section.photos.map((photo) => (
                  <Link
                    key={photo.id}
                    href={section.url}
                    className="nexus-photo"
                  >
                    <Image
                      src={getStorageUrl(photo.thumb_path)}
                      alt=""
                      width={photo.width}
                      height={photo.height}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="nexus-photo-img"
                    />
                  </Link>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
