"use client";

import { useState } from "react";
import Link from "next/link";
import type { GalleryEvent, GalleryPhoto } from "@/types/gallery";
import { MasonryGrid } from "@/components/gallery/MasonryGrid";
import { GuestBookBlade } from "@/components/gallery/GuestBookBlade";
import { DownloadQueueProvider } from "@/components/gallery/DownloadQueueContext";
import { DownloadQueueBlade } from "@/components/gallery/DownloadQueueBlade";
import { DownloadQueueFAB } from "@/components/gallery/DownloadQueueFAB";
import { DownloadInfoBanner } from "@/components/gallery/DownloadInfoBanner";
import { PhoneUnlockProvider, usePhoneUnlock } from "@/components/gallery/PhoneUnlockContext";
import { PhoneUnlockForm } from "@/components/gallery/PhoneUnlockForm";
import { useNessusTracking } from "@/hooks/useNessusTracking";

const WEBSITE_LABEL = "theta-chi-house-party";

interface ThetaChiContentProps {
  event: GalleryEvent;
  initialPhotos: GalleryPhoto[];
  totalCount: number;
  hasMore: boolean;
}

export function ThetaChiContent({ event, initialPhotos, totalCount, hasMore }: ThetaChiContentProps) {
  return (
    <DownloadQueueProvider eventId={event.id}>
      <PhoneUnlockProvider websiteLabel={WEBSITE_LABEL}>
        <ThetaChiInner event={event} initialPhotos={initialPhotos} totalCount={totalCount} hasMore={hasMore} />
      </PhoneUnlockProvider>
    </DownloadQueueProvider>
  );
}

function ThetaChiInner({ event, initialPhotos, totalCount, hasMore }: ThetaChiContentProps) {
  const [bladeOpen, setBladeOpen] = useState(false);
  const [downloadBladeOpen, setDownloadBladeOpen] = useState(false);
  const { trackEvent } = useNessusTracking("Theta Chi House Party", WEBSITE_LABEL);
  const { unlock } = usePhoneUnlock();

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const anyBladeOpen = bladeOpen || downloadBladeOpen;

  return (
    <main
      id="main-content"
      className="blacklight-theme min-h-screen py-8"
      style={{
        paddingRight: anyBladeOpen ? "min(380px, 50vw)" : undefined,
        transition: "padding-right 0.3s ease",
      }}
    >
      <div className="gallery-container">
        <header className="sae-header mb-8 pb-6" style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
          <div className="sae-header-top">
            <div className="sae-header-center">
              <h1
                className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {event.title}
              </h1>
              <div className="uv-divider">
                <span className="uv-dot" />
                <span className="uv-dot uv-dot--green" />
                <span className="uv-dot uv-dot--coral" />
                <span className="uv-dot uv-dot--green" />
                <span className="uv-dot" />
              </div>
            </div>
            <PhoneUnlockForm
              websiteLabel={WEBSITE_LABEL}
              eventTitle={event.title}
              onUnlock={unlock}
              trackEvent={trackEvent}
              theme="blacklight"
            />
          </div>

          <Link href="/nexus" className="event-crosslink" onClick={() => trackEvent("crosslink_nexus")}>
            See more events
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          <p style={{ color: "var(--color-muted)" }} className="mb-2 text-center">{formattedDate}</p>
          <p className="text-sm mb-4 text-center" style={{ color: "var(--color-subtle)" }}>{totalCount} photos</p>
          <p className="gallery-tip-message">
            If you like your photos, and would like to donate something in return, please consider tipping. We sincerely appreciate it.
          </p>
          <div className="gallery-tip-row">
            <a
              href="https://www.paypal.com/biz/profile/shrikemedia"
              target="_blank"
              rel="noopener noreferrer"
              className="gallery-tip-link gallery-tip-paypal"
              onClick={() => trackEvent("tip_click", { provider: "paypal" })}
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
              onClick={() => trackEvent("tip_click", { provider: "cashapp" })}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M23.59 3.47A5.1 5.1 0 0 0 20.55.42C19.5.07 18.24 0 16.56 0H7.44C5.76 0 4.5.07 3.45.42A5.1 5.1 0 0 0 .41 3.47C.06 4.52 0 5.78 0 7.44v9.12c0 1.67.06 2.93.41 3.97a5.1 5.1 0 0 0 3.04 3.05c1.05.36 2.31.42 3.99.42h9.12c1.67 0 2.93-.06 3.97-.42a5.1 5.1 0 0 0 3.05-3.05c.36-1.04.42-2.3.42-3.97V7.44c0-1.66-.06-2.92-.41-3.97zM17.1 14.12a5.3 5.3 0 0 1-2.1 1.3l.32 1.33a.39.39 0 0 1-.38.49h-1.74a.39.39 0 0 1-.38-.31l-.28-1.17a7.5 7.5 0 0 1-2.3-.56l-.28-.13a.39.39 0 0 1-.18-.52l.63-1.37a.39.39 0 0 1 .52-.19c.76.36 1.5.56 2.21.56.72 0 1.2-.24 1.2-.7 0-.43-.36-.65-1.56-1.02-1.72-.52-3.16-1.26-3.16-3.1 0-1.46 1-2.7 2.84-3.12l-.3-1.26a.39.39 0 0 1 .38-.48h1.73c.18 0 .34.13.38.31l.27 1.11c.6.12 1.17.3 1.74.56a.39.39 0 0 1 .18.52l-.6 1.35a.39.39 0 0 1-.52.2 4.5 4.5 0 0 0-1.87-.46c-.79 0-1.1.33-1.1.63 0 .46.46.66 1.68 1.04 1.96.6 3.1 1.44 3.1 3.13 0 1.33-.8 2.59-2.44 3.12z" />
              </svg>
              CashApp
            </a>
          </div>
          <DownloadInfoBanner />
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
            trackEvent={trackEvent}
          />
        )}
      </div>

      <DownloadQueueFAB
        onOpen={() => {
          setDownloadBladeOpen(true);
          trackEvent("queue_blade_opened");
        }}
        hidden={anyBladeOpen}
      />

      {!anyBladeOpen && (
        <a
          href="https://calendly.com/realshrikeproductions/technical-consultation?month=2026-02"
          target="_blank"
          rel="noopener noreferrer"
          className="book-us-fab"
          onClick={() => trackEvent("book_us_click")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Book Us
        </a>
      )}

      {initialPhotos[0] && (
        <GuestBookBlade
          open={bladeOpen}
          onToggle={() => setBladeOpen((prev) => !prev)}
          eventId={event.id}
          firstPhotoId={initialPhotos[0].id}
          trackEvent={trackEvent}
        />
      )}

      <DownloadQueueBlade
        open={downloadBladeOpen}
        onClose={() => setDownloadBladeOpen(false)}
        eventId={event.id}
        eventTitle={event.title}
        photos={initialPhotos}
        trackEvent={trackEvent}
      />
    </main>
  );
}
