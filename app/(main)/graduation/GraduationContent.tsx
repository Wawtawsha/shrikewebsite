"use client";

import { InlineWidget } from "react-calendly";

const CALENDLY_URL =
  "https://calendly.com/realshrikeproductions/graduation-photoshoot-date";

export function GraduationContent() {
  return (
    <section className="px-6 md:px-16 lg:px-24 py-20 border-t border-border/30">
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
        <p className="text-muted text-lg mb-8 max-w-lg">
          Choose a time that works for you and we&apos;ll handle the rest.
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
  );
}
