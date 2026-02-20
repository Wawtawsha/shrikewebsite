"use client";

import { InlineWidget } from "react-calendly";
import { useEffect, useState } from "react";

const CALENDLY_URL =
  "https://calendly.com/realshrikeproductions/graduation-photoshoot-date";

export function GraduationContent() {
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show sticky CTA after scrolling past ~500px (roughly past the hero)
      setShowSticky(window.scrollY > 500);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <section
        id="book"
        className="px-6 md:px-16 lg:px-24 py-20 border-t border-border/30"
      >
        <div className="max-w-7xl mx-auto">
          <p className="text-amber-400/80 text-[11px] font-medium tracking-[0.3em] uppercase mb-5">
            Book Your Session
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Pick Your Date
          </h2>
          <p className="text-muted text-lg mb-2 max-w-lg">
            Choose a time that works for you and we&apos;ll handle the rest.
          </p>
          <p className="text-amber-400/60 text-sm mb-8">
            Limited spots for Spring 2026 — book early to lock in your date.
          </p>
          <div className="rounded-lg overflow-hidden border border-border">
            <InlineWidget
              url={CALENDLY_URL}
              styles={{ minWidth: "320px", height: "700px" }}
              pageSettings={{
                backgroundColor: "0a0a0a",
                textColor: "ffffff",
                primaryColor: "c49a3c",
              }}
            />
          </div>
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 md:hidden transition-transform duration-300 ${
          showSticky ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-background/95 backdrop-blur-md border-t border-border/50 px-4 py-3">
          <a
            href="#book"
            className="block w-full text-center px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors duration-300"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Book Now
          </a>
        </div>
      </div>
    </>
  );
}
