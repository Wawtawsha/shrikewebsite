import { Suspense } from "react";
import type { Metadata } from "next";
import { PortfolioGrid } from "@/components/PortfolioGrid";

export const metadata: Metadata = {
  title: "Our Work",
  description:
    "A curated collection of our finest creative engineering projects. Explore premium photography, videography, and technical solutions.",
};

function GridSkeleton() {
  return (
    <div className="space-y-12">
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-28 rounded-full bg-surface animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="aspect-[4/3] bg-surface rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function WorkPage() {
  return (
    <main id="main-content" className="min-h-screen py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h1
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
          style={{ fontFamily: "var(--font-geist)" }}
        >
          Our Work
        </h1>
        <p className="text-xl text-muted mb-16 max-w-2xl">
          A curated collection of our finest creative engineering projects.
        </p>

        <Suspense fallback={<GridSkeleton />}>
          <PortfolioGrid />
        </Suspense>
      </div>
    </main>
  );
}
