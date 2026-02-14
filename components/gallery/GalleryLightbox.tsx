"use client";

import { useCallback } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Download from "yet-another-react-lightbox/plugins/download";
import "yet-another-react-lightbox/styles.css";
import { downloadWebSize } from "@/lib/download";
import { useDownloadQueue } from "./DownloadQueueContext";
import type { GalleryPhoto } from "@/types/gallery";

interface Slide {
  src: string;
  width: number;
  height: number;
  alt?: string;
}

interface GalleryLightboxProps {
  open: boolean;
  index: number;
  slides: Slide[];
  photos: GalleryPhoto[];
  onClose: () => void;
  trackEvent?: (name: string, data?: Record<string, unknown>) => void;
}

export function GalleryLightbox({ open, index, slides, photos, onClose, trackEvent }: GalleryLightboxProps) {
  const { isSelected, togglePhoto } = useDownloadQueue();

  const handleDownload = useCallback(
    ({ slide }: { slide: { src: string } }) => {
      const filename = slide.src.split("/").pop() || "photo.jpg";
      const idx = slides.findIndex((s) => s.src === slide.src);
      trackEvent?.("instant_download", { photo_id: photos[idx]?.id });
      downloadWebSize(slide.src, filename);
    },
    [slides, photos, trackEvent]
  );

  return (
    <Lightbox
      open={open}
      close={onClose}
      index={index}
      slides={slides}
      plugins={[Zoom, Download]}
      zoom={{ maxZoomPixelRatio: 3 }}
      animation={{ fade: 300 }}
      carousel={{ finite: false }}
      controller={{ closeOnBackdropClick: true }}
      download={{ download: handleDownload }}
      toolbar={{
        buttons: [
          <button
            key="queue-toggle"
            type="button"
            className="yarl__button lightbox-queue-btn"
            onClick={() => {
              if (index >= 0 && index < photos.length) {
                const photo = photos[index];
                togglePhoto(photo.id);
                if (isSelected(photo.id)) {
                  trackEvent?.("photo_dequeued", { photo_id: photo.id });
                } else {
                  trackEvent?.("photo_queued", { photo_id: photo.id });
                }
              }
            }}
            aria-label={
              index >= 0 && index < photos.length && isSelected(photos[index].id)
                ? "Remove from download queue"
                : "Add to download queue"
            }
          >
            {index >= 0 && index < photos.length && isSelected(photos[index].id) ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--color-accent)" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
          </button>,
          "download",
          "close",
        ],
      }}
    />
  );
}
