"use client";

import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Download from "yet-another-react-lightbox/plugins/download";
import "yet-another-react-lightbox/styles.css";

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
  onClose: () => void;
}

async function downloadPhoto(src: string) {
  try {
    const response = await fetch(src);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = src.split("/").pop() || "photo.jpg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch {
    window.open(src, "_blank");
  }
}

export function GalleryLightbox({ open, index, slides, onClose }: GalleryLightboxProps) {
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
      download={{ download: ({ slide }) => downloadPhoto(slide.src) }}
    />
  );
}
