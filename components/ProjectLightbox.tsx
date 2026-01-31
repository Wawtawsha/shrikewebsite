"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { Project } from "@/types/portfolio";

interface ProjectLightboxProps {
  project: Project | null;
  onClose: () => void;
}

const categoryBadge = {
  photography: "bg-amber-600/80",
  videography: "bg-blue-600/80",
  technical: "bg-emerald-600/80",
} as const;

export function ProjectLightbox({ project, onClose }: ProjectLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (project) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else {
      dialog.close();
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [project]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className={`backdrop:bg-black/80 bg-transparent p-0 max-w-3xl w-full mx-auto ${
        reducedMotion ? "" : "animate-fade-in"
      }`}
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === dialogRef.current) onClose();
      }}
    >
      {project && (
        <div className="bg-surface border border-border rounded-lg overflow-hidden m-4 md:m-0">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-border">
            <div>
              <span
                className={`inline-block text-xs font-medium px-2 py-1 rounded ${categoryBadge[project.category]} text-white mb-2`}
              >
                {project.category}
              </span>
              <h2 className="text-2xl font-bold">{project.title}</h2>
              {project.client && (
                <p className="text-muted text-sm mt-1">{project.client}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-muted hover:text-foreground transition-colors p-1"
              aria-label="Close lightbox"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Hero area */}
            <div className="aspect-video bg-gradient-to-br from-surface to-border rounded-lg" />

            <p className="text-lg text-muted">{project.description}</p>

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 text-sm text-muted">
              {project.date && <span>Date: {project.date}</span>}
              {project.client && <span>Client: {project.client}</span>}
            </div>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded bg-border text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
