import type { Metadata } from "next";
import { GraduationContent } from "./GraduationContent";

export const metadata: Metadata = {
  title: "Graduation Pictures — Shrike Media",
  description:
    "Professional graduation photography sessions. Book your date, capture the milestone, and celebrate in style.",
};

export default function GraduationPage() {
  return (
    <main id="main-content" className="min-h-screen">
      {/* Client component for Calendly */}
      <GraduationContent />
    </main>
  );
}
