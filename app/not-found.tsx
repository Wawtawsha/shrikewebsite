import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-8xl font-bold mb-4 text-accent" style={{ fontFamily: 'var(--font-geist)' }}>
          404
        </h1>
        <h2 className="text-3xl font-semibold mb-6">Page Not Found</h2>
        <p className="text-lg text-muted mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-accent text-background font-semibold rounded-lg hover:bg-accent-hover transition-colors"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
