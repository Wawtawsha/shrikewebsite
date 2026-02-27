import { Suspense } from "react";
import { fetchEvent, fetchPhotos } from "@/lib/gallery";
import { ThetaChiContent } from "./ThetaChiContent";

const THETA_CHI_SLUG = "theta-chi-house-party";

export default async function ThetaChiPage() {
  const event = await fetchEvent(THETA_CHI_SLUG);

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
            The Theta Chi House Party gallery is not available yet. Check back soon!
          </p>
        </div>
      </main>
    );
  }

  const { photos, totalCount, hasMore } = await fetchPhotos(event.id, 0, 50);

  return (
    <Suspense fallback={<ThetaChiFallback />}>
      <ThetaChiContent
        event={event}
        initialPhotos={photos}
        totalCount={totalCount}
        hasMore={hasMore}
      />
    </Suspense>
  );
}

function ThetaChiFallback() {
  return (
    <main className="blacklight-theme min-h-screen flex items-center justify-center px-6">
      <p style={{ color: "var(--color-muted)" }}>Loading gallery...</p>
    </main>
  );
}
