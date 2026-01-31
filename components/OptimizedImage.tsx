"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

type OptimizedImageProps = Omit<ImageProps, "placeholder" | "blurDataURL"> & {
  /**
   * Optional base64 blur placeholder. If not provided, a subtle gray placeholder is used.
   */
  blurDataURL?: string;
};

/**
 * OptimizedImage wraps next/image with:
 * - Automatic blur placeholder (base64)
 * - Lazy loading by default
 * - AVIF/WebP format support (configured in next.config.ts)
 * - Fade-in animation on load
 */
export function OptimizedImage({
  blurDataURL,
  className = "",
  onLoad,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Default blur placeholder: 1x1 gray pixel
  const defaultBlurDataURL =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mM8c+bMfwAGgQLp3s0LoQAAAABJRU5ErkJggg==";

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  return (
    <Image
      {...props}
      className={`${className} transition-opacity duration-500 ${
        isLoaded ? "opacity-100" : "opacity-0"
      }`}
      placeholder="blur"
      blurDataURL={blurDataURL || defaultBlurDataURL}
      onLoad={handleLoad}
      loading={props.priority ? undefined : "lazy"}
    />
  );
}
