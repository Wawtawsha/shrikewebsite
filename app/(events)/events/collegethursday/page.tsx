import { Suspense } from "react";
import { fetchEvent, fetchPhotos } from "@/lib/gallery";
import { CollegeThursdayContent } from "./CollegeThursdayContent";

const COLLEGE_THURSDAY_SLUG = "college-thursday";

export default async function CollegeThursdayPage() {
  const event = await fetchEvent(COLLEGE_THURSDAY_SLUG);

  if (!event) {
    return (
      <main id="main-content" className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md mx-auto text-center">
          <h1
            className="text-3xl font-bold mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Gallery Coming Soon
          </h1>
          <p style={{ color: "var(--color-muted)" }}>
            The College Thursday gallery is not available yet. Check back soon!
          </p>
        </div>
      </main>
    );
  }

  const { photos, totalCount, hasMore } = await fetchPhotos(event.id, 0, 50);

  return (
    <Suspense fallback={<CollegeThursdayFallback />}>
      <CollegeThursdayContent
        event={event}
        initialPhotos={photos}
        totalCount={totalCount}
        hasMore={hasMore}
      />
    </Suspense>
  );
}

function CollegeThursdayFallback() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <p style={{ color: "var(--color-muted)" }}>Loading gallery...</p>
    </main>
  );
}
