import type { Metadata } from "next";
import Link from "next/link";
import {
  RevealSection,
  PricingCard,
  PortfolioPlaceholder,
} from "../ServicePageSections";

export const metadata: Metadata = {
  title: "Photography — Shrike Media",
  description:
    "Editorial portraits, commercial product shoots, and brand imagery crafted with cinematic precision. View packages and book your session.",
};

const CALENDLY_URL =
  "https://calendly.com/realshrikeproductions/technical-consultation";

export default function PhotographyPage() {
  return (
    <main id="main-content" className="min-h-screen">
      {/* ─── Hero ─── */}
      <section className="relative px-6 md:px-16 lg:px-24 pt-32 md:pt-40 pb-16 overflow-hidden">
        {/* Atmospheric gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 via-background to-background pointer-events-none" />

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

          <p className="text-amber-400/80 text-[11px] font-medium tracking-[0.3em] uppercase mb-5">
            01 — Photography
          </p>

          <h1
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[0.95] mb-8"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Light Is
            <br />
            <span className="text-muted">Everything.</span>
          </h1>

          <p className="text-muted text-lg md:text-xl max-w-lg leading-relaxed">
            Editorial portraits, commercial product shoots, and brand imagery
            — crafted with cinematic precision and obsessive attention to
            detail.
          </p>
        </div>
      </section>

      {/* ─── Portfolio Showcase ─── */}
      <section className="px-6 md:px-16 lg:px-24 py-20">
        <div className="max-w-7xl mx-auto">
          <RevealSection>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              <div className="col-span-2 row-span-2">
                <PortfolioPlaceholder
                  gradient="from-amber-900/80 via-orange-950/50 to-stone-950"
                  aspectRatio="4/3"
                  label="Featured Work"
                />
              </div>
              <PortfolioPlaceholder
                gradient="from-stone-800/80 via-amber-950/40 to-stone-950"
                aspectRatio="1/1"
                label="Portrait"
              />
              <PortfolioPlaceholder
                gradient="from-amber-800/60 via-stone-900/50 to-stone-950"
                aspectRatio="1/1"
                label="Product"
              />
              <PortfolioPlaceholder
                gradient="from-orange-900/50 via-amber-950/40 to-stone-950"
                aspectRatio="3/2"
                label="Editorial"
              />
              <PortfolioPlaceholder
                gradient="from-stone-700/60 via-amber-900/30 to-stone-950"
                aspectRatio="3/2"
                label="Brand"
              />
              <PortfolioPlaceholder
                gradient="from-amber-800/50 via-stone-800/40 to-stone-950"
                aspectRatio="3/2"
                label="Events"
              />
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─── What's Included ─── */}
      <section className="px-6 md:px-16 lg:px-24 py-20 border-t border-border/30">
        <div className="max-w-7xl mx-auto">
          <RevealSection>
            <p className="text-amber-400/80 text-[11px] font-medium tracking-[0.3em] uppercase mb-12">
              What You Get
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Professional Lighting & Equipment",
                desc: "Studio and location shoots with cinema-grade gear — Profoto strobes, Sony Alpha series, premium glass.",
              },
              {
                title: "Full Post-Production",
                desc: "Expert retouching, color grading, and compositing. Every image polished to commercial standards.",
              },
              {
                title: "High-Res Deliverables",
                desc: "Print-ready files in multiple formats — TIFF, JPEG, PNG. Web-optimized versions included.",
              },
              {
                title: "Commercial Usage Rights",
                desc: "Full licensing for advertising, social media, web, and print. No hidden fees or per-use charges.",
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

      {/* ─── Pricing ─── */}
      <section className="px-6 md:px-16 lg:px-24 py-20 border-t border-border/30">
        <div className="max-w-7xl mx-auto">
          <RevealSection>
            <p className="text-amber-400/80 text-[11px] font-medium tracking-[0.3em] uppercase mb-4">
              Investment
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Choose Your Package
            </h2>
            <p className="text-muted text-lg max-w-xl mb-16">
              Every package includes professional equipment, post-production,
              and full commercial licensing.
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RevealSection delay={0}>
              <PricingCard
                tier="Essential"
                price="$750"
                description="Perfect for headshots, small product lines, or personal branding."
                features={[
                  "2-hour session",
                  "1 location",
                  "15 edited images",
                  "48-hour turnaround",
                  "Web-optimized files",
                ]}
                accentColor="text-amber-400"
                ctaHref={CALENDLY_URL}
                ctaText="Get Started"
              />
            </RevealSection>
            <RevealSection delay={0.1}>
              <PricingCard
                tier="Signature"
                price="$1,800"
                description="Our most popular package for brands and commercial campaigns."
                features={[
                  "Half-day session (4 hours)",
                  "Up to 3 locations",
                  "40 edited images",
                  "Art direction included",
                  "Print-ready TIFF files",
                  "Priority 24-hour delivery",
                ]}
                accentColor="text-amber-400"
                highlighted
                ctaHref={CALENDLY_URL}
              />
            </RevealSection>
            <RevealSection delay={0.2}>
              <PricingCard
                tier="Legacy"
                price="$3,500+"
                description="Full-day production for campaigns that demand everything."
                features={[
                  "Full-day session (8+ hours)",
                  "Unlimited locations",
                  "100+ edited images",
                  "Creative direction & styling",
                  "All formats included",
                  "Same-day preview gallery",
                  "Dedicated project manager",
                ]}
                accentColor="text-amber-400"
                ctaHref={CALENDLY_URL}
                ctaText="Let's Talk"
              />
            </RevealSection>
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
              Ready to shoot?
            </h2>
            <p className="text-muted mt-2 text-lg">
              Book a free consultation. We'll discuss your vision, timeline,
              and deliverables.
            </p>
          </div>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 bg-accent hover:bg-accent-hover text-background font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-[1.03] shrink-0"
          >
            Book Photography Session
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
