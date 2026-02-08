# Technology Stack

**Project:** Shrike Media -- Event Photo Gallery (v2 Milestone)
**Domain:** Pinterest-style event photo gallery with anonymous social features
**Researched:** 2026-02-08
**Scope:** Stack ADDITIONS only. Existing stack (Next.js 16.1.6, React 19, Tailwind 4, Motion, Lenis, Vercel) is validated and unchanged.

## Executive Summary

The gallery milestone requires four new capabilities the current stack lacks: (1) cloud storage for 200-1500 event photos, (2) a database for likes/comments metadata, (3) masonry grid layout, and (4) anonymous user identity for interactions. **Supabase** handles #1 and #2 with a single service. Masonry layout should use **CSS columns** (zero dependencies) rather than a React library, because every React masonry library has either React 19 compatibility issues or is unmaintained. Anonymous identity should use **localStorage device IDs** without Supabase Auth -- no auth layer is needed when interactions are low-stakes.

**Overall confidence: HIGH** -- Supabase is well-documented for Next.js App Router. CSS columns masonry is battle-tested. The anonymous pattern is simple localStorage.

**Critical cost decision:** Supabase Image Transformations (server-side resize) are **Pro plan only ($25/month)**. On the free tier, you must either pre-generate thumbnails at upload time or rely on Next.js/Vercel image optimization for serving. This is the single most important architectural decision for this milestone.

---

## New Dependencies

### Backend: Supabase

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **@supabase/supabase-js** | ^2.95.x | Supabase client (DB + Storage) | Isomorphic JS client for querying Postgres and uploading/downloading files. Current stable version verified 2026-02-06 on npm. Single package handles both Storage and Database operations. |
| **@supabase/ssr** | ^0.8.x | Server-side Supabase client | Framework-agnostic SSR utilities for creating Supabase clients in Next.js Server Components, Server Actions, and Route Handlers. Replaces deprecated auth-helpers packages. Required for proper cookie handling. |

**Confidence: HIGH** -- Versions verified via npm registry and official Supabase docs as of 2026-02-08.

**Why Supabase over alternatives:**

| Alternative | Why Not |
|-------------|---------|
| **Firebase** | Heavier client SDK, Firestore query model is awkward for relational data (likes referencing photos). Supabase is Postgres -- real SQL, real joins. |
| **Cloudinary** | Excellent for image transforms but doesn't give you a database. You'd need Cloudinary + a separate DB, adding complexity. |
| **AWS S3 + RDS** | Massively over-engineered for a gallery with <2000 photos. Supabase wraps S3-compatible storage + Postgres into one dashboard. |
| **Vercel Blob** | Storage only, no database. You'd still need Supabase or Planetscale for metadata. |
| **Uploadthing** | Nice upload DX but no built-in database or RLS. Adds a dependency without reducing the need for Supabase. |

**Supabase Free Tier Constraints (verified 2026-02-08):**

| Resource | Free Limit | Gallery Impact |
|----------|-----------|----------------|
| Database | 500 MB | More than enough. 1500 photo metadata rows + likes/comments = <5 MB |
| File Storage | 1 GB | Tight. 1500 photos at 800KB avg = ~1.2 GB. Need compression at upload or use Pro ($25/mo for 100 GB) |
| Storage Egress | 2 GB/month | Could be tight with heavy traffic. Monitor closely. |
| Image Transforms | **Not available** | Must pre-generate thumbnails or use Next.js Image optimization |
| Realtime | Unlimited connections | Sufficient for live like counts if desired |
| Projects | 2 | Fine, but pauses after 7 days inactivity on free tier |

**The 1 GB storage limit is the deciding factor.** For a production gallery with 200-1500 high-quality event photos, you almost certainly need the **Pro plan ($25/month)** which provides 100 GB storage, 200 GB egress, and Image Transformations. Budget accordingly.

### Client Setup Pattern for Next.js App Router

Two Supabase clients are needed: one for Server Components, one for Client Components.

```
lib/
  supabase/
    client.ts    -- Browser client (createBrowserClient from @supabase/ssr)
    server.ts    -- Server client (createServerClient from @supabase/ssr)
```

**Environment variables required:**
```
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

**No middleware needed.** Since we are NOT using Supabase Auth (anonymous device IDs handled client-side), we skip the middleware token-refresh pattern entirely. This is a significant simplification -- most Supabase + Next.js guides assume you need auth middleware, but we do not.

**Server Component client (simplified, no auth):**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { /* cookie adapter */ } }
  )
}
```

**Browser client (simplified, no auth):**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Important nuance:** Even without auth, we need the `anon` key (not the service key) exposed client-side. RLS policies on the database will use this role to restrict writes. The `anon` role can SELECT from public buckets and tables, but INSERT/UPDATE/DELETE policies must be explicitly created.

### Next.js Image Config for Supabase Storage

Update `next.config.ts` to allow Supabase-hosted images:

```typescript
const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '<project-id>.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}
```

This enables Next.js/Vercel image optimization for Supabase-hosted photos, providing automatic WebP/AVIF conversion, responsive srcsets, and lazy loading -- all without needing Supabase Pro's Image Transformations.

---

### Masonry Layout: CSS Columns (No Library)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **CSS `column-count`** | Native CSS | Masonry grid layout | Zero dependencies, zero bundle size, works with React 19 and SSR by definition. Tailwind 4 has built-in `columns-*` utilities. |

**Confidence: HIGH** -- CSS columns have universal browser support. Tailwind 4 provides the utilities natively.

**Why NOT a React masonry library:**

| Library | Weekly Downloads | Last Updated | React 19 | Verdict |
|---------|-----------------|--------------|----------|---------|
| react-masonry-css | ~111K | **5 years ago** | Unverified | Dead project. No maintenance. |
| masonic | ~88K | Active-ish | Unverified | Virtualized (good for 10K+ items). Overkill for 200-1500 photos. Peer dep concerns with React 19. |
| react-responsive-masonry | Moderate | ~1 year ago | Unverified | More recent but still no React 19 verification. |
| react-plock | Small | Recent | Unverified | Tiny community. Risk of abandonment. |
| @masonry-grid/react | New | Recent | Likely | Too new to trust for production. |

**The uncomfortable truth:** Every React masonry library is either unmaintained, has React 19 peer dependency concerns, or is too new to trust. For a gallery with 200-1500 photos (not 50,000), CSS columns are the right call. Zero maintenance burden, zero compatibility risk.

**Implementation with Tailwind 4:**

```tsx
{/* Responsive masonry grid using Tailwind columns */}
<div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4">
  {photos.map((photo) => (
    <div key={photo.id} className="mb-4 break-inside-avoid">
      <Image src={photo.url} alt={photo.alt} ... />
    </div>
  ))}
</div>
```

**Known limitation of CSS columns:** Items flow top-to-bottom per column, not left-to-right. For a photo gallery, this is actually fine -- users scan visually, not in reading order. If strict left-to-right order matters (e.g., chronological), you can pre-sort photos into column arrays in JavaScript before rendering.

**When to reconsider:** If photo count exceeds ~500 visible at once (no pagination), consider masonic for virtualization. But with pagination or "load more," CSS columns handle 50-100 visible items trivially.

**Native CSS `masonry` grid:** Still experimental as of February 2026. Firefox has it behind a flag, Safari Technology Preview has it, Chrome 140+ has an alternative syntax behind a flag. NOT production-ready. Do not use.

---

### Anonymous Identity: localStorage Device IDs (No Auth Library)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **crypto.randomUUID()** | Native Web API | Generate device ID | Built into all modern browsers. No library needed. |
| **localStorage** | Native Web API | Persist device ID | Simplest persistence. Survives page refreshes and browser restarts. |

**Confidence: HIGH** -- These are native browser APIs, not libraries.

**Why NOT Supabase Anonymous Auth:**

Supabase does offer `signInAnonymously()` which creates an anonymous user with the `authenticated` role. This is well-documented and works. However, for this use case it adds unnecessary complexity:

1. **We don't need auth.** Likes and comments don't need JWT tokens or session management. A simple device ID column in the likes table achieves the same deduplication.
2. **Anonymous auth has abuse vectors.** Supabase recommends CAPTCHA (invisible reCAPTCHA or Cloudflare Turnstile) for anonymous sign-ins. That's complexity we don't want.
3. **Anonymous users can't recover sessions.** If they clear browsing data, the session is gone anyway -- same as localStorage.
4. **No middleware needed.** Supabase SSR auth requires middleware for token refresh. Skipping auth means skipping middleware entirely.

**Implementation pattern:**

```typescript
// lib/device-id.ts
export function getDeviceId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('shrike-device-id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('shrike-device-id', id)
  }
  return id
}
```

The device ID is passed to Supabase as a column value when inserting likes/comments. RLS policies on the `likes` table prevent duplicate likes by checking `device_id + photo_id` uniqueness.

**Limitation:** Users can clear localStorage and like again. This is acceptable for a warm/casual event gallery. If like integrity mattered (e.g., contests), you'd need proper auth. It doesn't here.

**Why NOT FingerprintJS:** FingerprintJS creates a browser fingerprint from device characteristics (canvas, fonts, screen resolution). It's more persistent than localStorage but raises GDPR/privacy concerns and adds a dependency. For casual likes on event photos, it's overkill.

---

### Image Optimization Strategy

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **next/image** | Built-in (Next.js 16) | Client-side image optimization | Already in the project. With `remotePatterns` configured for Supabase, it handles responsive srcsets, lazy loading, and format conversion (WebP/AVIF). |
| **sharp** | Already in project | Server-side image processing | Next.js uses sharp for on-demand image optimization in production. Already configured. |

**Confidence: HIGH** -- Using existing stack capabilities, no new dependencies.

**The optimization pipeline (free tier):**

1. **Upload:** Admin uploads full-resolution photos to Supabase Storage (public bucket)
2. **Serve:** `next/image` with Supabase public URL -- Vercel's image optimization handles resize/format on-the-fly
3. **Lazy load:** `next/image` lazy loads by default
4. **Blur placeholder:** Generate tiny base64 blur data URLs at upload time using sharp, store in DB alongside photo metadata

**If on Supabase Pro ($25/month):**

The Supabase Image Transformation API becomes available:
- Server-side resize (width, height, quality, resize mode)
- Automatic format detection (serves WebP to Chrome, etc.)
- CDN-cached transformations
- Can create a custom Next.js image loader pointing to Supabase transforms

```typescript
// supabase-image-loader.ts (Pro plan only)
export default function supabaseLoader({ src, width, quality }) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/render/image/public/${src}?width=${width}&quality=${quality || 75}`
}
```

**Recommendation:** Start on free tier using Next.js/Vercel image optimization. Upgrade to Supabase Pro when storage exceeds 1 GB or you need faster CDN-cached transforms.

**Pre-upload compression (regardless of tier):**

Photos from DSLRs can be 5-20 MB each. Before uploading to Supabase:
- Resize to max 2400px on longest edge (sufficient for full-screen display)
- JPEG quality 85 (visually indistinguishable from 100, ~60% smaller)
- Strip EXIF data (privacy: removes GPS coordinates, camera info)
- Target: <500 KB per photo

This can be done client-side with canvas API or server-side with sharp in a Next.js API route.

---

### Mobile Photo Download

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Supabase `getPublicUrl`** | Built-in | Generate download URLs | Returns the public URL for a file in a public bucket. Add `download: true` parameter to set Content-Disposition header for triggering downloads. |
| **Native `<a download>`** | HTML5 | Trigger download | Standard browser download behavior. Works on mobile Safari and Chrome. |

**Confidence: HIGH** -- Standard web APIs.

**Implementation pattern:**

```typescript
const { data } = supabase.storage
  .from('event-photos')
  .getPublicUrl('path/to/photo.jpg', {
    download: true  // or download: 'custom-filename.jpg'
  })
// data.publicUrl now triggers download when navigated to
```

**Mobile caveat:** On iOS Safari, the `download` attribute on `<a>` tags has inconsistent behavior. The Supabase `download: true` approach uses server-side Content-Disposition headers which work more reliably across mobile browsers. If download still doesn't trigger on iOS, fall back to opening the image in a new tab (users can then long-press to save).

---

## What NOT to Add

| Technology | Why Skip |
|------------|----------|
| **Supabase Auth / @supabase/auth-helpers** | No user accounts needed. Device IDs in localStorage handle anonymous identity without auth complexity. |
| **NextAuth / Auth.js** | Same reasoning -- no auth needed. |
| **Any masonry React library** | React 19 compatibility unverified across all options. CSS columns work perfectly for <1500 items. |
| **FingerprintJS** | Privacy concerns (GDPR), adds dependency. localStorage UUID is sufficient. |
| **Cloudinary** | Already using Supabase Storage. Adding a second image service fragments the architecture. |
| **react-intersection-observer** | Already have a custom `useScrollReveal` hook using IntersectionObserver. Don't add a library for what you already built. |
| **blurhash** | BlurHash encodes to Base83, but Next.js `blurDataURL` requires base64. You'd need conversion. Just generate tiny base64 blur images directly with sharp instead. |
| **Prisma / Drizzle** | Supabase client handles all database operations. Adding an ORM for a few tables (photos, likes, comments) is over-engineering. |
| **tRPC** | Gallery operations are simple CRUD. tRPC adds type-safety overhead that isn't justified for 4-5 queries. |
| **Supabase Realtime subscriptions** | Live like counts updating in real-time sound cool but add complexity. Fetch on page load and on user interaction is sufficient. Revisit if users request it. |
| **Middleware** | Only needed for Supabase Auth token refresh. We're not using auth, so no middleware. |

---

## Installation

```bash
# Supabase client + SSR utilities
npm install @supabase/supabase-js @supabase/ssr
```

That's it. Two packages. Everything else (CSS columns, localStorage, crypto.randomUUID, next/image, sharp) is already available.

**Environment setup:**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

---

## Supabase Project Setup

### Storage Bucket

```sql
-- Create a public bucket for event photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-photos', 'event-photos', true);
```

Or via Supabase dashboard: Storage > New Bucket > "event-photos" > Make Public.

**RLS for Storage:**
- Public reads (SELECT): Allow everyone
- Writes (INSERT): Restrict to service key only (admin uploads via dashboard or API route with service key)

### Database Tables

```sql
-- Photos metadata
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_slug TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  blur_data_url TEXT,  -- tiny base64 for placeholder
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Likes (one per device per photo)
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(photo_id, device_id)
);

-- Comments (anonymous)
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  display_name TEXT DEFAULT 'Guest',
  body TEXT NOT NULL CHECK (char_length(body) <= 500),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS policies: photos are read-only for public
CREATE POLICY "Photos are publicly readable"
  ON photos FOR SELECT USING (true);

-- Likes: anyone can insert (with device_id), read all
CREATE POLICY "Likes are publicly readable"
  ON likes FOR SELECT USING (true);
CREATE POLICY "Anyone can like"
  ON likes FOR INSERT WITH CHECK (true);

-- Comments: anyone can insert, read all
CREATE POLICY "Comments are publicly readable"
  ON comments FOR SELECT USING (true);
CREATE POLICY "Anyone can comment"
  ON comments FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_photos_event ON photos(event_slug);
CREATE INDEX idx_likes_photo ON likes(photo_id);
CREATE INDEX idx_comments_photo ON comments(photo_id);
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| **Backend** | Supabase (Storage + DB) | Firebase | Firestore's NoSQL model is awkward for relational data. Supabase is Postgres -- real SQL, joins, constraints, RLS. |
| **Backend** | Supabase | S3 + Planetscale | Two services to manage instead of one. Supabase bundles storage + DB. |
| **Masonry** | CSS columns | react-masonry-css | Unmaintained (5 years). React 19 compatibility unknown. |
| **Masonry** | CSS columns | masonic | Overkill virtualization for <1500 items. React 19 compatibility uncertain. |
| **Masonry** | CSS columns | Native CSS masonry (`grid-template-rows: masonry`) | Experimental. Firefox flag-only, Chrome 140 alternative syntax flag-only. Not production-ready. |
| **Anonymous ID** | localStorage UUID | Supabase Anonymous Auth | Adds auth complexity, middleware, CAPTCHA recommendation. Device UUID achieves same dedup for casual likes. |
| **Anonymous ID** | localStorage UUID | FingerprintJS | GDPR privacy concerns. Overkill for casual event likes. |
| **Image optimization** | Next.js/Vercel built-in | Supabase Image Transforms | Pro plan only ($25/mo). Next.js handles it for free on Vercel. |
| **Image optimization** | Next.js/Vercel built-in | Cloudinary | Second service to manage. Supabase Storage + Next.js Image is sufficient. |

---

## Cost Analysis

### Free Tier (Development / Low Traffic)

| Item | Cost | Notes |
|------|------|-------|
| Supabase Free | $0 | 500 MB DB, 1 GB storage, 2 GB egress. Pauses after 7 days inactivity. |
| Vercel Hobby | $0 | Includes image optimization, CDN, serverless functions |
| **Total** | **$0/month** | Sufficient for development and testing with <200 photos |

### Production (Recommended)

| Item | Cost | Notes |
|------|------|-------|
| Supabase Pro | $25/month | 8 GB DB, 100 GB storage, 200 GB egress, Image Transforms, no pausing |
| Vercel Hobby | $0 | Sufficient for portfolio traffic levels |
| **Total** | **$25/month** | Handles 1500+ photos, reliable uptime, image transforms |

**Break-even:** If you have more than ~150 event photos at high resolution, the Pro plan pays for itself in storage alone. The Image Transformations feature (server-side resize, CDN-cached) significantly reduces egress costs too.

---

## Integration Points with Existing Stack

| Existing Tech | Integration | Notes |
|---------------|-------------|-------|
| **Next.js 16 App Router** | Server Components fetch photos from Supabase; Client Components handle likes/comments | Gallery page can be a Server Component that fetches photos, with client-side interactivity islands |
| **Tailwind 4** | `columns-*` utilities for masonry grid, `break-inside-avoid` for items | Native support, no configuration needed |
| **Motion/Framer Motion** | Animate photo cards on hover, lightbox transitions | Already in project. Use for card micro-interactions and lightbox enter/exit |
| **Lenis** | Smooth scroll through gallery | Already configured globally. Works automatically. |
| **next/image** | Serve Supabase photos with optimization | Add `remotePatterns` to next.config.ts |
| **useReducedMotion hook** | Disable gallery animations for accessibility | Already built. Apply to gallery card animations. |
| **useScrollReveal hook** | Fade in gallery items on scroll | Already built. Apply to masonry grid items. |
| **Dark cinematic theme** | Gallery inherits dark theme, warm accents for the "cute" aesthetic | Use existing oklch color tokens. Add warm accent colors (pink, coral) for likes/hearts. |

---

## Sources

### Supabase
- [Supabase JavaScript Client (npm)](https://www.npmjs.com/package/@supabase/supabase-js) -- v2.95.3 verified 2026-02-06
- [Supabase SSR Package (npm)](https://www.npmjs.com/package/@supabase/ssr) -- v0.8.0 verified
- [Supabase Anonymous Sign-Ins](https://supabase.com/docs/guides/auth/auth-anonymous) -- Evaluated and rejected for this use case
- [Supabase Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control) -- RLS policy patterns
- [Supabase Image Transformations](https://supabase.com/docs/guides/storage/serving/image-transformations) -- Pro plan only, verified
- [Supabase Pricing](https://supabase.com/pricing) -- Free tier limits verified 2026-02-08
- [Supabase Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) -- Client setup patterns
- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security) -- Policy patterns
- [getPublicUrl API Reference](https://supabase.com/docs/reference/javascript/storage-from-getpublicurl) -- Download URL generation

### Masonry Layout
- [react-masonry-css (npm)](https://www.npmjs.com/package/react-masonry-css) -- Last published 5 years ago, rejected
- [masonic (GitHub)](https://github.com/jaredLunde/masonic) -- Virtualized, overkill for this use case
- [react-responsive-masonry (npm)](https://www.npmjs.com/package/react-responsive-masonry) -- v2.7.1, 1 year old
- [CSS Masonry with Columns (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Masonry_layout) -- Native CSS masonry still experimental
- [CSS Grid Masonry Browser Support](https://caniuse.com/mdn-css_properties_grid-template-rows_masonry) -- Firefox flag, Chrome 140 flag
- [Smashing Magazine: Masonry in CSS](https://www.smashingmagazine.com/2025/05/masonry-css-should-grid-evolve-stand-aside-new-module/) -- State of proposals

### Image Optimization
- [Next.js Image Component](https://nextjs.org/docs/app/api-reference/components/image) -- remotePatterns configuration
- [Next.js + Supabase Image Integration](https://kodaschool.com/blog/next-js-and-supabase-how-to-store-and-serve-images) -- Pattern guidance
- [Sharp (npm)](https://www.npmjs.com/package/sharp) -- Pre-upload image processing

### Anonymous Identity
- [FingerprintJS (GitHub)](https://github.com/fingerprintjs/fingerprintjs) -- Evaluated and rejected (GDPR, overkill)
- [Fingerprint.com: Storing Anonymous Preferences](https://fingerprint.com/blog/storing-anonymous-browser-preferences/) -- Pattern reference

---

## Research Methodology

**Sources prioritized:**
1. Official Supabase documentation (highest authority for Supabase capabilities and limits)
2. npm registry (for current versions and maintenance status)
3. GitHub repositories (for maintenance activity and React 19 compatibility)
4. Web search with 2025-2026 date filters (for ecosystem patterns)
5. Cross-verification of all critical claims with multiple sources

**Key decisions verified:**
- Supabase Image Transforms Pro-only: Verified via official docs AND pricing page
- Supabase free tier limits: Verified via pricing page, multiple third-party breakdowns
- CSS columns browser support: Universal (not experimental, unlike grid masonry)
- React masonry library maintenance: Checked npm publish dates for top 5 options
- @supabase/ssr version: Verified on npm registry

**Gaps identified:**
- React 19 compatibility for masonry libraries: Could not definitively confirm or deny for any library. Chose CSS columns to eliminate this risk entirely.
- Supabase egress costs at scale: 2 GB free egress may be insufficient for a popular gallery. Monitoring plan needed.
- iOS Safari download behavior: Known inconsistencies with Content-Disposition. May need testing.
