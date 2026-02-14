"use client";

import { useState, useCallback, type FormEvent } from "react";
import { useDownloadQueue } from "./DownloadQueueContext";
import { supabase } from "@/lib/supabase";
import { getStorageUrl } from "@/lib/gallery";
import type { GalleryPhoto } from "@/types/gallery";

interface DownloadQueueBladeProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  photos: GalleryPhoto[];
  trackEvent?: (name: string, data?: Record<string, unknown>) => void;
}

type SubmitStatus = "idle" | "submitting" | "error";

export function DownloadQueueBlade({ open, onClose, eventId, photos, trackEvent }: DownloadQueueBladeProps) {
  const { selectedPhotos, removePhoto, clearAll, count } = useDownloadQueue();
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [email, setEmail] = useState("");

  const selectedPhotosList = photos.filter((p) => selectedPhotos.has(p.id));

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!email || count === 0) return;

      setStatus("submitting");
      trackEvent?.("download_email_submitted", {
        email_domain: email.split("@")[1],
        photo_count: count,
      });

      try {
        const { data, error } = await supabase.from("download_sessions").insert({
          event_id: eventId,
          email,
          photo_ids: Array.from(selectedPhotos),
        }).select("token").single();

        if (error || !data) throw new Error("Failed to create download session");

        clearAll();
        window.location.href = `/events/download/${data.token}`;
      } catch {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    },
    [email, count, eventId, selectedPhotos, clearAll, trackEvent]
  );

  return (
    <aside
      className={`download-queue-blade ${open ? "download-queue-blade--open" : ""}`}
      aria-hidden={!open}
    >
      <div className="guestbook-blade-header">
        <h2
          className="text-lg font-semibold tracking-wide"
          style={{ fontFamily: "var(--font-display), Georgia, serif", letterSpacing: "0.04em" }}
        >
          Full Resolution
        </h2>
        <button
          onClick={onClose}
          className="guestbook-blade-close"
          aria-label="Close download queue"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="guestbook-blade-content">
        {count === 0 ? (
          <div className="download-queue-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-subtle)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M12 8v8M8 12h8" />
            </svg>
            <p style={{ color: "var(--color-muted)", fontSize: "0.875rem", textAlign: "center" }}>
              Tap the <strong>+</strong> on any photo to add it to your queue.
            </p>
          </div>
        ) : (
          <>
            <div className="download-queue-thumbs">
              {selectedPhotosList.map((photo) => (
                <div key={photo.id} className="download-queue-thumb">
                  <img
                    src={getStorageUrl(photo.thumb_path)}
                    alt=""
                    className="download-queue-thumb-img"
                  />
                  <button
                    className="download-queue-thumb-remove"
                    onClick={() => removePhoto(photo.id)}
                    aria-label="Remove photo from queue"
                    type="button"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="download-queue-form">
              <p className="download-queue-subtitle">
                Enter your email to download {count} photo{count !== 1 ? "s" : ""} in full resolution.
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="lead-form-input"
                style={{ width: "100%" }}
              />
              <button
                type="submit"
                className="lead-form-submit"
                disabled={status === "submitting"}
              >
                {status === "submitting"
                  ? "Loading..."
                  : status === "error"
                    ? "Something went wrong — try again"
                    : "Get Download Link"}
              </button>
            </form>

            <button
              type="button"
              className="download-queue-clear"
              onClick={clearAll}
            >
              Clear all
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
