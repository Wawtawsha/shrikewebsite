import { supabase } from "@/lib/supabase";
import { DownloadPageContent } from "./DownloadPageContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Download Photos | Shrike Media",
  robots: "noindex",
};

interface DownloadPageProps {
  params: Promise<{ token: string }>;
}

export default async function DownloadPage({ params }: DownloadPageProps) {
  const { token } = await params;

  // Fetch the download session
  const { data: session } = await supabase
    .from("download_sessions")
    .select("*")
    .eq("token", token)
    .single();

  if (!session) {
    return (
      <main className="download-page">
        <div className="download-page-container">
          <div className="download-page-header">
            <h1 className="download-page-brand">SHRIKE MEDIA</h1>
            <p className="download-page-brand-sub">CREATIVE ENGINEERING</p>
          </div>
          <div className="download-page-error">
            <h2>Link Not Found</h2>
            <p>This download link doesn&apos;t exist or has already been removed.</p>
          </div>
        </div>
      </main>
    );
  }

  // Check expiry
  const isExpired = new Date(session.expires_at) < new Date();

  if (isExpired) {
    return (
      <main className="download-page">
        <div className="download-page-container">
          <div className="download-page-header">
            <h1 className="download-page-brand">SHRIKE MEDIA</h1>
            <p className="download-page-brand-sub">CREATIVE ENGINEERING</p>
          </div>
          <div className="download-page-error">
            <h2>Link Expired</h2>
            <p>This download link has expired. Links are valid for 72 hours.</p>
          </div>
        </div>
      </main>
    );
  }

  // Fetch event info
  const { data: event } = await supabase
    .from("events")
    .select("title, slug")
    .eq("id", session.event_id)
    .single();

  // Fetch photos
  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .in("id", session.photo_ids)
    .order("sort_order", { ascending: true });

  return (
    <DownloadPageContent
      session={session}
      eventTitle={event?.title || "Event Photos"}
      eventSlug={event?.slug || ""}
      photos={photos || []}
    />
  );
}
