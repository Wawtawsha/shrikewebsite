"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { ReactNode } from "react";

/**
 * Scroll-reveal wrapper for service page sections.
 * Each child fades up when it enters the viewport.
 */
export function RevealSection({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease-out ${delay}s, transform 0.7s ease-out ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Portfolio placeholder image with cinematic gradient.
 */
export function PortfolioPlaceholder({
  gradient,
  aspectRatio = "3/2",
  label,
}: {
  gradient: string;
  aspectRatio?: string;
  label?: string;
}) {
  return (
    <div
      className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${gradient}`}
      style={{ aspectRatio }}
    >
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />
      {label && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/20 text-sm font-medium tracking-wider uppercase">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
