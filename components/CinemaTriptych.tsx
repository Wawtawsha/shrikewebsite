"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

/** All available vertical reel videos. */
const ALL_REELS = [
  "/videos/reel-1.mp4",
  "/videos/reel-2.mp4",
  "/videos/reel-3.mp4",
  "/videos/reel-4.mp4",
  "/videos/reel-5.mp4",
  "/videos/reel-6.mp4",
  "/videos/reel-7.mp4",
];

const PANEL_LABELS = ["Events", "Portraits", "Stories"];

/** Pick a random reel that isn't the one currently playing. */
function pickNextReel(current: string): string {
  const others = ALL_REELS.filter((r) => r !== current);
  return others[Math.floor(Math.random() * others.length)];
}

/** Pick N unique random reels for initial display. */
function pickInitialReels(count: number): string[] {
  const shuffled = [...ALL_REELS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function ReelPanel({
  initialSrc,
  label,
  index,
  isVisible,
  activeIndex,
  onHover,
  onLeave,
  reducedMotion,
}: {
  initialSrc: string;
  label: string;
  index: number;
  isVisible: boolean;
  activeIndex: number | null;
  onHover: (i: number) => void;
  onLeave: () => void;
  reducedMotion: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentSrc, setCurrentSrc] = useState(initialSrc);
  const isActive = activeIndex === index;
  const isDimmed = activeIndex !== null && activeIndex !== index;

  // When a video ends, swap to a different one
  const handleEnded = useCallback(() => {
    const next = pickNextReel(currentSrc);
    setCurrentSrc(next);
  }, [currentSrc]);

  // When src changes, load and play the new video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || reducedMotion) return;
    video.load();
    if (isVisible) {
      video.play().catch(() => {});
    }
  }, [currentSrc, reducedMotion, isVisible]);

  // Initial play with staggered delay
  useEffect(() => {
    if (!videoRef.current || reducedMotion) return;
    if (isVisible) {
      const delay = index * 1200;
      const timer = setTimeout(() => {
        videoRef.current?.play().catch(() => {});
      }, delay);
      return () => clearTimeout(timer);
    } else {
      videoRef.current.pause();
    }
  }, [isVisible, index, reducedMotion]);

  // Parallax: center panel moves slightly slower than outer panels
  const parallaxOffset = index === 1 ? 0.15 : 0.25;
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [parallaxOffset * -40, parallaxOffset * 40]
  );

  return (
    <motion.div
      ref={containerRef}
      className="relative group cursor-pointer"
      initial={reducedMotion ? {} : { opacity: 0, y: 60 }}
      animate={
        isVisible
          ? { opacity: 1, y: 0 }
          : reducedMotion
            ? {}
            : { opacity: 0, y: 60 }
      }
      transition={{
        duration: 0.8,
        delay: index * 0.15,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={onLeave}
    >
      <motion.div
        style={reducedMotion ? {} : { y }}
        animate={{
          scale: isActive ? 1.03 : 1,
          opacity: isDimmed ? 0.4 : 1,
        }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Glow edge — accent gold, visible on hover */}
        <div
          className="absolute -inset-px rounded-2xl transition-opacity duration-500"
          style={{
            opacity: isActive ? 1 : 0,
            background:
              "linear-gradient(135deg, oklch(0.75 0.15 80 / 0.3), oklch(0.75 0.15 80 / 0.05), oklch(0.75 0.15 80 / 0.2))",
          }}
        />

        {/* Video container */}
        <div
          className="relative rounded-2xl overflow-hidden bg-surface"
          style={{ aspectRatio: "9/16" }}
        >
          {reducedMotion ? (
            <div className="absolute inset-0 bg-gradient-to-br from-surface-elevated to-surface flex items-center justify-center">
              <span className="text-muted text-sm tracking-widest uppercase">
                {label}
              </span>
            </div>
          ) : (
            <video
              ref={videoRef}
              muted
              playsInline
              preload="metadata"
              onEnded={handleEnded}
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={currentSrc} type="video/mp4" />
            </video>
          )}

          {/* Subtle vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

          {/* Bottom label */}
          <div className="absolute bottom-0 left-0 right-0 p-5 pointer-events-none">
            <span className="text-[11px] font-medium tracking-[0.25em] uppercase text-white/60 transition-colors duration-300 group-hover:text-accent">
              {label}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function CinemaTriptych() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });
  const reducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [initialReels] = useState(() => pickInitialReels(3));

  return (
    <section
      ref={ref}
      className="relative px-6 md:px-16 lg:px-24 overflow-hidden"
      style={{ paddingTop: "100px", paddingBottom: "100px" }}
    >
      {/* Section header */}
      <motion.div
        className="max-w-7xl mx-auto mb-16 text-center"
        initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : reducedMotion ? {} : {}}
        transition={{ duration: 0.6 }}
      >
        <p className="text-accent text-[11px] font-medium tracking-[0.3em] uppercase mb-5">
          Selected Reels
        </p>
        <h2
          className="text-4xl md:text-5xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-geist)" }}
        >
          See the Work
        </h2>
      </motion.div>

      {/* Triptych grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {PANEL_LABELS.map((label, index) => (
          <ReelPanel
            key={label}
            initialSrc={initialReels[index]}
            label={label}
            index={index}
            isVisible={isVisible}
            activeIndex={activeIndex}
            onHover={setActiveIndex}
            onLeave={() => setActiveIndex(null)}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>
    </section>
  );
}
