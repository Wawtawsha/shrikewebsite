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
 * Pricing tier card with hover lift effect.
 */
export function PricingCard({
  tier,
  price,
  description,
  features,
  accentColor,
  highlighted = false,
  ctaHref,
  ctaText = "Book Now",
}: {
  tier: string;
  price: string;
  description: string;
  features: string[];
  accentColor: string;
  highlighted?: boolean;
  ctaHref: string;
  ctaText?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl p-8 md:p-10 transition-all duration-500 group ${
        highlighted
          ? "bg-surface-elevated border-2 border-accent/30 shadow-2xl shadow-accent/5"
          : "bg-surface border border-border/40 hover:border-border/70"
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-accent text-background text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-1.5 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      <p
        className={`text-xs font-medium tracking-[0.25em] uppercase mb-4 ${accentColor}`}
      >
        {tier}
      </p>

      <p
        className="text-4xl md:text-5xl font-bold tracking-tight mb-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {price}
      </p>

      <p className="text-muted text-sm mb-8">{description}</p>

      <div className="h-px bg-border/50 mb-8" />

      <ul className="space-y-4 mb-10">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <svg
              className={`h-5 w-5 flex-shrink-0 mt-0.5 ${accentColor}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-foreground/80">{feature}</span>
          </li>
        ))}
      </ul>

      <a
        href={ctaHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`block w-full text-center font-semibold py-3.5 rounded-full transition-all duration-300 ${
          highlighted
            ? "bg-accent text-background hover:bg-accent-hover"
            : "border border-border/60 text-foreground hover:bg-white/5 hover:border-border"
        }`}
      >
        {ctaText}
      </a>
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
