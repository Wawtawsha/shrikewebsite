import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { generateJsonLd, SITE_URL } from "@/lib/metadata";
import { getProjectBySlug, projects } from "@/lib/projects";

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return { title: "Project Not Found" };
  }

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      url: `${SITE_URL}/work/${slug}`,
      type: "article",
    },
  };
}

const categoryBadge = {
  photography: "bg-amber-600/80",
  videography: "bg-blue-600/80",
  technical: "bg-emerald-600/80",
} as const;

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const jsonLd = generateJsonLd({
    type: "CreativeWork",
    name: project.title,
    description: project.description,
    image: project.thumbnail,
    datePublished: project.date ? `${project.date}-01` : new Date().toISOString(),
  });

  return (
    <main id="main-content" className="min-h-screen py-20 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto">
        <Link
          href="/work"
          className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to portfolio
        </Link>

        <span
          className={`inline-block text-xs font-medium px-2 py-1 rounded ${categoryBadge[project.category]} text-white mb-4`}
        >
          {project.category}
        </span>

        <h1
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
          style={{ fontFamily: "var(--font-geist)" }}
        >
          {project.title}
        </h1>

        {/* Metadata row */}
        <div className="flex flex-wrap gap-4 text-sm text-muted mb-8">
          {project.client && <span>Client: {project.client}</span>}
          {project.date && <span>Date: {project.date}</span>}
        </div>

        {/* Hero placeholder */}
        <div className="aspect-video bg-gradient-to-br from-surface to-border rounded-lg overflow-hidden mb-8" />

        <p className="text-lg text-muted mb-8">{project.description}</p>

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
    </main>
  );
}
