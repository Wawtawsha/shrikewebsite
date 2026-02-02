import type { Metadata } from "next";
import Link from "next/link";
import { WireframeBackground } from "@/components/WireframeBackground";

export const metadata: Metadata = {
  title: "Custom Package",
  description: "Tailored creative solutions combining photography, videography, and technical services.",
};

export default function CustomPage() {
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
          Custom Package
        </h1>

        <p className="text-xl text-muted mb-12 leading-relaxed max-w-2xl">
          Every project is unique. Let's build a custom package that combines exactly what you need —
          photography, videography, technical work, or all of the above.
        </p>

        <div className="mb-16">
          <div className="bg-gradient-to-br from-surface via-surface to-surface/80 border border-border/50 rounded-2xl p-10 md:p-12 shadow-xl shadow-black/20 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <svg className="h-7 w-7 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
            </div>
            <ul className="space-y-5">
              <li className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center mt-0.5">
                  <span className="text-purple-400 font-bold text-sm">1</span>
                </span>
                <div>
                  <p className="text-white font-medium text-lg">Tell us about your project and goals</p>
                  <p className="text-muted text-sm mt-1">Share your vision and requirements</p>
                </div>
              </li>
              <li className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center mt-0.5">
                  <span className="text-purple-400 font-bold text-sm">2</span>
                </span>
                <div>
                  <p className="text-white font-medium text-lg">We'll propose a tailored solution</p>
                  <p className="text-muted text-sm mt-1">Custom-crafted approach for your needs</p>
                </div>
              </li>
              <li className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center mt-0.5">
                  <span className="text-purple-400 font-bold text-sm">3</span>
                </span>
                <div>
                  <p className="text-white font-medium text-lg">Flexible pricing based on scope</p>
                  <p className="text-muted text-sm mt-1">Transparent costs that fit your budget</p>
                </div>
              </li>
              <li className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center mt-0.5">
                  <span className="text-purple-400 font-bold text-sm">4</span>
                </span>
                <div>
                  <p className="text-white font-medium text-lg">Dedicated project management</p>
                  <p className="text-muted text-sm mt-1">Your personal point of contact throughout</p>
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
          Discuss Your Project
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>
    </main>
  );
}
