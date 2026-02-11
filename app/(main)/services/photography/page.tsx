import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getStorageUrl } from "@/lib/gallery";
import { RevealSection } from "../ServicePageSections";

export const metadata: Metadata = {
  title: "Photography — Shrike Media",
  description:
    "Editorial portraits, commercial product shoots, and brand imagery crafted with cinematic precision. Book your session today.",
};

// Re-shuffle photos every 60 seconds
export const revalidate = 60;

const CALENDLY_URL =
  "https://calendly.com/realshrikeproductions/technical-consultation";

/** Fetch random photos from all events for the showcase grid. */
async function getShowcasePhotos(count: number) {
  // Grab a random sample using Postgres random ordering
  const { data } = await supabase
    .from("photos")
    .select("id, storage_path, width, height")
    .order("id") // need a base order for range to work
    .limit(200); // fetch a pool to shuffle from

  if (!data || data.length === 0) return [];

  // Shuffle in JS and take what we need
  const shuffled = data.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default async function PhotographyPage() {
  const photos = await getShowcasePhotos(7);

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
              Book a free consultation. We&apos;ll discuss your vision, timeline,
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

      {/* ─── Portfolio Showcase ─── */}
      <section className="px-6 md:px-16 lg:px-24 py-20">
        <div className="max-w-7xl mx-auto">
          <RevealSection>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {/* Large featured image — col-span-2 row-span-2 */}
              {photos[0] && (
                <div
                  className="col-span-2 row-span-2 relative rounded-xl overflow-hidden bg-surface"
                  style={{ aspectRatio: "4/3" }}
                >
                  <Image
                    src={getStorageUrl(photos[0].storage_path)}
                    alt="Featured photography work"
                    width={photos[0].width}
                    height={photos[0].height}
                    className="object-cover w-full h-full"
                    sizes="(max-width: 768px) 100vw, 66vw"
                  />
                </div>
              )}
              {/* Two square images stacked on the right */}
              {photos.slice(1, 3).map((photo) => (
                <div
                  key={photo.id}
                  className="relative rounded-xl overflow-hidden bg-surface"
                  style={{ aspectRatio: "1/1" }}
                >
                  <Image
                    src={getStorageUrl(photo.storage_path)}
                    alt="Photography sample"
                    width={photo.width}
                    height={photo.height}
                    className="object-cover w-full h-full"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
              ))}
              {/* Bottom row — 3 landscape images */}
              {photos.slice(3, 6).map((photo) => (
                <div
                  key={photo.id}
                  className="relative rounded-xl overflow-hidden bg-surface"
                  style={{ aspectRatio: "3/2" }}
                >
                  <Image
                    src={getStorageUrl(photo.storage_path)}
                    alt="Photography sample"
                    width={photo.width}
                    height={photo.height}
                    className="object-cover w-full h-full"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
              ))}
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

    </main>
  );
}
