"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ParallaxSectionProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

/**
 * Parallax wrapper that creates scroll-linked depth effect.
 * Uses Motion's useScroll + useTransform for GPU-accelerated transforms.
 * Respects prefers-reduced-motion (no parallax when enabled).
 *
 * @param speed - Parallax intensity (default: 0.3)
 * @param className - Additional CSS classes
 */
export function ParallaxSection({
  children,
  speed = 0.3,
  className = ""
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [speed * -50, speed * 50]);

  // Reduced motion: render children without parallax wrapper
  if (reducedMotion) {
    return <div ref={ref} className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}
