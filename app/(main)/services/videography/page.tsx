import type { Metadata } from "next";
import Link from "next/link";
import {
  RevealSection,
  PortfolioPlaceholder,
} from "../ServicePageSections";

export const metadata: Metadata = {
  title: "Videography — Shrike Media",
  description:
    "Brand films, event coverage, and narrative storytelling in stunning 4K. Book your production today.",
};

const CALENDLY_URL =
  "https://calendly.com/realshrikeproductions/technical-consultation";

export default function VideographyPage() {
  return (
    <main id="main-content" className="min-h-screen">
      {/* ─── Hero ─── */}
      <section className="relative px-6 md:px-16 lg:px-24 pt-32 md:pt-40 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-950/40 via-background to-background pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <Link
            href="/services"
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
            <span className="text-sm">All Services</span>
          </Link>

          <p className="text-sky-400/80 text-[11px] font-medium tracking-[0.3em] uppercase mb-5">
            02 — Videography
          </p>

          <h1
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[0.95] mb-8"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Motion Creates
            <br />
            <span className="text-muted">Emotion.</span>
          </h1>

          <p className="text-muted text-lg md:text-xl max-w-lg leading-relaxed">
            Brand films, event coverage, and narrative storytelling — shot in
            stunning 4K with cinematic color science and professional audio.
          </p>
        </div>
      </section>

      {/* ─── Showreel / Portfolio ─── */}
      <section className="px-6 md:px-16 lg:px-24 py-20">
        <div className="max-w-7xl mx-auto">
          <RevealSection>
            {/* 16:9 hero reel placeholder */}
            <div className="mb-4">
              <PortfolioPlaceholder
                gradient="from-sky-900/80 via-blue-950/50 to-slate-950"
                aspectRatio="16/9"
                label="Showreel"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <PortfolioPlaceholder
                gradient="from-slate-800/80 via-sky-950/40 to-slate-950"
                aspectRatio="16/9"
                label="Brand Film"
              />
              <PortfolioPlaceholder
                gradient="from-sky-800/60 via-slate-900/50 to-slate-950"
                aspectRatio="16/9"
                label="Event"
              />
              <PortfolioPlaceholder
                gradient="from-blue-900/50 via-sky-950/40 to-slate-950"
                aspectRatio="16/9"
                label="Commercial"
              />
              <PortfolioPlaceholder
                gradient="from-slate-700/60 via-sky-900/30 to-slate-950"
                aspectRatio="16/9"
                label="Narrative"
              />
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─── What's Included ─── */}
      <section className="px-6 md:px-16 lg:px-24 py-20 border-t border-border/30">
        <div className="max-w-7xl mx-auto">
          <RevealSection>
            <p className="text-sky-400/80 text-[11px] font-medium tracking-[0.3em] uppercase mb-12">
              What You Get
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "4K Cinematic Footage",
                desc: "Shot on RED and Sony cinema cameras with premium lenses. Ultra-high definition for any screen.",
              },
              {
                title: "Professional Audio",
                desc: "Wireless lavs, shotgun mics, and studio recording. Crystal-clear sound capture and mixing.",
              },
              {
                title: "Color Grading & Post",
                desc: "DaVinci Resolve color science, motion graphics, and visual effects. Broadcast-ready output.",
              },
              {
                title: "Multi-Format Delivery",
                desc: "Optimized exports for web, social (9:16, 1:1, 16:9), broadcast, and digital signage.",
              },
            ].map((item, i) => (
              <RevealSection key={item.title} delay={i * 0.1}>
                <div className="group p-6 rounded-xl bg-surface/50 border border-border/20 hover:border-sky-500/20 transition-colors duration-500">
                  <div className="h-px w-8 bg-sky-500/50 mb-5 group-hover:w-12 transition-all duration-500" />
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

      {/* ─── CTA ─── */}
      <section className="px-6 md:px-16 lg:px-24 py-20 border-t border-border/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ready to roll?
            </h2>
            <p className="text-muted mt-2 text-lg">
              Book a free consultation. We'll discuss your concept, timeline,
              and production needs.
            </p>
          </div>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 bg-accent hover:bg-accent-hover text-background font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-[1.03] shrink-0"
          >
            Book Video Production
            <svg
              className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
        </div>
      </section>
    </main>
  );
}
