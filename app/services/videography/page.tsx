import type { Metadata } from "next";
import Link from "next/link";
import { WireframeBackground } from "@/components/WireframeBackground";

export const metadata: Metadata = {
  title: "Videography",
  description: "Cinematic video production for commercials, brand films, and events.",
};

export default function VideographyPage() {
  return (
    <main id="main-content" className="min-h-screen relative" style={{ padding: "80px 64px" }}>
      <WireframeBackground />
      <div className="max-w-4xl mx-auto relative z-10">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-muted hover:text-white transition-colors mb-8 group"
        >
          <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Services
        </Link>

        <h1
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Videography
        </h1>

        <p className="text-xl text-muted mb-12 leading-relaxed max-w-2xl">
          Cinematic storytelling that captivates your audience. From concept to final cut,
          we produce videos that leave a lasting impression.
        </p>

        <div className="mb-16">
          <div className="bg-gradient-to-br from-surface via-surface to-surface/80 border border-border/50 rounded-2xl p-10 md:p-12 shadow-xl shadow-black/20 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <svg className="h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold tracking-tight">What's Included</h2>
            </div>
            <ul className="space-y-5">
              <li className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                </span>
                <div>
                  <p className="text-white font-medium text-lg">4K cinematic footage</p>
                  <p className="text-muted text-sm mt-1">Ultra-high definition for stunning clarity</p>
                </div>
              </li>
              <li className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                </span>
                <div>
                  <p className="text-white font-medium text-lg">Professional audio recording</p>
                  <p className="text-muted text-sm mt-1">Crystal-clear sound capture and mixing</p>
                </div>
              </li>
              <li className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                </span>
                <div>
                  <p className="text-white font-medium text-lg">Color grading and post-production</p>
                  <p className="text-muted text-sm mt-1">Cinematic color treatment and visual effects</p>
                </div>
              </li>
              <li className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                </span>
                <div>
                  <p className="text-white font-medium text-lg">Multiple format deliverables</p>
                  <p className="text-muted text-sm mt-1">Optimized for web, social, and broadcast</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <a
          href="https://calendly.com/realshrikeproductions/technical-consultation"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 rounded-full border-2 border-white text-white text-lg font-semibold tracking-wide transition-all duration-300 hover:bg-white hover:text-black hover:scale-105"
          style={{ padding: "16px 40px", backgroundColor: "rgba(255, 255, 255, 0.15)" }}
        >
          Book Videography Session
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>
    </main>
  );
}
