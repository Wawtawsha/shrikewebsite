"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { fetchComments } from "@/lib/gallery";
import { useDeviceId } from "@/hooks/useDeviceId";
import { isClean } from "@/lib/profanity";
import type { GalleryComment } from "@/types/gallery";

interface CommentSectionProps {
  eventId: string;
  firstPhotoId: string;
}

function getRelativeTime(dateString: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function CommentSection({ eventId, firstPhotoId }: CommentSectionProps) {
  const deviceId = useDeviceId();
  const [comments, setComments] = useState<GalleryComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const formRenderedAt = useRef(Date.now());

  useEffect(() => {
    fetchComments(eventId).then((data) => {
      setComments(data);
      setLoading(false);
    });
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Layer 1: Honeypot (silent reject)
    if (honeypot.trim()) return;

    // Layer 2: Time check (silent reject)
    const elapsed = Date.now() - formRenderedAt.current;
    if (elapsed < 2000) return;

    // Layer 3: Profanity filter (visible error)
    const trimmedBody = body.trim();
    const trimmedName = displayName.trim();
    if (!isClean(trimmedBody) || (trimmedName && !isClean(trimmedName))) {
      setError("Please rephrase your message — some words aren't allowed.");
      return;
    }

    if (!deviceId) {
      setError("Unable to post — please try refreshing.");
      return;
    }

    if (!trimmedBody || trimmedBody.length > 500) return;

    setSubmitting(true);

    const { data, error: insertError } = await supabase
      .from("photo_comments")
      .insert({
        photo_id: firstPhotoId,
        device_id: deviceId,
        author_name: displayName.trim() || "Guest",
        body: trimmedBody,
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.message?.includes("Too many comments")) {
        setError("You're posting too fast — please wait a few minutes.");
      } else {
        setError("Something went wrong — please try again.");
      }
      setSubmitting(false);
      return;
    }

    setComments((prev) => [data as GalleryComment, ...prev]);
    setBody("");
    setSubmitting(false);
    formRenderedAt.current = Date.now();
  };

  const visibleComments = showAll ? comments : comments.slice(0, 20);

  return (
    <div>
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="comment-form mb-6">
        {/* Honeypot — invisible to humans, attracts bots */}
        <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>
        <input
          type="text"
          placeholder="Your name (optional)"
          maxLength={50}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="comment-form-input w-full mb-3"
        />
        <textarea
          placeholder="Leave a comment..."
          maxLength={500}
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="comment-form-textarea w-full mb-1"
        />
        <div className="flex justify-between items-center mb-3">
          <span
            className={`text-xs ${body.length > 450 ? "char-counter-warning" : ""}`}
            style={{ color: body.length > 450 ? "var(--color-heart)" : "var(--color-subtle)" }}
          >
            {body.length}/500
          </span>
        </div>
        {error && (
          <p className="text-sm mb-3" style={{ color: "var(--color-heart)" }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={!body.trim() || submitting}
          className="rounded-full px-10 py-4 text-base font-medium text-white transition-colors disabled:opacity-50"
          style={{
            backgroundColor: "var(--color-accent)",
            minHeight: "48px",
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled)
              e.currentTarget.style.backgroundColor = "var(--color-accent-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-accent)";
          }}
        >
          {submitting ? "Posting..." : "Post Comment"}
        </button>
      </form>

      {/* Comment List */}
      {loading ? (
        <div className="text-center py-8">
          <span className="gallery-spinner inline-block" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-muted py-8">
          No comments yet — be the first!
        </p>
      ) : (
        <div className="space-y-3">
          {visibleComments.map((comment) => (
            <div key={comment.id} className="comment-card">
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-semibold text-sm" style={{ color: "var(--color-foreground)" }}>
                  {comment.author_name}
                </span>
                <span className="text-xs" style={{ color: "var(--color-subtle)" }}>
                  {getRelativeTime(comment.created_at)}
                </span>
              </div>
              <p className="text-sm" style={{ color: "var(--color-muted)", lineHeight: "1.5" }}>
                {comment.body}
              </p>
            </div>
          ))}
          {!showAll && comments.length > 20 && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full text-center py-3 text-sm font-medium"
              style={{ color: "var(--color-accent)" }}
            >
              Show {comments.length - 20} more comments
            </button>
          )}
        </div>
      )}
    </div>
  );
}
