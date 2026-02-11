import type { Metadata } from "next";
import Link from "next/link";
import { RevealSection, PricingCard } from "../ServicePageSections";

export const metadata: Metadata = {
  title: "Technical Consultation — Shrike Media",
  description:
    "Software architecture, data engineering, and creative technology expertise. From system design to implementation guidance.",
};

const CALENDLY_URL =
  "https://calendly.com/realshrikeproductions/technical-consultation";

export default function TechnicalPage() {
  return (
    <main id="main-content" className="min-h-screen">
      {/* ─── Hero ─── */}
      <section className="relative px-6 md:px-16 lg:px-24 pt-32 md:pt-40 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-background to-background pointer-events-none" />

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

          <p className="text-emerald-400/80 text-[11px] font-medium tracking-[0.3em] uppercase mb-5">
            03 — Technical Consultation
          </p>

          <h1
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[0.95] mb-8"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Build
            <br />
            <span className="text-muted">Smarter.</span>
          </h1>

          <p className="text-muted text-lg md:text-xl max-w-lg leading-relaxed">
            Software architecture, data engineering, and creative technology
            expertise — from the same team that builds production systems for
            Fortune 500 clients.
          </p>
        </div>
      </section>

      {/* ─── Expertise Areas ─── */}
      <section className="px-6 md:px-16 lg:px-24 py-20">
        <div className="max-w-7xl mx-auto">
          <RevealSection>
            <p className="text-emerald-400/80 text-[11px] font-medium tracking-[0.3em] uppercase mb-12">
              Areas of Expertise
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Software Architecture",
                desc: "System design, API strategy, cloud infrastructure, and scalability planning. We architect systems that perform under pressure.",
                tags: ["React", "Next.js", "Node.js", "TypeScript", "AWS", "Azure"],
              },
              {
                title: "Data Engineering",
                desc: "ETL pipelines, data warehousing, real-time analytics, and BI dashboards. Turn raw data into actionable intelligence.",
                tags: ["Microsoft Fabric", "Spark", "SQL", "Power BI", "dbt"],
              },
              {
                title: "Creative Technology",
                desc: "Interactive installations, generative art, AR/VR experiences, and custom tools for creative workflows.",
                tags: ["Three.js", "WebGL", "Unreal Engine", "AI/ML", "IoT"],
              },
              {
                title: "DevOps & Automation",
                desc: "CI/CD pipelines, infrastructure-as-code, monitoring, and workflow automation. Ship faster with confidence.",
                tags: ["Docker", "GitHub Actions", "Terraform", "Azure DevOps"],
              },
            ].map((area, i) => (
              <RevealSection key={area.title} delay={i * 0.1}>
                <div className="group p-8 rounded-xl bg-surface/50 border border-border/20 hover:border-emerald-500/20 transition-colors duration-500">
                  <div className="h-px w-8 bg-emerald-500/50 mb-6 group-hover:w-12 transition-all duration-500" />
                  <h3
                    className="text-xl font-bold mb-3 tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {area.title}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed mb-5">
                    {area.desc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {area.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-medium tracking-wide text-emerald-400/60 bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
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
            <p className="text-emerald-400/80 text-[11px] font-medium tracking-[0.3em] uppercase mb-4">
              Investment
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Engagement Models
            </h2>
            <p className="text-muted text-lg max-w-xl mb-16">
              Flexible consulting structures designed around your timeline
              and budget. Start with a single session or retain ongoing support.
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RevealSection delay={0}>
              <PricingCard
                tier="Advisory"
                price="$200/hr"
                description="On-demand expert guidance for specific technical challenges."
                features={[
                  "1-hour minimum sessions",
                  "Architecture review",
                  "Code review & audit",
                  "Technology recommendations",
                  "Follow-up documentation",
                ]}
                accentColor="text-emerald-400"
                ctaHref={CALENDLY_URL}
                ctaText="Book Session"
              />
            </RevealSection>
            <RevealSection delay={0.1}>
              <PricingCard
                tier="Project"
                price="$5,000+"
                description="Dedicated consulting for defined projects with clear deliverables."
                features={[
                  "Scoped project engagement",
                  "Architecture & design docs",
                  "Implementation guidance",
                  "Weekly check-ins",
                  "Knowledge transfer sessions",
                  "30-day post-project support",
                ]}
                accentColor="text-emerald-400"
                highlighted
                ctaHref={CALENDLY_URL}
              />
            </RevealSection>
            <RevealSection delay={0.2}>
              <PricingCard
                tier="Retainer"
                price="$3,000/mo"
                description="Ongoing technical partnership with priority access and guaranteed availability."
                features={[
                  "20 hours/month included",
                  "Priority response (< 4 hrs)",
                  "Slack/Teams integration",
                  "Monthly strategy reviews",
                  "Team training sessions",
                  "Architecture governance",
                  "Rollover unused hours",
                ]}
                accentColor="text-emerald-400"
                ctaHref={CALENDLY_URL}
                ctaText="Let's Talk"
              />
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ─── Process ─── */}
      <section className="px-6 md:px-16 lg:px-24 py-20 border-t border-border/30">
        <div className="max-w-7xl mx-auto">
          <RevealSection>
            <p className="text-emerald-400/80 text-[11px] font-medium tracking-[0.3em] uppercase mb-16">
              How We Work
            </p>
          </RevealSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
            {[
              {
                num: "01",
                title: "Diagnose",
                text: "We audit your current architecture, identify bottlenecks, and map out the landscape before prescribing solutions.",
              },
              {
                num: "02",
                title: "Design",
                text: "Collaborative architecture sessions produce clear documentation, diagrams, and implementation roadmaps you can actually follow.",
              },
              {
                num: "03",
                title: "Deliver",
                text: "Hands-on guidance through implementation. We don't just advise — we pair with your team to ensure the architecture ships.",
              },
            ].map((step, i) => (
              <RevealSection key={step.num} delay={i * 0.12}>
                <div className="relative">
                  <span
                    className="text-[6rem] font-bold leading-none text-white/[0.03] absolute -top-6 -left-3 select-none pointer-events-none"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {step.num}
                  </span>
                  <div className="relative">
                    <div className="h-px w-12 bg-emerald-500/40 mb-6" />
                    <h3
                      className="text-xl font-bold mb-3 tracking-tight"
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

      {/* ─── CTA ─── */}
      <section className="px-6 md:px-16 lg:px-24 py-20 border-t border-border/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Have a technical challenge?
            </h2>
            <p className="text-muted mt-2 text-lg">
              Book a free 30-minute discovery call. No sales pitch — just
              technical conversation.
            </p>
          </div>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 bg-accent hover:bg-accent-hover text-background font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-[1.03] shrink-0"
          >
            Book Consultation
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
