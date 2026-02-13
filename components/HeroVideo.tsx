"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
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
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ marginTop: "48px" }}
        >
          <Link
            href="/services"
            className="group inline-flex items-center gap-4 rounded-full border-2 border-white text-white text-xl font-semibold tracking-wide transition-all duration-300 hover:bg-white hover:text-black hover:scale-105"
            style={{
              fontFamily: "var(--font-geist)",
              padding: "20px 56px",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
            }}
          >
            Book Now
            <svg
              className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </motion.div>
      </ParallaxSection>
    </section>
  );
}
