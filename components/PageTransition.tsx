"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * PageTransition - Cinematic page transition wrapper
 *
 * Provides fade + slide animations when navigating between routes.
 * Automatically simplified for users with prefers-reduced-motion.
 *
 * Normal motion: fade + vertical slide (y: 20px → 0 → -20px)
 * Reduced motion: simple opacity crossfade only
 */
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  // Simplified transition config for reduced motion users
  const easingCurve = [0.42, 0, 0.58, 1] as const; // easeInOut cubic bezier

  if (reducedMotion) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: easingCurve }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: easingCurve }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
