import type { Metadata } from "next";
import { ServicesContent } from "./ServicesContent";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Elite creative engineering across photography, videography, and technical consultation. Premium solutions for brands that demand excellence.",
};

export default function ServicesPage() {
  return (
    <main id="main-content" className="min-h-screen py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* SERV-01: Overview */}
        <h1
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Our Services
        </h1>
        <p className="text-xl text-muted mb-16 max-w-2xl leading-relaxed">
          We combine creative vision with technical precision. Whether you need
          stunning visuals or expert consulting, every engagement starts with a
          conversation about your goals.
        </p>

        {/* SERV-02, SERV-03, SERV-04: Client-side interactive content */}
        <ServicesContent />
      </div>
    </main>
  );
}
