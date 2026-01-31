# Phase 2: Rich Media & Core Features - Research

**Researched:** 2026-01-30
**Domain:** Video hero, portfolio filtering, lightbox, scroll animations, Calendly embed
**Confidence:** HIGH

## Summary

Phase 2 transforms the Phase 1 skeleton into the cinematic portfolio experience. The core technical challenges are: (1) reliable hero video autoplay across devices, (2) client-side portfolio filtering with URL state, (3) native dialog-based lightbox, (4) scroll-reveal animations that prep for GSAP in Phase 3, and (5) Calendly embed for booking.

All of this can be built with zero additional runtime dependencies beyond `react-calendly`. The video hero uses native HTML5 `<video>`, the lightbox uses native `<dialog>`, scroll animations use Intersection Observer, and filtering is pure React state synced to URL search params.

**Primary recommendation:** Keep it native. The only new dependency should be `react-calendly`. Use HTML5 video, native dialog, Intersection Observer, and Next.js searchParams for everything else.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-calendly | ^4.x | Calendly scheduling embed | Official React wrapper, handles SSR issues |

### Supporting (already installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/image | 16.1.6 | Portfolio thumbnails | All portfolio grid images via OptimizedImage |
| React 19 | 19.2.3 | useRef for dialog, useState for filters | Core framework |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| native `<video>` | next-video / @mux/mux-video | Adds dependency + Mux account; overkill for single hero showreel |
| native `<dialog>` | @radix-ui/dialog | Adds dependency; native dialog has full browser support now |
| Intersection Observer | CSS scroll-driven animations | Safari 26+ only (beta); Firefox needs flag. Not ready. |
| react-calendly | raw iframe | react-calendly handles script loading, SSR, event listeners |

**Installation:**
```bash
npm install react-calendly
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── page.tsx                    # Hero video + scroll indicator
├── work/
│   ├── page.tsx               # Portfolio grid with filtering
│   └── [slug]/page.tsx        # Already exists, enhance with real data
├── services/
│   └── page.tsx               # Service selector + Calendly embed
components/
├── HeroVideo.tsx              # Client component: video + poster fallback
├── ScrollIndicator.tsx        # Animated down-arrow, respects reduced motion
├── PortfolioGrid.tsx          # Client component: filtering + grid
├── PortfolioCard.tsx           # Thumbnail with hover effect
├── ProjectLightbox.tsx        # Native <dialog> lightbox
├── ServiceSelector.tsx        # Tab/button selector for service types
├── CalendlyEmbed.tsx          # Client component: react-calendly wrapper
lib/
├── projects.ts                # Hardcoded project data array
├── metadata.ts                # Already exists
```

### Pattern 1: Hero Video with Mobile Fallback
**What:** Full-screen `<video>` with `autoplay muted loop playsinline`, poster frame, and media query fallback to static image on mobile.
**When to use:** Homepage hero section.
**Example:**
```tsx
// components/HeroVideo.tsx - Client Component
"use client";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useEffect, useRef, useState } from "react";

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check screen width; could also use navigator.connection
    setIsMobile(window.innerWidth < 768);
  }, []);

  if (prefersReducedMotion || isMobile) {
    return (
      <div className="absolute inset-0 -z-10">
        <img
          src="/hero-poster.webp"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster="/hero-poster.webp"
      className="absolute inset-0 w-full h-full object-cover -z-10"
    >
      <source src="/showreel.webm" type="video/webm" />
      <source src="/showreel.mp4" type="video/mp4" />
    </video>
  );
}
```

### Pattern 2: Client-Side Filtering with URL Search Params
**What:** Portfolio filtering via React state synced to `?category=photography` URL params using `useSearchParams`.
**When to use:** Portfolio page filtering.
**Example:**
```tsx
"use client";
import { useSearchParams, useRouter } from "next/navigation";

const categories = ["all", "photography", "videography", "technical"] as const;

export function PortfolioGrid({ projects }: { projects: Project[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeCategory = searchParams.get("category") || "all";

  const filtered = activeCategory === "all"
    ? projects
    : projects.filter(p => p.category === activeCategory);

  function setCategory(cat: string) {
    const params = new URLSearchParams(searchParams);
    if (cat === "all") params.delete("category");
    else params.set("category", cat);
    router.replace(`/work?${params.toString()}`, { scroll: false });
  }

  return (/* filter buttons + grid */);
}
```

### Pattern 3: Native Dialog Lightbox
**What:** `<dialog>` element with `showModal()` for focus trapping, ESC to close, `::backdrop` for overlay.
**When to use:** Portfolio project detail view.
**Example:**
```tsx
"use client";
import { useRef, useCallback } from "react";

export function ProjectLightbox({ project, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = useCallback(() => {
    dialogRef.current?.showModal();
    // Prevent body scroll
    document.body.style.overflow = "hidden";
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
    document.body.style.overflow = "";
    onClose?.();
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-black/80 bg-transparent max-w-4xl w-full p-0"
      onClose={close}
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === dialogRef.current) close();
      }}
    >
      {/* Project detail content */}
    </dialog>
  );
}
```

### Pattern 4: Scroll Reveal with Intersection Observer
**What:** Simple hook that adds a class when element enters viewport. Prep for GSAP in Phase 3.
**When to use:** Portfolio cards, service cards, any scroll-in content.
**Example:**
```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) { setIsVisible(true); return; }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(el); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, prefersReducedMotion]);

  return { ref, isVisible };
}
```

### Anti-Patterns to Avoid
- **Don't use CSS scroll-driven animations yet:** Firefox needs a flag, Safari 26 is still beta. Use Intersection Observer.
- **Don't dynamically import the video element:** Just render it conditionally. Dynamic import adds unnecessary complexity for a `<video>` tag.
- **Don't use `open` attribute on `<dialog>`:** Must call `showModal()` for focus trapping and backdrop to work.
- **Don't put video files in `public/` for production:** Self-hosted video from `public/` works for dev but won't have CDN optimization. For v1 this is fine; revisit if performance matters.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Calendly scheduling | Custom booking form | react-calendly InlineWidget | Handles availability, timezone, confirmation |
| Focus trapping in modals | Custom focus trap logic | Native `<dialog>` showModal() | Browser handles it, accessible by default |
| Image optimization | Custom responsive images | OptimizedImage (already built) | next/image handles srcset, AVIF, lazy loading |
| URL state management | Custom URL sync | useSearchParams + router.replace | Next.js built-in, handles SSR hydration |

## Common Pitfalls

### Pitfall 1: Video Autoplay Fails Silently on Mobile
**What goes wrong:** Video doesn't play, user sees poster or blank.
**Why it happens:** Missing `muted`, `playsinline`, or browser blocks autoplay anyway.
**How to avoid:** Always include `autoplay muted loop playsInline`. Always have a poster image. Detect mobile and show static image fallback instead.
**Warning signs:** Works on desktop Chrome, broken on iPhone Safari.

### Pitfall 2: Dialog Scroll Bleed
**What goes wrong:** Page behind modal still scrolls when user scrolls inside lightbox.
**Why it happens:** `<dialog>` makes background inert but doesn't prevent scroll.
**How to avoid:** Set `document.body.style.overflow = "hidden"` on open, restore on close.
**Warning signs:** Users scroll background while viewing lightbox on mobile.

### Pitfall 3: useSearchParams Suspense Boundary
**What goes wrong:** Build error or runtime crash when using `useSearchParams`.
**Why it happens:** Next.js App Router requires a Suspense boundary around components using `useSearchParams` during static rendering.
**How to avoid:** Wrap the PortfolioGrid in `<Suspense fallback={...}>` in the parent server component.
**Warning signs:** Build-time error mentioning Suspense boundary.

### Pitfall 4: Calendly Embed SSR Crash
**What goes wrong:** `window is not defined` error during server-side render.
**Why it happens:** react-calendly accesses browser APIs.
**How to avoid:** Make CalendlyEmbed a `"use client"` component. Optionally use `next/dynamic` with `ssr: false`.
**Warning signs:** Hydration mismatch or SSR error in terminal.

### Pitfall 5: Large Video File Blocks Page Load
**What goes wrong:** Hero takes seconds to appear, user sees blank space.
**Why it happens:** Video file too large, no poster frame, `preload="auto"` downloads entire file.
**How to avoid:** Use `poster` attribute for instant visual. Keep video under 10MB. Use `preload="metadata"` if video is large (loads dimensions + first frame only). Compress with FFmpeg: `ffmpeg -i input.mp4 -vcodec h264 -crf 28 -preset fast -an output.mp4`.
**Warning signs:** LCP > 3s on hero page.

### Pitfall 6: Hover Effects Inaccessible on Touch
**What goes wrong:** Portfolio info only visible on hover, invisible on mobile.
**Why it happens:** No hover state on touch devices.
**How to avoid:** Show project title always on mobile (below thumbnail), hover overlay only on `@media (hover: hover)`.
**Warning signs:** Mobile users can't see project names.

## Code Examples

### Hardcoded Portfolio Data Structure
```typescript
// lib/projects.ts
import { Project } from "@/types/portfolio";

export const projects: Project[] = [
  {
    slug: "brand-campaign-acme",
    title: "ACME Brand Campaign",
    description: "Full commercial shoot for ACME rebrand launch.",
    category: "photography",
    thumbnail: "/work/acme-thumb.webp",
    heroImage: "/work/acme-hero.webp",
    images: ["/work/acme-1.webp", "/work/acme-2.webp"],
    client: "ACME Corp",
    date: "2025-03",
    tags: ["commercial", "branding"],
    featured: true,
  },
  // ... more projects
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find(p => p.slug === slug);
}

export function getProjectsByCategory(category: string): Project[] {
  if (category === "all") return projects;
  return projects.filter(p => p.category === category);
}
```

### Calendly Embed Component
```tsx
// components/CalendlyEmbed.tsx
"use client";
import { InlineWidget } from "react-calendly";

interface CalendlyEmbedProps {
  url: string; // e.g., "https://calendly.com/shrike-media/consultation"
}

export function CalendlyEmbed({ url }: CalendlyEmbedProps) {
  return (
    <div className="h-[700px] rounded-lg overflow-hidden">
      <InlineWidget
        url={url}
        styles={{ height: "100%", width: "100%" }}
        pageSettings={{
          backgroundColor: "1a1a1a",
          primaryColor: "your-accent-color",
          textColor: "ffffff",
          hideLandingPageDetails: true,
          hideGdprBanner: true,
        }}
      />
    </div>
  );
}
```
Note: `pageSettings` customization requires Calendly Pro plan.

### Scroll Down Indicator
```tsx
// components/ScrollIndicator.tsx
"use client";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function ScrollIndicator() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
      <button
        onClick={() => window.scrollBy({ top: window.innerHeight, behavior: "smooth" })}
        aria-label="Scroll down to explore"
        className={prefersReducedMotion ? "" : "animate-bounce"}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
        </svg>
      </button>
    </div>
  );
}
```

### Category Visual Treatment Pattern
```tsx
// Different card styles per category
const categoryStyles: Record<string, string> = {
  photography: "aspect-[4/3] hover:shadow-warm",    // landscape ratio, warm tones
  videography: "aspect-[16/9] hover:shadow-cool",    // cinematic ratio, cool tones
  technical: "aspect-square hover:shadow-accent font-mono", // square, monospace text
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-modal / custom modals | Native `<dialog>` | 2023 (Safari 15.4) | No dependency needed, built-in a11y |
| scroll event listeners | Intersection Observer | 2019+ | Better performance, no scroll jank |
| jQuery lightbox plugins | Native dialog + CSS grid | 2023+ | Zero dependencies |
| Video.js for hero | Native `<video>` | Always for background | No controls needed = no player needed |

## Open Questions

1. **Video source files:** Where will the actual showreel video come from? Placeholder needed for dev. Recommend creating a 5-second dark gradient loop as placeholder.
   - What we know: Self-hosted from public/ is fine for v1
   - What's unclear: Final video dimensions, duration, file size
   - Recommendation: Use 1920x1080, target under 8MB, provide WebM + MP4

2. **Calendly URL:** Need the actual Calendly booking URL for the embed.
   - Recommendation: Use a placeholder URL, make it configurable in a constants file

3. **Portfolio images:** No real project images exist yet.
   - Recommendation: Use placeholder gradient divs or free stock photos for dev, swap later

4. **Calendly Pro plan:** pageSettings (dark theme customization) requires Pro. Does Shrike have Pro?
   - Recommendation: Code it with pageSettings, falls back gracefully if not Pro

## Sources

### Primary (HIGH confidence)
- Chrome autoplay policy: https://developer.chrome.com/blog/autoplay
- MDN dialog element: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog
- MDN Intersection Observer: built-in browser API, universally supported
- Next.js video guide: https://nextjs.org/docs/app/guides/videos
- WebKit video policies: https://webkit.org/blog/6784/new-video-policies-for-ios/

### Secondary (MEDIUM confidence)
- react-calendly npm: https://www.npmjs.com/package/react-calendly
- react-calendly GitHub: https://github.com/tcampb/react-calendly
- CSS scroll-driven animations support: https://caniuse.com/mdn-css_properties_animation-timeline_scroll

### Tertiary (LOW confidence)
- Calendly Pro pageSettings requirement - based on multiple blog posts, not verified against official Calendly docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - native APIs + one well-known package
- Architecture: HIGH - standard Next.js App Router patterns
- Pitfalls: HIGH - well-documented browser behavior (autoplay, dialog, Suspense)
- Video hosting: MEDIUM - self-hosted fine for v1, may need CDN later

**Research date:** 2026-01-30
**Valid until:** 2026-03-01 (stable domain, no fast-moving APIs)
