"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function ScribbleNote({
  message,
  delay = 5000,
}: {
  message: string;
  delay?: number;
}) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (dismissed) return null;

  return (
    <div
      className="fixed right-6 bottom-24 md:right-10 md:bottom-28 z-40 max-w-[260px] cursor-pointer"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) rotate(-2deg)" : "translateY(16px) rotate(-2deg)",
        transition: reducedMotion ? "none" : "opacity 0.8s ease-out, transform 0.8s ease-out",
        pointerEvents: visible ? "auto" : "none",
      }}
      onClick={() => setDismissed(true)}
      role="status"
      aria-live="polite"
    >
      {/* Note card */}
      <div
        className="relative bg-amber-50/95 backdrop-blur-sm rounded-lg px-5 py-4 shadow-xl"
        style={{ transform: "rotate(1deg)" }}
      >
        <p
          className="text-amber-950 text-[17px] leading-relaxed"
          style={{ fontFamily: "var(--font-caveat)" }}
        >
          {message}
        </p>

        {/* Down arrow doodle */}
        <div
          className="mt-2 text-amber-700/70 text-2xl text-center"
          style={{ fontFamily: "var(--font-caveat)" }}
        >
          &#8595;
        </div>

        {/* Dismiss hint */}
        <p className="text-amber-800/40 text-[10px] text-right mt-1 tracking-wide">
          tap to dismiss
        </p>
      </div>
    </div>
  );
}
