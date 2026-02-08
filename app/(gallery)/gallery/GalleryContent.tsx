"use client";

import type { GalleryEvent, GalleryPhoto } from "@/types/gallery";
import { MasonryGrid } from "@/components/gallery/MasonryGrid";

interface GalleryContentProps {
  event: GalleryEvent;
  initialPhotos: GalleryPhoto[];
  totalCount: number;
  hasMore: boolean;
}

export function GalleryContent({ event, initialPhotos, totalCount, hasMore }: GalleryContentProps) {
  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main id="main-content" className="min-h-screen py-8">
      <div className="gallery-container">
        <header className="text-center mb-8 pb-6" style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
          <h1
            className="text-2xl md:text-4xl font-bold mb-2 tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {event.title}
          </h1>
          <p className="text-muted mb-2">{formattedDate}</p>
          <p className="text-sm text-subtle">{totalCount} photos</p>
        </header>

        {totalCount === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted">Photos are on their way! Check back soon.</p>
          </div>
        ) : (
          <MasonryGrid
            initialPhotos={initialPhotos}
            totalCount={totalCount}
            hasMore={hasMore}
            eventId={event.id}
          />
        )}
      </div>
    </main>
  );
}
