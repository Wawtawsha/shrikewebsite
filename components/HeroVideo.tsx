"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { OptimizedImage } from "./OptimizedImage";
import { ParallaxSection } from "./ParallaxSection";

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;
    if (reducedMotion) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  }, [reducedMotion]);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background media */}
      {isMobile ? (
        <OptimizedImage
          src="/images/hero-poster.jpg"
          alt="Shrike Media showreel"
          fill
          priority
          className="object-cover"
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/hero-poster.jpg"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/videos/showreel.mp4" type="video/mp4" />
        </video>
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content with parallax depth */}
      <ParallaxSection speed={0.2} className="relative z-10 flex h-full flex-col items-center justify-center text-center">
        <h1
          className="text-6xl font-bold tracking-tight text-white md:text-8xl lg:text-9xl"
          style={{ fontFamily: "var(--font-geist)" }}
        >
          SHRIKE MEDIA
        </h1>
        <p className="mt-4 text-lg text-white/70 md:text-xl">
          Elite creative engineering
        </p>
      </ParallaxSection>
    </section>
  );
}
