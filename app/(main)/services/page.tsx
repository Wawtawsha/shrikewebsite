import type { Metadata } from "next";
import { ServicesContent } from "./ServicesContent";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Elite creative engineering across photography, videography, and technical consultation. Premium solutions for brands that demand excellence.",
};

export default function ServicesPage() {
  return (
    <main id="main-content" className="min-h-screen">
      {/* Hero */}
      <section className="px-6 md:px-16 lg:px-24 pt-36 md:pt-44 pb-20">
        <div className="max-w-7xl mx-auto">
          <p className="text-accent text-[11px] font-medium tracking-[0.3em] uppercase mb-6">
            What We Do
          </p>
          <h1
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[0.95]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Every Frame,
            <br />
            <span className="text-muted">Intentional.</span>
          </h1>
          <p className="text-muted text-lg md:text-xl mt-8 max-w-lg leading-relaxed">
            Premium photography, videography, and technical consulting for
            brands that demand more than ordinary.
          </p>
        </div>
      </section>

      {/* Service Cards */}
      <ServicesContent />

      {/* Process */}
      <section className="px-6 md:px-16 lg:px-24 py-24 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <p className="text-accent text-[11px] font-medium tracking-[0.3em] uppercase mb-16">
            The Process
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
            {[
              {
                num: "01",
                title: "Discovery",
                text: "We learn your brand, your vision, and your goals. Every project begins with understanding what sets you apart.",
              },
              {
                num: "02",
                title: "Production",
                text: "We execute with precision — professional equipment, controlled environments, and obsessive attention to every detail.",
              },
              {
                num: "03",
                title: "Delivery",
                text: "Polished, graded, and optimized for every platform. Files ready to deploy, on time, every time.",
              },
            ].map((step) => (
              <div key={step.num} className="relative">
                <span
                  className="text-[6rem] font-bold leading-none text-white/[0.03] absolute -top-6 -left-3 select-none pointer-events-none"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {step.num}
                </span>
                <div className="relative">
                  <div className="h-px w-12 bg-accent/40 mb-6" />
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
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-16 lg:px-24 py-20 border-t border-border/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Have a project in mind?
            </h2>
            <p className="text-muted mt-2 text-lg">
              Book a free consultation. No commitment, just conversation.
            </p>
          </div>
          <a
            href="https://calendly.com/realshrikeproductions/technical-consultation"
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
