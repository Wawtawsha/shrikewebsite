import type { Metadata } from "next";
import { ServicesContent } from "./ServicesContent";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Elite creative engineering across photography, videography, and technical consultation. Premium solutions for brands that demand excellence.",
};

export default function ServicesPage() {
  return (
    <main id="main-content" className="min-h-screen" style={{ padding: "80px 64px" }}>
      <div className="max-w-5xl mx-auto">
        <h1
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Our Services
        </h1>
        <p className="text-xl text-muted max-w-2xl leading-relaxed" style={{ marginBottom: '48px' }}>
          Choose the service you need.
        </p>

        <ServicesContent />
      </div>
    </main>
  );
}
