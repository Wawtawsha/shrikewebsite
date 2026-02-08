import { Suspense } from "react";
import { fetchEvent, fetchPhotos } from "@/lib/gallery";
import { GalleryContent } from "./GalleryContent";

interface GalleryPageProps {
  searchParams: Promise<{ event?: string }>;
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const params = await searchParams;
  const slug = params.event;

  if (!slug) {
    return (
      <main id="main-content" className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Welcome to the Gallery
          </h1>
          <p className="text-muted">
            Looks like you need an event link to view photos. Check with your event host for the gallery URL!
          </p>
        </div>
      </main>
    );
  }

  const event = await fetchEvent(slug);

  if (!event) {
    return (
      <main id="main-content" className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Hmm, we couldn&apos;t find that gallery
          </h1>
          <p className="text-muted">
            Double-check the link from your event host. The gallery may not be published yet.
          </p>
        </div>
      </main>
    );
  }

  const { photos, totalCount, hasMore } = await fetchPhotos(event.id, 0, 50);

  return (
    <Suspense fallback={<GalleryFallback />}>
      <GalleryContent
        event={event}
        initialPhotos={photos}
        totalCount={totalCount}
        hasMore={hasMore}
      />
    </Suspense>
  );
}

function GalleryFallback() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <p className="text-muted">Loading gallery...</p>
    </main>
  );
}
