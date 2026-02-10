"use client";

import { useState } from "react";
import type { GalleryEvent, GalleryPhoto } from "@/types/gallery";
import { MasonryGrid } from "@/components/gallery/MasonryGrid";
import { GuestBookBlade } from "@/components/gallery/GuestBookBlade";
import { useNessusTracking } from "@/hooks/useNessusTracking";

const PRESS_CLUB_CLIENT_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

interface PressClubContentProps {
  event: GalleryEvent;
  initialPhotos: GalleryPhoto[];
  totalCount: number;
  hasMore: boolean;
}

export function PressClubContent({ event, initialPhotos, totalCount, hasMore }: PressClubContentProps) {
  const [bladeOpen, setBladeOpen] = useState(false);
  useNessusTracking("2016 Night at Press Club", PRESS_CLUB_CLIENT_ID);

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main
      id="main-content"
      className="min-h-screen py-8"
      style={{
        paddingRight: bladeOpen ? "min(380px, 50vw)" : undefined,
        transition: "padding-right 0.3s ease",
      }}
    >
      <div className="gallery-container">
        <header className="text-center mb-8 pb-6" style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
          <h1
            className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {event.title}
          </h1>
          <div className="memphis-divider">
            <span className="memphis-triangle" />
            <span className="memphis-circle" />
            <span className="memphis-square" />
            <span className="memphis-circle" />
            <span className="memphis-triangle" />
          </div>
          <p style={{ color: "var(--color-muted)" }} className="mb-2">{formattedDate}</p>
          <p className="text-sm" style={{ color: "var(--color-subtle)" }}>{totalCount} photos</p>
        </header>

        {totalCount === 0 ? (
          <div className="text-center py-16">
            <p style={{ color: "var(--color-muted)" }}>Photos are on their way! Check back soon.</p>
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
