import type { Metadata } from "next";
import Link from "next/link";
import { RevealSection } from "../services/ServicePageSections";
import { GraduationContent } from "./GraduationContent";

export const metadata: Metadata = {
  title: "Graduation Pictures — Shrike Media",
  description:
    "Professional graduation photography sessions. Book your date, capture the milestone, and celebrate in style.",
};

export default function GraduationPage() {
  return (
    <main id="main-content" className="min-h-screen">
      {/* ─── Hero ─── */}
      <section className="relative px-6 md:px-16 lg:px-24 pt-32 md:pt-40 pb-16 overflow-hidden">
        {/* Atmospheric gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 via-background to-background pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-10 group"
          >
            <svg
              className="h-4 w-4 transition-transform group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="text-sm">Home</span>
          </Link>

          <p className="text-amber-400/80 text-[11px] font-medium tracking-[0.3em] uppercase mb-5">
            Graduation Photography
          </p>

          <h1
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[0.95] mb-8"
            style={{ fontFamily: "var(--font-display)" }}
          >
            You Made It.
            <br />
            <span className="text-muted">Let&apos;s Make It Last.</span>
          </h1>

          <p className="text-muted text-lg md:text-xl max-w-lg leading-relaxed">
            Professional graduation portraits that capture the pride, the joy,
            and the hard-earned moment — with cinematic quality you&apos;ll
            treasure forever.
          </p>
        </div>
      </section>

      {/* Client component for Calendly */}
      <GraduationContent />

      {/* ─── What's Included ─── */}
      <section className="px-6 md:px-16 lg:px-24 py-20 border-t border-border/30">
        <div className="max-w-7xl mx-auto">
          <RevealSection>
            <p className="text-amber-400/80 text-[11px] font-medium tracking-[0.3em] uppercase mb-12">
              What&apos;s Included
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "1-Hour Photo Session",
                desc: "Dedicated time on-location or in-studio — multiple outfit changes, poses, and backdrops included.",
              },
              {
                title: "Professional Editing",
                desc: "Every image color-graded and retouched to cinematic standards. No cookie-cutter filters.",
              },
              {
                title: "Digital Gallery",
                desc: "High-resolution downloads delivered via a private online gallery you can share with family and friends.",
              },
              {
                title: "Print-Ready Files",
                desc: "Formatted for frames, canvases, and announcements. Ready to print at any size.",
              },
            ].map((item, i) => (
              <RevealSection key={item.title} delay={i * 0.1}>
                <div className="group p-6 rounded-xl bg-surface/50 border border-border/20 hover:border-amber-500/20 transition-colors duration-500">
                  <div className="h-px w-8 bg-amber-500/50 mb-5 group-hover:w-12 transition-all duration-500" />
                  <h3
                    className="text-lg font-bold mb-2 tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
