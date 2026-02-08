"use client";

import { useSearchParams } from "next/navigation";

export function GalleryContent() {
  const searchParams = useSearchParams();
  const eventSlug = searchParams.get("event");

  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-2xl mx-auto text-center">
        <h1
          className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {eventSlug ? "Event Gallery" : "Gallery"}
        </h1>
        {eventSlug && (
          <p className="text-lg text-muted mb-6">
            {eventSlug.replace(/-/g, " ")}
          </p>
        )}
        <p className="text-muted">
          Gallery coming soon. Check back after the event!
        </p>
      </div>
    </main>
  );
}
