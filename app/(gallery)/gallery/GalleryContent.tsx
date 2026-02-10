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
          <div className="gallery-tip-row">
            <a
              href="https://paypal.me/Wawtawsha"
              target="_blank"
              rel="noopener noreferrer"
              className="gallery-tip-link gallery-tip-paypal"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797H9.603c-.564 0-1.04.408-1.13.964L7.076 21.337z" />
              </svg>
              PayPal
            </a>
            <a
              href="https://cash.app/$wawtawsha"
              target="_blank"
              rel="noopener noreferrer"
              className="gallery-tip-link gallery-tip-cashapp"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M23.59 3.47A5.1 5.1 0 0 0 20.55.42C19.5.07 18.24 0 16.56 0H7.44C5.76 0 4.5.07 3.45.42A5.1 5.1 0 0 0 .41 3.47C.06 4.52 0 5.78 0 7.44v9.12c0 1.67.06 2.93.41 3.97a5.1 5.1 0 0 0 3.04 3.05c1.05.36 2.31.42 3.99.42h9.12c1.67 0 2.93-.06 3.97-.42a5.1 5.1 0 0 0 3.05-3.05c.36-1.04.42-2.3.42-3.97V7.44c0-1.66-.06-2.92-.41-3.97zM17.1 14.12a5.3 5.3 0 0 1-2.1 1.3l.32 1.33a.39.39 0 0 1-.38.49h-1.74a.39.39 0 0 1-.38-.31l-.28-1.17a7.5 7.5 0 0 1-2.3-.56l-.28-.13a.39.39 0 0 1-.18-.52l.63-1.37a.39.39 0 0 1 .52-.19c.76.36 1.5.56 2.21.56.72 0 1.2-.24 1.2-.7 0-.43-.36-.65-1.56-1.02-1.72-.52-3.16-1.26-3.16-3.1 0-1.46 1-2.7 2.84-3.12l-.3-1.26a.39.39 0 0 1 .38-.48h1.73c.18 0 .34.13.38.31l.27 1.11c.6.12 1.17.3 1.74.56a.39.39 0 0 1 .18.52l-.6 1.35a.39.39 0 0 1-.52.2 4.5 4.5 0 0 0-1.87-.46c-.79 0-1.1.33-1.1.63 0 .46.46.66 1.68 1.04 1.96.6 3.1 1.44 3.1 3.13 0 1.33-.8 2.59-2.44 3.12z" />
              </svg>
              CashApp
            </a>
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
