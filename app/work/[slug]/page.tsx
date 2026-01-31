export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main id="main-content" className="min-h-screen py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight" style={{ fontFamily: 'var(--font-geist)' }}>
          Project: {slug}
        </h1>
        <p className="text-xl text-muted mb-16">
          Project details will be loaded here based on the slug.
        </p>

        <div className="aspect-video bg-surface border border-border rounded-lg flex items-center justify-center mb-8">
          <span className="text-muted">Hero Image</span>
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
