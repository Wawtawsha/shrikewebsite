"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const services = [
  {
    id: "photography",
    number: "01",
    title: "Photography",
    description:
      "Editorial portraits, commercial product shoots, and brand imagery — crafted with cinematic precision.",
    href: "/services/photography",
    gradient: "from-amber-900/70 via-orange-950/30 to-transparent",
    accentColor: "bg-amber-500",
    colSpan: "md:col-span-7",
  },
  {
    id: "videography",
    number: "02",
    title: "Videography",
    description:
      "Brand films, event coverage, and narrative storytelling in stunning 4K.",
    href: "/services/videography",
    gradient: "from-sky-900/60 via-blue-950/30 to-transparent",
    accentColor: "bg-sky-500",
    colSpan: "md:col-span-5",
  },
  {
    id: "technical",
    number: "03",
    title: "Technical Consultation",
    description:
      "Software architecture, data engineering, and creative technology expertise.",
    href: "/services/technical",
    gradient: "from-emerald-900/60 via-teal-950/30 to-transparent",
    accentColor: "bg-emerald-500",
    colSpan: "md:col-span-5",
  },
  {
    id: "custom",
    number: "04",
    title: "Custom Package",
    description:
      "Bespoke solutions combining any of our services — tailored exactly to your vision.",
    href: "/services/custom",
    gradient: "from-violet-900/60 via-purple-950/30 to-transparent",
    accentColor: "bg-violet-500",
    colSpan: "md:col-span-7",
  },
];

function ServiceCard({
  service,
  index,
}: {
  service: (typeof services)[0];
  index: number;
}) {
  const { ref, isVisible } = useScrollReveal();
  const reducedMotion = useReducedMotion();

  return (
    <div
      ref={ref}
      className={service.colSpan}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.7s ease-out ${index * 0.12}s, transform 0.7s ease-out ${index * 0.12}s`,
      }}
    >
      <motion.div
        whileHover={reducedMotion ? {} : { scale: 1.01, y: -4 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="h-full"
      >
        <Link
          href={service.href}
          className="group relative block h-full min-h-[320px] md:min-h-[440px] overflow-hidden rounded-2xl bg-surface border border-border/30 hover:border-border/60 transition-colors duration-500 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          {/* Gradient atmosphere */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-70 group-hover:opacity-100 transition-opacity duration-700`}
          />

          {/* Large background number */}
          <span
            className="absolute top-4 right-6 md:top-6 md:right-8 text-[7rem] md:text-[9rem] font-bold leading-none text-white/[0.025] select-none pointer-events-none transition-all duration-700 group-hover:text-white/[0.05] group-hover:translate-x-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {service.number}
          </span>

          {/* Bottom gradient for text legibility */}
          <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

          {/* Content pinned to bottom */}
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
            {/* Accent line — grows on hover */}
            <div
              className={`${service.accentColor} h-[2px] w-0 group-hover:w-12 transition-all duration-500 ease-out mb-5`}
            />

            <p className="text-accent/70 text-[11px] font-medium tracking-[0.25em] uppercase mb-2">
              {service.number}
            </p>

            <h2
              className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {service.title}
            </h2>

            <p className="text-white/50 text-sm md:text-[15px] leading-relaxed max-w-sm mb-5 group-hover:text-white/65 transition-colors duration-500">
              {service.description}
            </p>

            {/* Explore CTA */}
            <div className="flex items-center gap-2 text-white/50 group-hover:text-accent transition-colors duration-300">
              <span className="text-xs font-medium tracking-wider uppercase">
                Explore
              </span>
              <svg
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}

export function ServicesContent() {
  return (
    <section className="px-6 md:px-16 lg:px-24 pb-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
        {services.map((service, index) => (
          <ServiceCard key={service.id} service={service} index={index} />
        ))}
      </div>
    </section>
  );
}
