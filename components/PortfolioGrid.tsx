"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { projects } from "@/lib/projects";
import type { Project } from "@/types/portfolio";
import { PortfolioCard } from "./PortfolioCard";
import { ProjectLightbox } from "./ProjectLightbox";

const categories = [
  { label: "All", value: "" },
  { label: "Photography", value: "photography" },
  { label: "Videography", value: "videography" },
  { label: "Software", value: "technical" },
] as const;

export function PortfolioGrid() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeCategory = searchParams.get("category") ?? "";
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filtered = activeCategory
    ? projects.filter((p) => p.category === activeCategory)
    : projects;

  function setCategory(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }
    router.push(`/work?${params.toString()}`, { scroll: false });
  }

  return (
    <>
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap" style={{ marginBottom: '48px' }} role="tablist" aria-label="Filter by category">
        {categories.map((cat) => (
          <button
            key={cat.value}
            role="tab"
            aria-selected={activeCategory === cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
              activeCategory === cat.value
                ? "bg-accent text-white"
                : "bg-surface text-muted hover:text-foreground border border-border"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((project, i) => (
          <PortfolioCard
            key={project.slug}
            project={project}
            onSelect={setSelectedProject}
            index={i}
          />
        ))}
      </div>

      {/* Lightbox */}
      <ProjectLightbox
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  );
}
