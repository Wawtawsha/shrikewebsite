import type { Metadata } from "next";
import "./events.css";

export const metadata: Metadata = {
  title: "Events | Shrike Media",
  description: "Event photo galleries by Shrike Media.",
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
