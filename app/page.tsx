import type { Metadata } from "next";
import { HeroVideo } from "@/components/HeroVideo";
import { ScrollIndicator } from "@/components/ScrollIndicator";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Elite creative engineering for brands that demand excellence. Premium photography, videography, and technical consultation.",
};

export default function Home() {
  return (
    <main id="main-content">
      <div className="relative">
        <HeroVideo />
        <ScrollIndicator />
      </div>

      {/* Below the fold — placeholder for portfolio/services sections */}
      <section className="flex min-h-screen items-center justify-center px-6">
        <p className="text-xl text-muted">More coming soon.</p>
      </section>
    </main>
  );
}
