import type { Metadata } from "next";
import Link from "next/link";
import { RevealSection } from "../ServicePageSections";

export const metadata: Metadata = {
  title: "Custom Package — Shrike Media",
  description:
    "Bespoke creative solutions combining photography, videography, and technical consulting — tailored exactly to your vision.",
};

const CALENDLY_URL =
  "https://calendly.com/realshrikeproductions/technical-consultation";

const serviceBlocks = [
  {
    label: "Photography",
    items: [
      "Product & lifestyle shoots",
      "Editorial portraits",
      "Event documentation",
      "Brand imagery library",
    ],
    color: "text-amber-400/80",
    borderColor: "border-amber-500/20",
    bgColor: "bg-amber-500/5",
  },
  {
    label: "Videography",
    items: [
      "Brand films & commercials",
      "Social media content",
      "Event highlight reels",
      "Documentary storytelling",
    ],
    color: "text-sky-400/80",
    borderColor: "border-sky-500/20",
    bgColor: "bg-sky-500/5",
  },
  {
    label: "Technical",
    items: [
      "Architecture consulting",
      "Data engineering",
      "Creative technology",
      "Workflow automation",
    ],
    color: "text-emerald-400/80",
    borderColor: "border-emerald-500/20",
    bgColor: "bg-emerald-500/5",
  },
];

export default function CustomPage() {
  return (
    <main id="main-content" className="min-h-screen">
      {/* ─── Hero ─── */}
      <section className="relative px-6 md:px-16 lg:px-24 pt-32 md:pt-40 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-background to-background pointer-events-none" />

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

          <p className="text-violet-400/80 text-[11px] font-medium tracking-[0.3em] uppercase mb-5">
            04 — Custom Package
          </p>

          <h1
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[0.95] mb-8"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Your Vision,
            <br />
            <span className="text-muted">Our Craft.</span>
          </h1>

          <p className="text-muted text-lg md:text-xl max-w-lg leading-relaxed">
            Not every project fits a standard package. We build bespoke
            solutions that combine photography, videography, and technical
            expertise — tailored exactly to what you need.
          </p>
        </div>
      </section>

      {/* ─── Mix & Match Services ─── */}
      <section className="px-6 md:px-16 lg:px-24 py-20">
        <div className="max-w-7xl mx-auto">
          <RevealSection>
            <p className="text-violet-400/80 text-[11px] font-medium tracking-[0.3em] uppercase mb-4">
              Build Your Package
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Mix & Match
            </h2>
            <p className="text-muted text-lg max-w-xl mb-16">
              Pick from any combination of our services. Every custom package
              includes dedicated project management and a single point of
              contact.
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {serviceBlocks.map((block, i) => (
              <RevealSection key={block.label} delay={i * 0.1}>
                <div
                  className={`p-8 rounded-xl bg-surface/50 border ${block.borderColor} hover:bg-surface transition-colors duration-500`}
                >
                  <p
                    className={`text-[11px] font-medium tracking-[0.25em] uppercase mb-6 ${block.color}`}
                  >
                    {block.label}
                  </p>
                  <ul className="space-y-3">
                    {block.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-3 text-sm"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${block.bgColor} border ${block.borderColor}`}
                        />
                        <span className="text-foreground/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="px-6 md:px-16 lg:px-24 py-20 border-t border-border/30">
        <div className="max-w-7xl mx-auto">
          <RevealSection>
            <p className="text-violet-400/80 text-[11px] font-medium tracking-[0.3em] uppercase mb-16">
              How It Works
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
            {[
              {
                num: "01",
                title: "Tell Us Your Vision",
                text: "Share your goals, timeline, and budget. We'll listen carefully and ask the right questions.",
              },
              {
                num: "02",
                title: "We Design a Solution",
                text: "A custom proposal combining the exact services and scope your project demands.",
              },
              {
                num: "03",
                title: "Transparent Pricing",
                text: "Clear, itemized pricing with no hidden fees. You know exactly what you're paying for.",
              },
              {
                num: "04",
                title: "Dedicated Management",
                text: "One project manager, one point of contact, from kickoff through final delivery.",
              },
            ].map((step, i) => (
              <RevealSection key={step.num} delay={i * 0.1}>
                <div className="relative">
                  <span
                    className="text-[5rem] font-bold leading-none text-white/[0.03] absolute -top-4 -left-2 select-none pointer-events-none"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {step.num}
                  </span>
                  <div className="relative">
                    <div className="h-px w-10 bg-violet-500/40 mb-5" />
                    <h3
                      className="text-lg font-bold mb-2 tracking-tight"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed">
                      {step.text}
                    </p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Past Custom Projects (Social Proof) ─── */}
      <section className="px-6 md:px-16 lg:px-24 py-20 border-t border-border/30">
        <div className="max-w-7xl mx-auto">
          <RevealSection>
            <p className="text-violet-400/80 text-[11px] font-medium tracking-[0.3em] uppercase mb-4">
              Client Stories
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight mb-16"
              style={{ fontFamily: "var(--font-display)" }}
            >
              What Custom Looks Like
            </h2>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                quote:
                  "Shrike delivered a complete brand package — photos, promo video, and a custom analytics dashboard — all in one engagement. Seamless.",
                client: "Marketing Director, Tech Startup",
                services: "Photography + Videography + Technical",
              },
              {
                quote:
                  "We needed event coverage with a same-day highlight reel and social media assets. They assembled the perfect team and nailed every deliverable.",
                client: "Event Coordinator, Nonprofit",
                services: "Photography + Videography",
              },
            ].map((testimonial, i) => (
              <RevealSection key={i} delay={i * 0.12}>
                <div className="p-8 rounded-xl bg-surface/50 border border-border/20">
                  <blockquote className="text-foreground/90 text-lg leading-relaxed mb-6 italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <div>
                    <p className="text-sm font-medium">
                      {testimonial.client}
                    </p>
                    <p className="text-violet-400/60 text-xs tracking-wide mt-1">
                      {testimonial.services}
                    </p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-6 md:px-16 lg:px-24 py-20 border-t border-border/30">
        <div className="max-w-7xl mx-auto text-center">
          <RevealSection>
            <h2
              className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Let's Build Something
              <br />
              <span className="text-muted">Together.</span>
            </h2>
            <p className="text-muted text-lg max-w-md mx-auto mb-10">
              Tell us about your project. We'll put together a custom proposal
              within 48 hours.
            </p>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 bg-accent hover:bg-accent-hover text-background font-semibold px-10 py-4 rounded-full transition-all duration-300 hover:scale-[1.03]"
            >
              Discuss Your Project
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
          </RevealSection>
        </div>
      </section>
    </main>
  );
}
