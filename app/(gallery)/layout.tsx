import type { Metadata } from "next";
import "./gallery.css";

export const metadata: Metadata = {
  title: "Event Gallery",
  description: "Browse photos from Shrike Media events.",
};

export default function GalleryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="gallery-theme min-h-screen">
      {children}
    </div>
  );
}
