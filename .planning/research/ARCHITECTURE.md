# Architecture Patterns: Event Photo Gallery Integration

**Domain:** Supabase-backed photo gallery with anonymous social features, integrated into existing Next.js 16 App Router site
**Researched:** 2026-02-08
**Overall confidence:** HIGH (architecture patterns well-established; Supabase + Next.js integration well-documented)

---

## The Core Architectural Decision: Route Group with Separate Layout

The gallery has a fundamentally different visual identity (cute/warm) from the main site (dark/cinematic) and explicitly requires no navigation links between them. This is the textbook use case for **Next.js Route Groups with separate root layouts**.

### Why Route Groups, Not a Nested Layout

Three architectural options exist. Only one is correct.

**Option A: Gallery as a regular route under root layout** (`app/gallery/page.tsx`)
- Gallery inherits Navigation, Footer, LenisProvider, PageTransition, dark theme
- You'd have to conditionally hide/override all of these
- The dark oklch color system bleeds into the gallery unless extensively overridden
- The `className="dark"` on `<html>` in the root layout forces dark mode globally
- **Verdict: Wrong.** Conditional overrides create fragile, entangled code.

**Option B: Gallery as a separate Next.js app / subdomain**
- Complete isolation, separate deployment
- Overkill for what is fundamentally one route with a few API endpoints
- Doubles deployment complexity, CI/CD, and hosting costs
- **Verdict: Wrong.** Overcorrection for a styling difference.

**Option C: Route Groups with separate root layouts** (RECOMMENDED)
- `app/(main)/layout.tsx` wraps all existing pages with Navigation, Footer, dark theme
- `app/(gallery)/gallery/layout.tsx` wraps gallery with its own warm theme, no shared chrome
- Each has its own `<html>` and `<body>` tags with different class/theme
- Zero interference between the two visual identities
- URL stays clean: `/gallery` (route group parentheses are omitted from URL)
- **Verdict: Correct.** Clean separation, no conditional logic, standard Next.js pattern.

**Critical trade-off to acknowledge:** Navigation between route groups triggers a full page load (not client-side navigation). This is actually a *benefit* here since we don't want navigation links between them anyway. The full page load ensures complete CSS/theme isolation.

### Recommended Directory Structure

```
app/
  (main)/                          -- Route group: existing Shrike site
    layout.tsx                     -- Moved from app/layout.tsx (dark theme, Nav, Footer)
    page.tsx                       -- Homepage
    not-found.tsx                  -- 404 page
    work/                          -- Portfolio pages
    services/                      -- Services pages
    book/                          -- Booking page
    sitemap.ts                     -- Sitemap
    robots.ts                      -- Robots config

  (gallery)/                       -- Route group: warm photo gallery
    gallery/                       -- /gallery URL
      layout.tsx                   -- Gallery root layout (warm theme, own html/body)
      page.tsx                     -- Gallery grid (Server Component)
      gallery.css                  -- Gallery-specific theme tokens
      [photoId]/                   -- /gallery/[photoId] (optional: deep link to photo)
        page.tsx                   -- Individual photo view

  globals.css                      -- Shared reset, box-sizing only (NOT theme)
  favicon.ico                      -- Shared favicon

  api/                             -- API Route Handlers (shared, not in route group)
    gallery/
      likes/
        route.ts                   -- POST /api/gallery/likes
      comments/
        route.ts                   -- POST/GET /api/gallery/comments

lib/
  supabase/
    client.ts                      -- Browser Supabase client (for Client Components)
    server.ts                      -- Server Supabase client (for Server Components/Route Handlers)
  gallery.ts                       -- Gallery data fetching functions

types/
  gallery.ts                       -- Photo, Comment, Like types

components/
  gallery/                         -- Gallery-specific components (NOT shared with main site)
    GalleryGrid.tsx                -- Masonry grid layout
    PhotoCard.tsx                  -- Individual photo card with like button
    PhotoLightbox.tsx              -- Full-screen photo view with comments
    CommentSection.tsx             -- Anonymous comment list + form
    LikeButton.tsx                 -- Heart/like toggle with optimistic UI
    GalleryHeader.tsx              -- Minimal gallery header (event name, date)
```

### What Moves, What Stays, What Is New

| File | Action | Notes |
|------|--------|-------|
| `app/layout.tsx` | **MOVE** to `app/(main)/layout.tsx` | Identical content, just relocated |
| `app/page.tsx` | **MOVE** to `app/(main)/page.tsx` | Identical content |
| `app/not-found.tsx` | **MOVE** to `app/(main)/not-found.tsx` | Identical content |
| `app/work/` | **MOVE** to `app/(main)/work/` | Identical content |
| `app/services/` | **MOVE** to `app/(main)/services/` | Identical content |
| `app/book/` | **MOVE** to `app/(main)/book/` | Identical content |
| `app/sitemap.ts` | **MOVE** to `app/(main)/sitemap.ts` | Identical content |
| `app/robots.ts` | **MOVE** to `app/(main)/robots.ts` | Identical content |
| `app/globals.css` | **MODIFY** | Extract theme tokens into layout-specific CSS; keep only shared resets |
| `components/Navigation.tsx` | **NO CHANGE** | Used only by `(main)` layout |
| `components/Footer.tsx` | **NO CHANGE** | Used only by `(main)` layout |
| `components/LenisProvider.tsx` | **NO CHANGE** | Used only by `(main)` layout |
| `components/PageTransition.tsx` | **NO CHANGE** | Used only by `(main)` layout |
| `hooks/useReducedMotion.ts` | **NO CHANGE** | Reusable by gallery if needed |
| `hooks/useScrollReveal.ts` | **NO CHANGE** | Reusable by gallery if needed |
| `lib/fonts.ts` | **NO CHANGE** | Gallery can import its own fonts or reuse |
| `next.config.ts` | **MODIFY** | Add Supabase image domain |
| `app/(gallery)/` | **NEW** | Entire gallery route group |
| `lib/supabase/` | **NEW** | Supabase client utilities |
| `lib/gallery.ts` | **NEW** | Gallery data functions |
| `types/gallery.ts` | **NEW** | Gallery TypeScript types |
| `components/gallery/` | **NEW** | All gallery components |
| `app/api/gallery/` | **NEW** | API route handlers |

**Important:** The file moves are mechanical renames. All import paths using `@/` aliases continue to work because the `@/` alias resolves to the project root, not `app/`. No import changes needed in component files.

---

## CSS Theme Architecture

### The Problem

The main site uses oklch dark theme tokens defined in `app/globals.css` via Tailwind's `@theme` directive. The gallery needs an entirely different warm/cute palette. These cannot coexist in a single CSS theme declaration.

### The Solution: Split CSS

**`app/globals.css`** -- Shared minimal reset only:
```css
@import "tailwindcss";

/* Shared reset -- NO theme tokens here */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Reduced motion global -- shared accessibility */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**`app/(main)/main.css`** -- Dark cinematic theme (everything currently in globals.css minus the shared reset):
```css
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-background: oklch(0.1 0.01 240);
  --color-surface: oklch(0.15 0.01 240);
  /* ... all existing dark theme tokens ... */
}

/* All existing Lenis, nav-link, btn-hover, skip-to-content styles */
```

**`app/(gallery)/gallery/gallery.css`** -- Warm gallery theme:
```css
@theme {
  --color-background: oklch(0.98 0.01 80);     /* Warm cream */
  --color-surface: oklch(0.95 0.02 60);         /* Soft warm white */
  --color-surface-elevated: oklch(1.0 0 0);     /* Pure white cards */
  --color-foreground: oklch(0.2 0.02 40);       /* Warm dark brown */
  --color-muted: oklch(0.5 0.03 50);            /* Muted warm */
  --color-accent: oklch(0.65 0.2 25);           /* Warm pink/coral */
  --color-accent-hover: oklch(0.7 0.22 25);
  --color-border: oklch(0.88 0.02 60);          /* Soft border */
  --color-border-subtle: oklch(0.92 0.01 60);
}
```

Each root layout imports only its own CSS. Clean separation, no conditional logic, no CSS specificity wars.

### Consideration: Tailwind v4 and Multiple @theme Blocks

Tailwind v4 uses `@theme` to define design tokens. Having two separate CSS files with different `@theme` blocks works correctly because each root layout imports its own CSS file. The page's CSS bundle only includes the relevant theme. This is well-supported -- Tailwind v4 scopes `@theme` to the CSS file graph that imports it.

**Confidence: HIGH** -- This is how Tailwind v4 is designed to work with multiple themes.

---

## Supabase Integration Architecture

### Client Setup: Simple Is Correct Here

Since this gallery has NO user authentication (all interactions are anonymous), the full `@supabase/ssr` cookie-based auth setup is unnecessary overhead. The SSR package exists to coordinate auth tokens across server/client boundaries via cookies. With no auth, there are no tokens to coordinate.

**Recommended approach:** Use `@supabase/supabase-js` directly with the anon/publishable key.

```
lib/supabase/
  server.ts   -- createClient() for Server Components and Route Handlers
  client.ts   -- createClient() for Client Components (browser)
```

**Server client** (`lib/supabase/server.ts`):
```typescript
import { createClient } from '@supabase/supabase-js'

export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
```

**Browser client** (`lib/supabase/client.ts`):
```typescript
import { createClient } from '@supabase/supabase-js'

let client: ReturnType<typeof createClient> | null = null

export function createBrowserSupabaseClient() {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )
  }
  return client
}
```

**Why this is safe:** The `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (anon key) is designed to be exposed to the browser. All security comes from Supabase RLS policies on the database, not from hiding the key. The anon key provides the `anon` Postgres role, which RLS policies control.

**Counter-argument addressed:** "But what about `@supabase/ssr`?" -- The SSR package adds cookie management for auth token persistence across requests. Without auth, it adds complexity for zero benefit. If auth is ever added later, the migration is straightforward: install `@supabase/ssr`, replace the client creation functions, add middleware. But don't add it preemptively.

**Confidence: HIGH** -- Verified against Supabase documentation and GitHub discussions. Direct `createClient` is explicitly supported for server-only and auth-free use cases.

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...  # anon/publishable key
SUPABASE_SERVICE_ROLE_KEY=eyJ...             # NEVER exposed to client, for admin operations only
```

The service role key is only used if you need admin operations (e.g., bulk upload script). It should NEVER be in `NEXT_PUBLIC_*` variables.

### next.config.ts Update

```typescript
const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};
```

This allows `next/image` to optimize Supabase Storage images.

---

## Data Model

### Database Schema (Supabase PostgreSQL)

```sql
-- Photos table: metadata for images stored in Supabase Storage
create table photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,              -- Path in Supabase Storage bucket
  caption text,
  event_name text not null,                -- Event this photo belongs to
  width integer not null,                  -- Original image width
  height integer not null,                 -- Original image height (needed for masonry)
  blurhash text,                           -- Blur placeholder hash
  sort_order integer default 0,            -- Manual ordering
  like_count integer default 0,            -- Denormalized count (updated by trigger/RPC)
  created_at timestamptz default now()
);

-- Likes table: anonymous likes tracked by visitor cookie
create table likes (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid references photos(id) on delete cascade,
  visitor_id text not null,                -- Cookie-based visitor ID
  created_at timestamptz default now(),
  unique(photo_id, visitor_id)             -- One like per visitor per photo
);

-- Comments table: anonymous comments
create table comments (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid references photos(id) on delete cascade,
  display_name text not null default 'Guest',
  body text not null,
  visitor_id text not null,                -- Cookie-based visitor ID
  created_at timestamptz default now()
);
```

**Design decision: Denormalized `like_count` on `photos` table** rather than computing via JOIN. With 200-1500 photos each potentially having many likes, a JOIN-based count on every page load is wasteful. A Postgres function increments/decrements the count atomically.

```sql
-- Function to increment like count
create or replace function increment_like_count(p_photo_id uuid)
returns void as $$
  update photos set like_count = like_count + 1 where id = p_photo_id;
$$ language sql;

-- Function to decrement like count
create or replace function decrement_like_count(p_photo_id uuid)
returns void as $$
  update photos set like_count = greatest(like_count - 1, 0) where id = p_photo_id;
$$ language sql;
```

### RLS Policies

```sql
-- Photos: Anyone can read, nobody can modify via API (admin uses service role key)
alter table photos enable row level security;
create policy "Photos are publicly readable" on photos for select using (true);

-- Likes: Anyone can read and insert, delete own likes only
alter table likes enable row level security;
create policy "Likes are publicly readable" on likes for select using (true);
create policy "Anyone can insert a like" on likes for insert with check (true);

-- Comments: Anyone can read and insert
alter table comments enable row level security;
create policy "Comments are publicly readable" on comments for select using (true);
create policy "Anyone can insert a comment" on comments for insert with check (true);
```

**Note on anonymous identity:** Without authentication, RLS policies for write operations are necessarily permissive. The real access control happens at the API Route Handler level (rate limiting, input validation, spam prevention). RLS provides a safety net, not the primary defense.

### Supabase Storage Setup

- **Bucket name:** `gallery-photos`
- **Bucket type:** Public (direct URL access without auth tokens)
- **URL pattern:** `https://[project-id].supabase.co/storage/v1/object/public/gallery-photos/[path]`
- **Folder structure in bucket:** `events/[event-name]/[filename].jpg`

Public bucket is correct because:
1. All photos are meant to be publicly viewable
2. No auth token needed in image URLs means simpler `<img>` / `next/image` usage
3. Better CDN caching (no auth headers to vary on)
4. RLS still controls upload/delete operations

### Storage Limits Reality Check (Free Tier)

| Limit | Free Tier | Implication |
|-------|-----------|-------------|
| Total storage | 1 GB | ~200-500 photos at 2-5 MB each; resize before upload |
| Max file size | 50 MB | Fine for photos |
| Egress | 2 GB/month | ~400-1000 full-size photo loads; serve thumbnails aggressively |
| Database | 500 MB | More than enough for metadata |
| Auto-pause | 7 days inactivity | **PROBLEM for production** -- Pro plan ($25/mo) needed |
| Image transforms | Pro plan only | Cannot use Supabase's server-side resize on free tier |

**Recommendation:** Start on free tier for development, but plan for Pro ($25/month) before sharing the gallery link publicly. The auto-pause behavior on free tier will cause 30+ second cold starts for the first visitor after inactivity.

**Image sizing strategy for free tier:** Since Supabase image transformations require Pro plan, resize images BEFORE uploading. Store two variants per photo in the bucket: a thumbnail (~400px wide, ~50KB) and a full-size (~1600px wide, ~200KB). This is simpler than on-the-fly transforms anyway.

---

## Component Architecture

### Server vs. Client Component Boundaries

```
Gallery Page (SERVER COMPONENT)
  -- Fetches photo list from Supabase at request time
  -- Passes data as props to client components
  |
  +-- GalleryHeader (SERVER COMPONENT)
  |     -- Event name, date, photo count
  |     -- Pure display, no interactivity
  |
  +-- GalleryGrid (CLIENT COMPONENT -- 'use client')
        -- Masonry layout needs window width for responsive columns
        -- Scroll-based lazy loading / infinite scroll
        |
        +-- PhotoCard (CLIENT COMPONENT)
        |     -- Image display with blur placeholder
        |     -- Click to open lightbox
        |     -- Inline LikeButton
        |     |
        |     +-- LikeButton (CLIENT COMPONENT)
        |           -- Heart icon with count
        |           -- Optimistic toggle
        |           -- Calls POST /api/gallery/likes
        |
        +-- PhotoLightbox (CLIENT COMPONENT)
              -- Native <dialog> (reuse pattern from existing ProjectLightbox)
              -- Full-size image
              -- Like button + count
              -- CommentSection
              |
              +-- CommentSection (CLIENT COMPONENT)
                    -- Comment list (loaded from props or fetched)
                    -- Comment form (anonymous: display name + body)
                    -- Calls POST /api/gallery/comments
```

**Key principle:** The page-level Server Component does the Supabase query. All interactivity below is Client Components receiving data via props. This avoids Client Components needing to make their own initial fetch, reducing waterfall requests.

### New Components (Complete List)

| Component | Type | Responsibility | Props |
|-----------|------|---------------|-------|
| `GalleryHeader` | Server | Event name, date, photo count | `eventName`, `photoCount` |
| `GalleryGrid` | Client | CSS columns masonry, infinite scroll, lightbox state | `initialPhotos`, `totalCount` |
| `PhotoCard` | Client | Image + like count overlay, click handler | `photo`, `isLiked`, `onSelect` |
| `LikeButton` | Client | Heart toggle, optimistic state, API call | `photoId`, `likeCount`, `isLiked` |
| `PhotoLightbox` | Client | `<dialog>` modal, full-size image, comments | `photo`, `onClose` |
| `CommentSection` | Client | Comment list, form, submission | `photoId`, `initialComments` |

### Why Not Use Server Actions for Likes/Comments?

Server Actions (the `"use server"` directive) might seem natural for mutations. However, for anonymous interactions, API Route Handlers are better because:

1. **Rate limiting:** Route Handlers give you access to `Request` headers (IP address) for rate limiting. Server Actions abstract this away.
2. **Explicit HTTP semantics:** POST /api/gallery/likes is a clear, debuggable API surface. Server Actions are invoked via opaque POST requests to the page URL.
3. **CORS control:** If the gallery is ever embedded or accessed cross-origin, Route Handlers support CORS headers.
4. **Simplicity:** For an early-stage startup, an explicit REST-ish API is easier to reason about and debug than Server Action internals.

**Counter-argument:** Server Actions reduce boilerplate (no route file, no fetch call). True, but the debugging tradeoff isn't worth it for stateful mutations with rate limiting needs. For reads, Server Components are superior. For writes, Route Handlers are clearer.

### API Route Handlers

**`app/api/gallery/likes/route.ts`**

```
POST /api/gallery/likes
Body: { photoId: string, visitorId: string }
Response: { liked: boolean, likeCount: number }
Logic:
  1. Validate input (photoId is UUID, visitorId is string 10-100 chars)
  2. Rate limit by IP (max 60 like toggles per minute)
  3. Check if like exists for this visitorId + photoId
  4. If exists: DELETE like, decrement count via RPC
  5. If not: INSERT like, increment count via RPC
  6. Return new state
```

**`app/api/gallery/comments/route.ts`**

```
GET /api/gallery/comments?photoId=xxx
Response: { comments: Comment[] }
Logic:
  1. Validate photoId
  2. Query comments ordered by created_at desc
  3. Return array

POST /api/gallery/comments
Body: { photoId: string, displayName: string, body: string, visitorId: string }
Response: { comment: Comment }
Logic:
  1. Validate input (displayName max 50 chars, body max 500 chars)
  2. Rate limit by IP (max 10 comments per minute)
  3. Sanitize text (strip HTML tags, trim whitespace)
  4. INSERT comment
  5. Return created comment
```

### Rate Limiting Approach

Use an in-memory Map for rate limiting. This is appropriate because:
- Single Vercel serverless function (shared memory within instance)
- Scale is small (event gallery, not Twitter)
- No external dependency needed (no Redis/Upstash)
- Acceptable if limits reset on cold start

```typescript
// lib/rate-limit.ts
const rateMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateMap.get(ip);

  if (!record || now > record.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }

  if (record.count >= limit) return false; // blocked

  record.count++;
  return true; // allowed
}
```

**Caveat:** In-memory rate limiting resets when the serverless function cold-starts. For this use case (preventing casual abuse on a photo gallery), this is acceptable. If more robust rate limiting is needed, upgrade to Upstash Redis ($0/month on free tier).

### Anonymous Identity (Visitor ID)

Without user accounts, you need a way to:
- Track "has this person liked this photo?" (for UI state)
- Prevent unlimited likes from the same person

**Recommended approach: Cookie-based visitor ID**

```typescript
// lib/visitor.ts
export function getOrCreateVisitorId(): string {
  const cookieName = 'gallery_visitor';
  const existing = document.cookie
    .split('; ')
    .find(c => c.startsWith(cookieName + '='));

  if (existing) return existing.split('=')[1];

  const id = crypto.randomUUID();
  document.cookie = `${cookieName}=${id}; path=/gallery; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  return id;
}
```

**Why not browser fingerprinting libraries (FingerprintJS, etc.)?**
- Adds a heavyweight dependency for a simple use case
- Privacy concerns and legal implications (GDPR)
- A cookie is sufficient: if someone clears cookies and re-likes, that is acceptable behavior for a casual event gallery

**Why not localStorage?**
- Doesn't travel with HTTP requests to Route Handlers naturally
- Cookie is already the minimal correct primitive

---

## Masonry Grid Implementation

### Approach: CSS `columns` Property

For a Pinterest-style layout with varying image heights, the simplest high-performance approach is CSS `columns`. No JavaScript layout calculation needed.

```css
.masonry-grid {
  columns: 1;
  column-gap: 12px;
}

@media (min-width: 640px) {
  .masonry-grid {
    columns: 2;
  }
}

@media (min-width: 1024px) {
  .masonry-grid {
    columns: 3;
  }
}

.masonry-grid > * {
  break-inside: avoid;
  margin-bottom: 12px;
}
```

**Trade-off acknowledged:** CSS `columns` fills top-to-bottom, left-to-right. This means item order reads down columns, not across rows. For a photo gallery where chronological order is less important than visual layout, this is acceptable. If strict left-to-right reading order matters, a JS-based masonry solution would be needed.

**Why not CSS Grid `masonry` value?**
- As of February 2026, CSS `grid-template-rows: masonry` is only supported in Firefox behind a flag. Chrome and Safari do not support it. It is not production-ready.
- **Confidence: MEDIUM** -- Browser support may have improved; verify before implementation.

**Why not a JS masonry library?**
- Libraries like `react-masonry-css` or `masonry-layout` add dependencies for something CSS handles natively
- JS layout calculation causes layout shift and performance issues on large photo sets
- CSS `columns` performs well for 200-1500 photos with lazy loading

### Image Loading Strategy

```
1. Server Component fetches photo metadata (id, storage_path, width, height, caption, like_count)
2. Photos rendered with aspect-ratio set from width/height (prevents CLS)
3. CSS gradient placeholder or blurhash shown immediately
4. Images lazy-loaded via loading="lazy" on next/image
5. next/image handles format optimization (avif/webp) via Supabase remote pattern
6. Thumbnail variant loaded in grid; full-size variant loaded in lightbox
```

**Pagination:** For 200-1500 photos, load the first ~50, then load more on scroll (infinite scroll). Full page load of 1500 photos would create a massive initial DOM. Use cursor-based pagination via Supabase `.range()`.

---

## Data Flow: End to End

### Initial Page Load

```
Browser requests /gallery
    |
    v
Next.js Server Component (gallery/page.tsx)
    |
    +-- createServerSupabaseClient()
    +-- supabase.from('photos').select('*').order('sort_order').range(0, 49)
    +-- Returns photo metadata (NOT image bytes)
    |
    v
HTML streamed to browser with photo metadata embedded as props
    |
    v
GalleryGrid (Client Component) hydrates
    |
    +-- Renders PhotoCard for each photo
    +-- PhotoCard renders next/image with Supabase Storage public URL
    +-- Browser fetches images directly from Supabase CDN
    +-- IntersectionObserver triggers more photos as user scrolls (fetch next batch)
```

### Like Interaction

```
User taps heart on PhotoCard
    |
    v
LikeButton (Client Component)
    |
    +-- Optimistic UI: immediately toggle heart, increment/decrement count
    +-- POST /api/gallery/likes { photoId, visitorId: getVisitorId() }
    |
    v
Route Handler (api/gallery/likes/route.ts)
    |
    +-- Rate limit check (IP-based)
    +-- createServerSupabaseClient()
    +-- Check existing like: supabase.from('likes').select().match({...})
    +-- Toggle: INSERT or DELETE
    +-- Update photo.like_count via Supabase RPC
    +-- Return { liked: boolean, likeCount: number }
    |
    v
LikeButton receives response
    +-- If optimistic state matches server: done
    +-- If mismatch (race condition, rate limit): revert to server state
```

### Comment Submission

```
User types comment in PhotoLightbox
    |
    v
CommentSection (Client Component)
    |
    +-- Validate: displayName (1-50 chars), body (1-500 chars)
    +-- Optimistic UI: append comment to list immediately
    +-- POST /api/gallery/comments { photoId, displayName, body, visitorId }
    |
    v
Route Handler (api/gallery/comments/route.ts)
    |
    +-- Rate limit check (IP-based)
    +-- Input sanitization (strip HTML, trim whitespace)
    +-- createServerSupabaseClient()
    +-- INSERT comment
    +-- Return created comment with server-assigned id and created_at
    |
    v
CommentSection receives response
    +-- Replace optimistic comment with server version (has real ID, timestamp)
    +-- On error: remove optimistic comment, show error message
```

---

## What Can Be Reused from Existing Codebase

| Existing Asset | Reusable? | How |
|----------------|-----------|-----|
| `ProjectLightbox.tsx` pattern | **YES** -- pattern, not code | Same `<dialog>` + showModal/close pattern, different styling |
| `useReducedMotion.ts` | **YES** -- direct import | Accessibility hook works anywhere |
| `useScrollReveal.ts` | **YES** -- direct import | Could use for photo card entrance animations |
| `PortfolioGrid.tsx` pattern | **PARTIALLY** | URL-based filtering pattern reusable if gallery has categories |
| Navigation.tsx | **NO** | Gallery has its own header |
| Footer.tsx | **NO** | Gallery has its own footer (or none) |
| LenisProvider.tsx | **NO** | Smooth scroll not appropriate for infinite-scroll gallery |
| PageTransition.tsx | **NO** | Different route group, different transitions (or none) |
| Dark theme CSS | **NO** | Gallery uses warm theme |
| `lib/fonts.ts` | **MAYBE** | Gallery may want a different display font for the warm aesthetic |

---

## Suggested Build Order

Based on dependency analysis:

### Phase 1: Foundation
1. Supabase project setup + environment variables
2. Route group restructure (`(main)` and `(gallery)`)
3. CSS split (globals.css -> main.css + gallery.css)
4. Supabase client utilities (`lib/supabase/server.ts`, `lib/supabase/client.ts`)
5. `next.config.ts` update for Supabase image domain
6. **Verify:** Main site still works identically after restructure

### Phase 2: Gallery Display (Read-Only)
1. Database schema (photos table)
2. Seed data: upload test photos to Supabase Storage
3. TypeScript types (`types/gallery.ts`)
4. Data fetching functions (`lib/gallery.ts`)
5. Gallery layout (`(gallery)/gallery/layout.tsx`) with warm theme
6. Gallery page Server Component (fetch + render)
7. GalleryGrid with CSS columns masonry
8. PhotoCard with lazy loading and aspect ratio
9. PhotoLightbox (dialog-based full-size view)
10. **Verify:** Gallery renders with real photos, main site unaffected

### Phase 3: Social Features (Write Operations)
1. Likes table + RLS policies
2. Comments table + RLS policies
3. Visitor ID cookie utility
4. Rate limiting utility
5. API Route Handler: likes (with rate limiting)
6. API Route Handler: comments (with rate limiting + validation)
7. LikeButton component with optimistic UI
8. CommentSection component
9. **Verify:** Can like, unlike, comment; rate limiting works

### Phase 4: Polish
1. Infinite scroll / cursor-based pagination
2. Blur placeholders (CSS gradient or blurhash)
3. Mobile-first responsive refinement
4. Loading states and error boundaries
5. Photo upload admin tooling (script or simple form)
6. **Verify:** Performance acceptable, mobile experience smooth

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Fetching Supabase Data in Client Components
**What:** Using `useEffect` + Supabase client to fetch photos on mount
**Why bad:** Waterfall request (HTML loads -> JS hydrates -> fetch starts -> data arrives), no SSR benefit, layout shift
**Instead:** Fetch in Server Component, pass as props. The initial photo batch should be in the HTML response.

### Anti-Pattern 2: Storing Image Bytes in the Database
**What:** Storing actual image data in PostgreSQL BYTEA columns
**Why bad:** Slow queries, massive database size, no CDN benefit
**Instead:** Store in Supabase Storage (S3-backed), store only the `storage_path` in the database.

### Anti-Pattern 3: Complex State Management for Likes
**What:** Using Redux/Zustand/Context for like state across all photos
**Why bad:** Over-engineered; like state is local to each PhotoCard
**Instead:** Each LikeButton manages its own state. Optimistic toggle with server reconciliation. Component-local `useState` is sufficient.

### Anti-Pattern 4: Sharing Root Layout Between Themes
**What:** Single root layout with conditional rendering based on pathname
**Why bad:** Conditional `className` on `<html>`, CSS specificity wars, dark theme bleeding through
**Instead:** Route groups with separate root layouts. Complete isolation.

### Anti-Pattern 5: Real-time Subscriptions for Likes
**What:** Using Supabase Realtime to sync like counts across all viewers
**Why bad:** Adds WebSocket complexity, connection management, and cost for a feature nobody notices (seeing someone else's like appear in real-time on a photo gallery is not valuable)
**Instead:** Fetch fresh data on page load. Accept that like counts may be a few seconds stale.

### Anti-Pattern 6: Installing @supabase/ssr Without Auth
**What:** Setting up the full SSR cookie auth pipeline when there are no user accounts
**Why bad:** Unnecessary middleware, cookie handlers, and complexity for zero benefit
**Instead:** Use `@supabase/supabase-js` directly. Add SSR package only if/when auth is introduced.

---

## Scalability Considerations

| Concern | 200 photos | 1500 photos | 10,000+ photos |
|---------|------------|-------------|-----------------|
| Initial load | All at once feasible | Paginate (50/batch) | Paginate + virtual scroll |
| DOM nodes | Manageable | Manageable with lazy load | Need virtualization |
| Supabase queries | Single query | Cursor pagination | Add indexes, consider caching |
| Storage egress | Well within free tier | May approach limits | Pro plan required |
| Like count accuracy | Not an issue | Not an issue | Consider async count updates |

For the 200-1500 photo range, pagination + lazy loading is sufficient. Virtualization (react-window, etc.) is premature optimization.

---

## TypeScript Types

```typescript
// types/gallery.ts

export interface Photo {
  id: string;
  storage_path: string;
  caption: string | null;
  event_name: string;
  width: number;
  height: number;
  blurhash: string | null;
  sort_order: number;
  like_count: number;
  created_at: string;
}

export interface Comment {
  id: string;
  photo_id: string;
  display_name: string;
  body: string;
  visitor_id: string;
  created_at: string;
}

export interface Like {
  id: string;
  photo_id: string;
  visitor_id: string;
  created_at: string;
}

export interface LikeToggleResponse {
  liked: boolean;
  likeCount: number;
}

export interface CommentCreateResponse {
  comment: Comment;
}
```

---

## Sources

- [Supabase: Creating a client for SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client) -- Client setup patterns
- [Supabase: Storage Buckets Fundamentals](https://supabase.com/docs/guides/storage/buckets/fundamentals) -- Public vs private buckets
- [Supabase: Image Transformations](https://supabase.com/docs/guides/storage/serving/image-transformations) -- Image optimization (Pro plan only)
- [Supabase: Anonymous Sign-Ins](https://supabase.com/docs/guides/auth/auth-anonymous) -- Anonymous user patterns
- [@supabase/supabase-js vs @supabase/ssr Discussion](https://github.com/orgs/supabase/discussions/28997) -- When SSR package is needed
- [Next.js: Route Groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups) -- Separate layouts via route groups
- [Next.js: Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers) -- API endpoint patterns
- [Supabase + Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) -- Official integration guide
- [Supabase Pricing](https://supabase.com/pricing) -- Free tier limits
- [CSS Masonry and CSS Grid (CSS-Tricks)](https://css-tricks.com/css-masonry-css-grid/) -- Masonry implementation approaches
- [Chrome: CSS Masonry Update](https://developer.chrome.com/blog/masonry-update) -- Browser support status
- [Multiple Root Layouts in Next.js](https://www.nico.fyi/blog/next-js-multiple-root-layout) -- Route group layout patterns
- [Managing Multiple Layouts in Next.js with Route Groups](https://dev.to/flcn16/managing-multiple-layouts-in-nextjs-13-with-app-router-and-route-groups-4pmg) -- Practical examples

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Route group architecture | HIGH | Standard Next.js pattern, well-documented, verified |
| CSS theme split with Tailwind v4 | HIGH | @theme scoping is by design in v4 |
| Supabase client setup (no SSR pkg) | HIGH | Verified via official docs and GH discussions |
| Public storage bucket for images | HIGH | Officially documented, correct for public photos |
| Server Component data fetching | HIGH | Standard Next.js App Router pattern |
| API Route Handlers for mutations | HIGH | Standard pattern, well-suited for rate limiting |
| CSS columns for masonry | MEDIUM | Works well, but column-order (top-to-bottom) may not match user expectation; verify with real photos |
| RLS policies for anonymous writes | MEDIUM | Policies correct, but real security comes from Route Handler validation |
| Free tier sufficiency for 1500 photos | LOW | 1 GB storage tight; 2 GB egress may be limiting; auto-pause is a production risk |
| CSS Grid masonry browser support | LOW | Only Firefox behind flag as of training data; verify current state |
