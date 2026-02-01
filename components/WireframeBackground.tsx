"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Generate random but consistent node positions
const nodes = [
  { x: 10, y: 20 }, { x: 25, y: 15 }, { x: 45, y: 25 }, { x: 70, y: 10 }, { x: 85, y: 30 },
  { x: 5, y: 50 }, { x: 30, y: 45 }, { x: 55, y: 55 }, { x: 75, y: 48 }, { x: 92, y: 52 },
  { x: 15, y: 75 }, { x: 35, y: 80 }, { x: 50, y: 70 }, { x: 68, y: 85 }, { x: 88, y: 72 },
  { x: 20, y: 90 }, { x: 60, y: 92 }, { x: 80, y: 88 },
];

// Create connections between nearby nodes
const connections = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [1, 6], [2, 7], [3, 8], [4, 9],
  [5, 6], [6, 7], [7, 8], [8, 9],
  [5, 10], [6, 11], [7, 12], [8, 13], [9, 14],
  [10, 11], [11, 12], [12, 13], [13, 14],
  [10, 15], [12, 16], [14, 17],
  [15, 16], [16, 17],
  [2, 12], [7, 13], [6, 12],
];

export function WireframeBackground() {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Gradient for lines */}
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.1" />
            <stop offset="50%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="white" stopOpacity="0.1" />
          </linearGradient>

          {/* Glow filter for nodes */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection lines */}
        {connections.map(([from, to], i) => (
          <motion.line
            key={`line-${i}`}
            x1={`${nodes[from].x}%`}
            y1={`${nodes[from].y}%`}
            x2={`${nodes[to].x}%`}
            y2={`${nodes[to].y}%`}
            stroke="url(#lineGradient)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 1, 0],
              opacity: [0, 0.4, 0.4, 0],
            }}
            transition={{
              duration: 6 + (i % 4) * 2,
              delay: (i % 8) * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Nodes */}
        {nodes.map((node, i) => (
          <motion.circle
            key={`node-${i}`}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r="3"
            fill="white"
            filter="url(#glow)"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.8, 0.8, 0],
              scale: [0, 1, 1, 0],
            }}
            transition={{
              duration: 4 + (i % 3) * 1.5,
              delay: (i % 6) * 0.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Floating accent rings */}
        <motion.circle
          cx="20%"
          cy="30%"
          r="80"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          opacity="0.15"
          animate={{
            r: [80, 120, 80],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.circle
          cx="75%"
          cy="65%"
          r="60"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          opacity="0.15"
          animate={{
            r: [60, 100, 60],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 10,
            delay: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>
    </div>
  );
}
