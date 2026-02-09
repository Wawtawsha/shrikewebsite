"use client";

import { useState, memo } from "react";
import { supabase } from "@/lib/supabase";

interface LikeButtonProps {
  photoId: string;
  initialCount: number;
  isLiked: boolean;
  deviceId: string | null;
}

export const LikeButton = memo(function LikeButton({
  photoId,
  initialCount,
  isLiked,
  deviceId,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(isLiked);
  const [count, setCount] = useState(initialCount);
  const [animating, setAnimating] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!deviceId) return;

    // Optimistic update
    const wasLiked = liked;
    const prevCount = count;
    setLiked(!wasLiked);
    setCount(wasLiked ? prevCount - 1 : prevCount + 1);

    if (!wasLiked) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 300);
    }

    try {
      if (wasLiked) {
        const { error } = await supabase
          .from("photo_likes")
          .delete()
          .eq("photo_id", photoId)
          .eq("device_id", deviceId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("photo_likes")
          .insert({ photo_id: photoId, device_id: deviceId });
        if (error) throw error;
      }
    } catch {
      // Revert optimistic update
      setLiked(wasLiked);
      setCount(prevCount);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="gallery-tap-target like-button-overlay"
      aria-label={liked ? "Unlike photo" : "Like photo"}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        className={animating ? "heart-pop" : ""}
        fill={liked ? "var(--color-heart)" : "none"}
        stroke={liked ? "var(--color-heart)" : "rgba(255,255,255,0.8)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {count > 0 && (
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.9)" }}>
          {count}
        </span>
      )}
    </button>
  );
});
