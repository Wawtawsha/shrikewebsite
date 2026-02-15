import { Suspense } from "react";
import { fetchEvent, fetchPhotos } from "@/lib/gallery";
import { SAEContent } from "./SAEContent";

const SAE_SLUG = "sae-house-party";

export default async function SAEPage() {
  const event = await fetchEvent(SAE_SLUG);

  if (!event) {
    return (
      <main id="main-content" className="blacklight-theme min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md mx-auto text-center">
          <h1
            className="text-3xl font-bold mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Gallery Coming Soon
          </h1>
          <p style={{ color: "var(--color-muted)" }}>
            The SAE House Party gallery is not available yet. Check back soon!
          </p>
        </div>
      </main>
    );
  }

  const { photos, totalCount, hasMore } = await fetchPhotos(event.id, 0, 50);

  return (
    <Suspense fallback={<SAEFallback />}>
      <SAEContent
        event={event}
        initialPhotos={photos}
        totalCount={totalCount}
        hasMore={hasMore}
      />
    </Suspense>
  );
}

function SAEFallback() {
  return (
    <main className="blacklight-theme min-h-screen flex items-center justify-center px-6">
      <p style={{ color: "var(--color-muted)" }}>Loading gallery...</p>
    </main>
  );
}
