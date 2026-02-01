import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Custom Package",
  description: "Tailored creative solutions combining photography, videography, and technical services.",
};

export default function CustomPage() {
  return (
    <main id="main-content" className="min-h-screen" style={{ padding: "80px 64px" }}>
      <div className="max-w-4xl mx-auto">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-muted hover:text-white transition-colors mb-8"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Services
        </Link>

        <h1
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Custom Package
        </h1>

        <p className="text-xl text-muted mb-12 leading-relaxed">
          Every project is unique. Let's build a custom package that combines exactly what you need —
          photography, videography, technical work, or all of the above.
        </p>

        <div className="space-y-8 mb-16">
          <div className="bg-surface border border-border rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">How It Works</h2>
            <ul className="space-y-3 text-muted">
              <li className="flex items-start gap-3">
                <span className="text-accent">&#9670;</span>
                Tell us about your project and goals
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent">&#9670;</span>
                We'll propose a tailored solution
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent">&#9670;</span>
                Flexible pricing based on scope
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent">&#9670;</span>
                Dedicated project management
              </li>
            </ul>
          </div>
        </div>

        <Link
          href="/book"
          className="inline-flex items-center gap-3 rounded-full border-2 border-white text-white text-lg font-semibold tracking-wide transition-all duration-300 hover:bg-white hover:text-black hover:scale-105"
          style={{ padding: "16px 40px", backgroundColor: "rgba(255, 255, 255, 0.15)" }}
        >
          Discuss Your Project
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </main>
  );
}
