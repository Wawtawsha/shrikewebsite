"use client";

import { useState, useEffect } from "react";
import { getStorageUrl } from "@/lib/gallery";
import { downloadFullRes } from "@/lib/download";
import { supabase } from "@/lib/supabase";
import type { GalleryPhoto } from "@/types/gallery";

interface DownloadSession {
  id: string;
  token: string;
  event_id: string;
  email: string;
  photo_ids: string[];
  expires_at: string;
  download_count: number;
}

interface DownloadPageContentProps {
  session: DownloadSession;
  eventTitle: string;
  eventSlug: string;
  photos: GalleryPhoto[];
}

export function DownloadPageContent({ session, eventTitle, photos }: DownloadPageContentProps) {
  const [downloading, setDownloading] = useState<Set<string>>(new Set());
  const [zipping, setZipping] = useState(false);

  // Track page visit and increment download count
  useEffect(() => {
    supabase
      .from("download_sessions")
      .update({ download_count: session.download_count + 1 })
      .eq("id", session.id)
      .then(() => {});
  }, [session.id, session.download_count]);

  async function handleDownload(photo: GalleryPhoto) {
    setDownloading((prev) => new Set(prev).add(photo.id));
    const url = getStorageUrl(photo.storage_path);
    await downloadFullRes(url, photo.filename);
    setDownloading((prev) => {
      const next = new Set(prev);
      next.delete(photo.id);
      return next;
    });
  }

  async function handleDownloadAll() {
    setZipping(true);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();

      await Promise.all(
        photos.map(async (photo) => {
          const url = getStorageUrl(photo.storage_path);
          const response = await fetch(url);
          const blob = await response.blob();
          zip.file(photo.filename || `photo-${photo.id}.jpg`, blob);
        })
      );

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${eventTitle.replace(/[^a-zA-Z0-9]/g, "-")}-photos.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("ZIP download failed:", err);
    }
    setZipping(false);
  }

  return (
    <main className="download-page">
      <div className="download-page-container">
        <div className="download-page-header">
          <h1 className="download-page-brand">SHRIKE MEDIA</h1>
          <p className="download-page-brand-sub">CREATIVE ENGINEERING</p>
        </div>

        <h2 className="download-page-title">{eventTitle}</h2>
        <p className="download-page-subtitle">
          {photos.length} photo{photos.length !== 1 ? "s" : ""} &mdash; Full Resolution
        </p>

        <button
          className="download-page-zip-btn"
          onClick={handleDownloadAll}
          disabled={zipping}
          type="button"
        >
          {zipping ? (
            <>
              <span className="gallery-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              Creating ZIP...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download All as ZIP
            </>
          )}
        </button>

        <div className="download-page-grid">
          {photos.map((photo) => (
            <div key={photo.id} className="download-page-card">
              <img
                src={getStorageUrl(photo.thumb_path)}
                alt=""
                className="download-page-card-img"
                loading="lazy"
              />
              <button
                className="download-page-card-btn"
                onClick={() => handleDownload(photo)}
                disabled={downloading.has(photo.id)}
                type="button"
              >
                {downloading.has(photo.id) ? (
                  <span className="gallery-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                )}
                Download
              </button>
            </div>
          ))}
        </div>

        <p className="download-page-footer">
          Photos by Shrike Media &mdash; shrikemedia.com
        </p>
      </div>
    </main>
  );
}
