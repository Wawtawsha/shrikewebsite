---
phase: 01-performance-foundation
plan: 02
subsystem: seo-a11y
tags: [next.js, seo, metadata, sitemap, json-ld, accessibility, avif, webp, a11y]

# Dependency graph
requires:
  - phase: 01-01
    provides: Next.js foundation with routes, navigation, dark theme
provides:
  - Complete SEO metadata infrastructure (Open Graph, Twitter Cards, JSON-LD)
  - sitemap.xml and robots.txt generation
  - Accessibility hook for prefers-reduced-motion detection
  - OptimizedImage component with blur placeholders and lazy loading
  - AVIF/WebP image format support
  - Motion accessibility CSS respecting user preferences
affects: [02-rich-media, portfolio-detail-pages, image-optimization]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - lib/metadata.ts centralizes SEO configuration
    - generateMetadata() for dynamic page metadata
    - JSON-LD structured data for CreativeWork schema
    - OptimizedImage wraps next/image with performance defaults
    - useReducedMotion hook for motion-sensitive UIs

key-files:
  created:
    - lib/metadata.ts
    - app/sitemap.ts
    - app/robots.ts
    - hooks/useReducedMotion.ts
    - components/OptimizedImage.tsx
  modified:
    - app/layout.tsx
    - app/page.tsx
    - app/work/page.tsx
    - app/services/page.tsx
    - app/work/[slug]/page.tsx
    - next.config.ts
    - app/globals.css

key-decisions:
  - "SITE_URL from env var with fallback to https://shrikemedia.com"
  - "Title template: '%s | Shrike Media' for all child pages"
  - "AVIF prioritized over WebP for image formats (better compression)"
  - "Global CSS disables all animations/transitions when prefers-reduced-motion active"
  - "OptimizedImage uses 1x1 gray base64 placeholder by default"
  - "JSON-LD Organization schema in root layout, CreativeWork in portfolio details"

patterns-established:
  - "generateMetadata() async function for dynamic pages"
  - "generateJsonLd() for schema.org structured data"
  - "useReducedMotion hook returns boolean for conditional animations"
  - "OptimizedImage component as default for all images (wraps next/image)"

# Metrics
duration: 5min
completed: 2026-01-30
---

# Phase 01 Plan 02: SEO & Accessibility Foundation Summary

**Complete SEO metadata with Open Graph/Twitter Cards, JSON-LD structured data, sitemap/robots, and motion accessibility infrastructure**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-31T01:17:49Z
- **Completed:** 2026-01-31T01:22:59Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Full SEO metadata on all pages with Open Graph and Twitter Card support
- sitemap.xml and robots.txt automatically generated and accessible at root
- JSON-LD structured data (Organization + CreativeWork) for search engines
- Motion accessibility respecting prefers-reduced-motion across all animations
- OptimizedImage component with blur placeholders and modern formats (AVIF/WebP)
- Build passing with 0 errors, all routes render correctly

## Task Commits

Each task was committed atomically:

1. **Task 1: SEO metadata, sitemap, robots, and JSON-LD** - `0e6663d` (feat)
2. **Task 2: Accessibility hook, optimized images, and a11y improvements** - `797cf23` (feat)

## Files Created/Modified

**Created:**
- `lib/metadata.ts` - Centralized SEO config with SITE_URL, siteMetadata, JSON-LD generators
- `app/sitemap.ts` - Dynamic sitemap generation (static routes + future project routes)
- `app/robots.ts` - Robots.txt with crawl rules and sitemap reference
- `hooks/useReducedMotion.ts` - React hook detecting prefers-reduced-motion media query
- `components/OptimizedImage.tsx` - next/image wrapper with blur placeholders, lazy loading, fade-in

**Modified:**
- `app/layout.tsx` - Added metadataBase, title template, OG/Twitter metadata, Organization JSON-LD
- `app/page.tsx` - Added metadata export for home page
- `app/work/page.tsx` - Added metadata export for work listing
- `app/services/page.tsx` - Added metadata export for services
- `app/work/[slug]/page.tsx` - Added generateMetadata() and CreativeWork JSON-LD
- `next.config.ts` - Configured image formats (AVIF, WebP)
- `app/globals.css` - Added prefers-reduced-motion support for smooth scrolling and animations

## Decisions Made

1. **SITE_URL environment variable** - Defaults to https://shrikemedia.com, allows override via NEXT_PUBLIC_SITE_URL for staging/preview deployments
2. **Title template pattern** - "%s | Shrike Media" ensures consistent branding across all pages
3. **AVIF prioritized over WebP** - Better compression ratios, Next.js will fall back to WebP for unsupported browsers
4. **Global motion accessibility** - All animations/transitions disabled when prefers-reduced-motion active, not just smooth scrolling
5. **OptimizedImage default blur** - 1x1 gray base64 placeholder when custom blur not provided (better than no placeholder)
6. **JSON-LD schema choice** - Organization for site-wide, CreativeWork for portfolio items (schema.org best practice)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**TypeScript error on siteMetadata.og.type** - Initial implementation used string literal "website" which TypeScript rejected for OpenGraph type union. Fixed by adding `as const` type assertion. Build passed after fix.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- SEO foundation complete, ready for content population
- All metadata infrastructure in place for portfolio detail pages
- Image optimization configured, ready to add real images with blur placeholders
- Motion accessibility enforced globally, safe to add animations in future phases
- No blockers for Phase 1 continuation (analytics, performance monitoring)

**Note for future phases:**
- When adding portfolio projects, update sitemap.ts to include dynamic project routes
- Use OptimizedImage component for all images (don't use next/image directly)
- Use useReducedMotion hook for any custom animations/transforms
- Add og-image.jpg to public/ directory (referenced in metadata)

---
*Phase: 01-performance-foundation*
*Completed: 2026-01-30*
