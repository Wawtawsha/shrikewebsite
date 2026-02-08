import { Suspense } from "react";
import { GalleryContent } from "./GalleryContent";

export default function GalleryPage() {
  return (
    <Suspense fallback={<GalleryFallback />}>
      <GalleryContent />
    </Suspense>
  );
}

function GalleryFallback() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <p className="text-muted">Loading gallery...</p>
    </main>
  );
}
