import type { Metadata } from "next";
import "./events.css";

export const metadata: Metadata = {
  title: "2016 Night at Press Club",
  description: "Photos from the 2016 Night at Press Club event.",
};

export default function EventsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="events-theme min-h-screen">
      {children}
    </div>
  );
}
