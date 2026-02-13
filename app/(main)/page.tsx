import type { Metadata } from "next";
import { HeroVideo } from "@/components/HeroVideo";
import { ScrollIndicator } from "@/components/ScrollIndicator";
import { WireframeBackground } from "@/components/WireframeBackground";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { CinemaTriptych } from "@/components/CinemaTriptych";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Elite creative engineering for brands that demand excellence. Premium photography, videography, and technical consultation.",
};

export default function Home() {
  return (
    <main id="main-content">
      <div className="relative">
        <WireframeBackground />
        <HeroVideo />
        <ScrollIndicator />
      </div>

      {/* Cinema Triptych — three vertical video reels */}
      <CinemaTriptych />

      {/* Why Choose Us */}
      <WhyChooseUs />
    </main>
  );
}
