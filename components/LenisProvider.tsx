"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import "lenis/dist/lenis.css";

/**
 * LenisProvider - Smooth scroll wrapper using Lenis
 *
 * Provides inertial/momentum scrolling site-wide for enhanced UX.
 * Automatically disabled for users with prefers-reduced-motion.
 *
 * Config:
 * - lerp: 0.1 (smoothing factor, lower = smoother but slower)
 * - duration: 1.2 (scroll animation duration)
 * - smoothWheel: true (smooth trackpad/mouse wheel)
 */
export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // Skip Lenis initialization if user prefers reduced motion
    if (reducedMotion) {
      return;
    }

    // Initialize Lenis with cinematic smooth scroll config
    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    // RAF loop for smooth scroll updates
    function raf(time: number) {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    }

    rafRef.current = requestAnimationFrame(raf);

    // Cleanup on unmount
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      lenis.destroy();
    };
  }, [reducedMotion]);

  // Pass-through children (no extra DOM wrapper)
  return <>{children}</>;
}
