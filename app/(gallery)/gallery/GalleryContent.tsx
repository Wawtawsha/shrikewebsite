"use client";

import { useState } from "react";
import type { GalleryEvent, GalleryPhoto } from "@/types/gallery";
import { MasonryGrid } from "@/components/gallery/MasonryGrid";
import { GuestBookBlade } from "@/components/gallery/GuestBookBlade";
import { useNessusTracking } from "@/hooks/useNessusTracking";
import { ThemeSwitcher } from "@/components/gallery/ThemeSwitcher";

interface GalleryContentProps {
  event: GalleryEvent;
  initialPhotos: GalleryPhoto[];
  totalCount: number;
  hasMore: boolean;
}

export function GalleryContent({ event, initialPhotos, totalCount, hasMore }: GalleryContentProps) {
  const [bladeOpen, setBladeOpen] = useState(false);
  useNessusTracking(`Gallery — ${event.title}`);

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main
      id="main-content"
      className="min-h-screen"
      style={{
        paddingRight: bladeOpen ? "min(400px, 50vw)" : undefined,
        transition: "padding-right 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div className="gallery-container">
        <header className="gallery-header">
          <div className="gallery-header-toggle">
            <ThemeSwitcher />
          </div>
          <h1 className="gallery-title">
            {event.title}
          </h1>
          <div className="gallery-meta">
            <span className="gallery-meta-date">{formattedDate}</span>
            <span className="gallery-meta-divider" aria-hidden="true" />
            <span className="gallery-meta-count">{totalCount} Photos</span>
          </div>
          <div className="gallery-header-rule" />
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

      {initialPhotos[0] && (
        <GuestBookBlade
          open={bladeOpen}
          onToggle={() => setBladeOpen((prev) => !prev)}
          eventId={event.id}
          firstPhotoId={initialPhotos[0].id}
        />
      )}
    </main>
  );
}
