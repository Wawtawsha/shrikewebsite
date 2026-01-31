"use client";

import type { Project } from "@/types/portfolio";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const categoryConfig = {
  photography: {
    aspect: "aspect-[4/3]",
    overlay: "bg-amber-900/60",
    badge: "bg-amber-600/80",
  },
  videography: {
    aspect: "aspect-video",
    overlay: "bg-blue-900/60",
    badge: "bg-blue-600/80",
  },
  technical: {
    aspect: "aspect-square",
    overlay: "bg-emerald-900/60",
    badge: "bg-emerald-600/80",
  },
} as const;

interface PortfolioCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  index: number;
}

export function PortfolioCard({ project, onSelect, index }: PortfolioCardProps) {
  const { ref, isVisible } = useScrollReveal();
  const config = categoryConfig[project.category];

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(24px)",
        transitionDelay: `${index * 100}ms`,
      }}
    >
      <button
        type="button"
        onClick={() => onSelect(project)}
        className="group w-full text-left rounded-lg overflow-hidden bg-surface border border-border focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 hover:scale-[1.02] transition-transform duration-300"
      >
        {/* Thumbnail */}
        <div className={`${config.aspect} relative overflow-hidden bg-gradient-to-br from-surface to-border`}>
          {/* Category-tinted hover overlay — hover-capable devices only */}
          <div
            className={`absolute inset-0 ${config.overlay} opacity-0 hover:opacity-100 transition-opacity duration-300 z-10 hidden md:flex items-end p-4`}
            aria-hidden="true"
          >
            <div>
              <span className={`inline-block text-xs font-medium px-2 py-1 rounded ${config.badge} text-white mb-2`}>
                {project.category}
              </span>
              <p className="text-white font-semibold text-lg leading-tight">{project.title}</p>
              {project.client && (
                <p className="text-white/70 text-sm mt-1">{project.client}</p>
              )}
            </div>
          </div>
        </div>

        {/* Mobile: always-visible info below thumbnail */}
        <div className="p-4 md:hidden">
          <span className={`inline-block text-xs font-medium px-2 py-1 rounded ${config.badge} text-white mb-2`}>
            {project.category}
          </span>
          <p className="font-semibold text-lg leading-tight">{project.title}</p>
          {project.client && (
            <p className="text-muted text-sm mt-1">{project.client}</p>
          )}
        </div>
      </button>
    </div>
  );
}
