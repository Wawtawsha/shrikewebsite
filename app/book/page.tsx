import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book",
  description: "Book a session with Shrike Media.",
};

export default function BookPage() {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
          Booking Coming Soon
        </h1>
        <p className="mt-4 text-lg text-muted">
          This page is under construction.
        </p>
      </div>
    </main>
  );
}
