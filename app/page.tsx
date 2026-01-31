import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Elite creative engineering for brands that demand excellence. Premium photography, videography, and technical consultation.",
};

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight" style={{ fontFamily: 'var(--font-geist)' }}>
          Shrike Media
        </h1>
        <p className="text-xl md:text-2xl text-muted max-w-2xl mx-auto">
          Elite creative engineering for brands that demand excellence.
        </p>
      </div>
    </main>
  );
}
