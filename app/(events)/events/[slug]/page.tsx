import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { eventConfigs } from "@/lib/event-configs";
import { fetchEvent, fetchPhotos } from "@/lib/gallery";
import { EventGalleryContent } from "@/components/gallery/EventGalleryContent";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return Object.keys(eventConfigs).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const config = eventConfigs[slug];
  if (!config) return {};

  const event = await fetchEvent(config.supabaseSlug);
  const title = event?.title ?? slug;

  return {
    title: `${title} | Shrike Media`,
    description: `Photo gallery for ${title} by Shrike Media.`,
  };
}

export default async function EventGalleryPage({ params }: PageProps) {
  const { slug } = await params;
  const config = eventConfigs[slug];

  if (!config) notFound();

  const event = await fetchEvent(config.supabaseSlug);

  if (!event) {
    const themeClass = config.theme === "blacklight" ? "blacklight-theme " : "";
    return (
      <main
        id="main-content"
        className={`${themeClass}min-h-screen flex items-center justify-center px-6`}
      >
        <div className="max-w-md mx-auto text-center">
          <h1
            className="text-3xl font-bold mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Gallery Coming Soon
          </h1>
          <p style={{ color: "var(--color-muted)" }}>
            This gallery is not available yet. Check back soon!
          </p>
        </div>
      </main>
    );
  }

  const { photos, totalCount, hasMore } = await fetchPhotos(event.id, 0, 50);

  return (
    <Suspense fallback={<GalleryFallback themeClass={config.theme === "blacklight" ? "blacklight-theme" : ""} />}>
      <EventGalleryContent
        event={event}
        initialPhotos={photos}
        totalCount={totalCount}
        hasMore={hasMore}
        config={config}
        urlSlug={slug}
      />
    </Suspense>
  );
}

function GalleryFallback({ themeClass }: { themeClass: string }) {
  return (
    <main className={`${themeClass} min-h-screen flex items-center justify-center px-6`.trim()}>
      <p style={{ color: "var(--color-muted)" }}>Loading gallery...</p>
    </main>
  );
}
