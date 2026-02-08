"use client";

import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
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

export function GalleryLightbox({ open, index, slides, onClose }: GalleryLightboxProps) {
  return (
    <Lightbox
      open={open}
      close={onClose}
      index={index}
      slides={slides}
      plugins={[Zoom]}
      zoom={{ maxZoomPixelRatio: 3 }}
      animation={{ fade: 300 }}
      carousel={{ finite: false }}
      controller={{ closeOnBackdropClick: true }}
    />
  );
}
