export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border-subtle py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-sm text-muted">
          &copy; {currentYear} Shrike Media. Elite creative engineering.
        </p>
      </div>
    </footer>
  );
}
