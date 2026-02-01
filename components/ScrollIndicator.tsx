"use client";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { motion } from "motion/react";

export function ScrollIndicator() {
  const reducedMotion = useReducedMotion();

  const handleClick = () => {
    const hero = document.querySelector("section");
    if (hero?.nextElementSibling) {
      hero.nextElementSibling.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Static version for reduced motion
  if (reducedMotion) {
    return (
      <button
        onClick={handleClick}
        aria-label="Scroll down"
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/60 transition-opacity hover:text-white/90"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    );
  }

  return (
    <motion.button
      onClick={handleClick}
      aria-label="Scroll down"
      className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/60 transition-opacity hover:text-white/90"
      animate={{ y: [0, 8, 0] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </motion.button>
  );
}
