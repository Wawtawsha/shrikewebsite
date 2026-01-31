import type { Metadata } from "next";
import { generateJsonLd, SITE_URL } from "@/lib/metadata";
import { OptimizedImage } from "@/components/OptimizedImage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  // In the future, this will fetch actual project data
  const projectTitle = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: projectTitle,
    description: `View the ${projectTitle} project showcase from Shrike Media. Elite creative engineering and premium visual storytelling.`,
    openGraph: {
      title: projectTitle,
      description: `View the ${projectTitle} project showcase from Shrike Media.`,
      url: `${SITE_URL}/work/${slug}`,
      type: "article",
      images: [
        {
          url: `${SITE_URL}/work/${slug}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: projectTitle,
        },
      ],
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // In the future, this will fetch actual project data
  const projectTitle = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const jsonLd = generateJsonLd({
    type: "CreativeWork",
    name: projectTitle,
    description: `${projectTitle} project by Shrike Media`,
    image: `${SITE_URL}/work/${slug}/hero.jpg`,
    datePublished: new Date().toISOString(),
  });

  return (
    <main id="main-content" className="min-h-screen py-20 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight" style={{ fontFamily: 'var(--font-geist)' }}>
          Project: {slug}
        </h1>
        <p className="text-xl text-muted mb-16">
          Project details will be loaded here based on the slug.
        </p>

        <div className="aspect-video bg-surface border border-border rounded-lg overflow-hidden mb-8 relative">
          <OptimizedImage
            src={`/work/${slug}/hero.jpg`}
            alt={`${projectTitle} project hero image`}
            fill
            sizes="(max-width: 768px) 100vw, 896px"
            className="object-cover"
          />
        </div>

        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-muted">
            This is a placeholder for project content. The actual project data will be loaded dynamically.
          </p>
        </div>
      </div>
    </main>
  );
}
