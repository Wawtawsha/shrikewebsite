# Phase 1: Performance Foundation - Research

**Researched:** 2026-01-30
**Domain:** Next.js 16 App Router with React 19, performance-first responsive web development
**Confidence:** HIGH

## Summary

Phase 1 establishes the technical foundation for a dark cinematic portfolio site using Next.js 16 with React 19, Tailwind CSS 4, and TypeScript. The research confirms this stack is production-ready with critical security patches applied (as of January 2026), though several breaking changes from v3/v15 require careful migration handling.

The standard approach is **server-first with client islands**: Server Components by default, Client Components only at interactive boundaries. This aligns perfectly with the phase goal of proving technical capability through fast, responsive infrastructure. The stack supports all requirements (TECH-01 through TECH-05, DSGN-01, DSGN-03, DSGN-04) with mature, well-documented APIs.

**Critical security note:** Multiple CVEs were discovered in React Server Components (CVE-2025-55183, CVE-2025-55184) affecting React 19.0.0-19.2.1 and Next.js 13.x-16.x. Developers must upgrade to React 19.2.4+ and Next.js 16.1.3+ immediately. This research assumes latest patched versions.

**Primary recommendation:** Use Next.js 16.1.3+, React 19.2.4+, Tailwind CSS 4 (latest stable), TypeScript 5.x, with next/font for typography optimization. Implement Server Components by default, mark interactive components with 'use client', and establish accessibility (prefers-reduced-motion, ARIA landmarks, keyboard nav) in Phase 1 to enforce in Phase 3.

## Standard Stack

The established libraries/tools for performance-first Next.js portfolio sites:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.3+ | React framework with App Router | Industry standard for React SSR/SSG, built-in optimization, metadata API for SEO |
| React | 19.2.4+ | UI library with Server Components | Latest stable, Server Components reduce client JS, View Transitions API |
| Tailwind CSS | 4.x (latest) | Utility-first CSS framework | CSS-first configuration, modern browser features (@property, color-mix), dark mode support |
| TypeScript | 5.x | Type safety | Next.js recommends TS, catches errors at build time, better DX |
| Sharp | Auto (via Next.js) | Image optimization | Next.js uses Sharp automatically for WebP/AVIF conversion, 60-80% payload reduction |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/font | Built-in | Font optimization | Always - self-hosts fonts, auto-subsetting, font-display: swap by default |
| GSAP | 3.14+ | Animation library | Phase 3 (deferred for now), use @gsap/react with useGSAP hook |
| Lenis | 1.3+ | Smooth scroll | Phase 3 (deferred for now), integrates with GSAP ScrollTrigger |
| @next/third-parties | Built-in | Analytics integration | When adding analytics - optimized loading for GTM, GA |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind CSS 4 | Styled Components / CSS Modules | Tailwind provides dark mode, responsive utilities out-of-box; CSS-in-JS adds runtime overhead |
| next/image | Manual img tags | Loses automatic WebP/AVIF conversion, lazy loading, blur placeholders, srcset generation |
| next/font | Google Fonts CDN | Loses self-hosting (privacy + performance), auto-subsetting, preloading |
| Server Components | Client-only React | Larger JS bundles, slower initial load, loses streaming benefits |

**Installation:**
```bash
# Initialize new Next.js project with latest
npx create-next-app@latest shrike-portfolio --typescript --tailwind --app --no-src-dir --import-alias "@/*"

# Or upgrade existing (use codemod for safety)
npm install next@latest react@latest react-dom@latest
npx @next/codemod@canary upgrade latest

# Tailwind v4 (if migrating from v3)
npm install tailwindcss@next @tailwindcss/postcss@next

# GSAP (Phase 3, but included for reference)
npm install gsap @gsap/react

# Lenis (Phase 3, but included for reference)
npm install lenis @studio-freight/react-lenis
```

## Architecture Patterns

### Recommended Project Structure

**Strategy 1: Files Outside `app`** (Recommended for this project)
```
shrike-portfolio/
├── app/                           # Routing only
│   ├── layout.tsx                 # Root layout with dark mode setup
│   ├── page.tsx                   # Homepage
│   ├── globals.css                # Tailwind imports + @theme config
│   ├── not-found.tsx              # 404 page
│   ├── work/                      # Portfolio pieces route
│   │   ├── page.tsx               # Work listing
│   │   ├── [slug]/                # Dynamic route for individual pieces
│   │   │   ├── page.tsx           # Work detail page
│   │   │   └── opengraph-image.tsx # OG image generator
│   │   └── _components/           # Private folder (not routable)
│   │       └── WorkGrid.tsx
│   ├── about/
│   │   └── page.tsx
│   └── api/                       # API routes (if needed)
│       └── route.ts
├── components/                    # Shared UI components
│   ├── Navigation.tsx
│   ├── Footer.tsx
│   └── ui/                        # Reusable UI primitives
│       ├── Button.tsx
│       └── Card.tsx
├── lib/                           # Utilities and data fetching
│   ├── fonts.ts                   # Font configuration with next/font
│   ├── metadata.ts                # Shared metadata utilities
│   └── utils.ts                   # Helper functions
├── public/                        # Static assets
│   ├── work/                      # Portfolio images/videos
│   └── favicon.ico
├── types/                         # TypeScript definitions
│   └── portfolio.ts
└── next.config.ts                 # Next.js configuration
```

**Key conventions:**
- Use `_folder` prefix for colocation without routing (e.g., `_components`, `_lib`)
- Use `(folder)` for route groups that don't affect URLs (e.g., `(marketing)`, `(auth)`)
- Use `[slug]` for dynamic routes
- Place Server Components in `app/`, Client Components in `components/` with `'use client'`

### Pattern 1: Server Components by Default

**What:** All components are Server Components unless marked with `'use client'` directive.

**When to use:** Default for everything - layouts, pages, static UI.

**Example:**
```typescript
// app/page.tsx - Server Component (default)
import { Metadata } from 'next'
import WorkGrid from '@/components/WorkGrid'

export const metadata: Metadata = {
  title: 'Shrike Media | Video Production Portfolio',
  description: 'Premium video production and creative services',
}

export default async function HomePage() {
  // Can fetch data directly, access DB, use secrets
  const projects = await fetch('https://...').then(r => r.json())

  return (
    <main>
      <h1>Recent Work</h1>
      <WorkGrid projects={projects} />
    </main>
  )
}
```

**Source:** [Next.js Official Docs - Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)

### Pattern 2: Client Components at Interactive Boundaries

**What:** Mark only interactive components with `'use client'` - buttons, forms, animations, anything using useState/useEffect/browser APIs.

**When to use:** Navigation menus, video players, scroll animations, theme toggles.

**Example:**
```typescript
// components/VideoPlayer.tsx - Client Component
'use client'

import { useState, useRef } from 'react'

export default function VideoPlayer({ src }: { src: string }) {
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  return (
    <div>
      <video ref={videoRef} src={src} />
      <button onClick={() => setPlaying(!playing)}>
        {playing ? 'Pause' : 'Play'}
      </button>
    </div>
  )
}
```

**Source:** [Next.js Official Docs - Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)

### Pattern 3: Composition Pattern (Pass Server Components as Children)

**What:** Pass Server Components as `children` to Client Components to keep them on the server.

**When to use:** When Client Component needs to wrap Server Components (e.g., animated container wrapping static content).

**Example:**
```typescript
// components/AnimatedContainer.tsx - Client Component
'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

export default function AnimatedContainer({ children }: { children: React.ReactNode }) {
  useGSAP(() => {
    gsap.from('.animated-container', { opacity: 0, y: 50 })
  })

  return <div className="animated-container">{children}</div>
}

// app/page.tsx - Server Component
import AnimatedContainer from '@/components/AnimatedContainer'
import WorkGrid from '@/components/WorkGrid' // Server Component

export default function Page() {
  return (
    <AnimatedContainer>
      <WorkGrid /> {/* Stays Server Component! */}
    </AnimatedContainer>
  )
}
```

**Source:** [Next.js Official Docs - Composition Patterns](https://nextjs.org/docs/14/app/building-your-application/rendering/composition-patterns)

### Pattern 4: Metadata API for SEO

**What:** Export `metadata` object or `generateMetadata` function from Server Components for SEO.

**When to use:** Every page and layout for title, description, Open Graph, Twitter cards.

**Example:**
```typescript
// app/work/[slug]/page.tsx
import { Metadata } from 'next'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = await fetch(`https://.../${slug}`).then(r => r.json())

  return {
    title: `${project.title} | Shrike Media`,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: [{ url: project.thumbnail, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
      images: [project.thumbnail],
    },
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  // ... render project
}
```

**Source:** [Next.js Official Docs - generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

### Pattern 5: Dark Mode with Tailwind CSS 4

**What:** Use class-based dark mode with localStorage persistence and system preference fallback.

**When to use:** Always, for cinematic dark theme (DSGN-01, DSGN-04).

**Example:**
```css
/* app/globals.css */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  /* Custom dark theme colors */
  --color-bg-primary: oklch(0.13 0.028 261.692);
  --color-bg-secondary: oklch(0.18 0.03 261);
  --color-text-primary: oklch(0.95 0.01 261);
  --color-accent: oklch(0.65 0.15 25); /* Cinematic gold */
}
```

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.documentElement.classList.toggle(
                "dark",
                localStorage.theme === "dark" ||
                  (!("theme" in localStorage) &&
                   window.matchMedia("(prefers-color-scheme: dark)").matches)
              );
            `,
          }}
        />
      </head>
      <body className="bg-bg-primary text-text-primary">{children}</body>
    </html>
  )
}
```

**Source:** [Tailwind CSS Official Docs - Dark Mode](https://tailwindcss.com/docs/dark-mode)

### Pattern 6: Responsive Images with next/image

**What:** Use Next.js Image component for automatic WebP/AVIF, lazy loading, blur placeholders.

**When to use:** All images (TECH-05).

**Example:**
```typescript
// components/ProjectCard.tsx
import Image from 'next/image'

export default function ProjectCard({ project }) {
  return (
    <div className="relative aspect-video">
      <Image
        src={project.thumbnail}
        alt={project.title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
        loading="lazy"
        placeholder="blur"
        blurDataURL={project.blurDataURL} // Base64 placeholder
      />
    </div>
  )
}
```

**Source:** [Next.js Official Docs - Image Component](https://nextjs.org/docs/app/api-reference/components/image)

### Pattern 7: Font Optimization with next/font

**What:** Self-host Google Fonts with automatic subsetting and preloading.

**When to use:** Typography setup (DSGN-03).

**Example:**
```typescript
// lib/fonts.ts
import { Inter, Source_Code_Pro } from 'next/font/google'
import localFont from 'next/font/local'

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '600'],
})

// For premium fonts (Geist, custom fonts)
export const geist = localFont({
  src: '../public/fonts/GeistVF.woff2',
  display: 'swap',
  variable: '--font-geist',
})

// app/layout.tsx
import { inter, sourceCodePro } from '@/lib/fonts'

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceCodePro.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

**Source:** [Next.js Official Docs - Font Optimization](https://nextjs.org/docs/app/getting-started/fonts)

### Anti-Patterns to Avoid

- **Importing Server Components into Client Components:** Causes entire tree to become client-side. Use composition pattern instead.
- **Using 'use client' everywhere:** Increases bundle size, loses Server Component benefits (streaming, zero JS for static content).
- **Synchronous access to params/searchParams:** Removed in Next.js 16. Always `await params` and `await searchParams`.
- **Custom webpack config with Turbopack:** Turbopack is now default and doesn't support webpack config. Migration required.
- **Using deprecated Tailwind v3 directives:** `@tailwind base/components/utilities` is gone. Use `@import "tailwindcss"` in v4.
- **Animating width/height/top/left:** Triggers reflow, kills performance. Use `transform` and `opacity` only (GPU-accelerated).
- **Overusing will-change:** Increases memory usage. Use sparingly, clean up after animations.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image optimization | Manual srcset, WebP conversion, lazy loading | `next/image` | Automatic format detection (WebP/AVIF based on browser), srcset generation for responsive sizes, built-in lazy loading with Intersection Observer, blur placeholders, 60-80% payload reduction. Sharp integration handles all edge cases. |
| Font loading | Manual @font-face, font-display, subsetting | `next/font` | Self-hosts fonts (privacy + performance), automatic subsetting to used characters only, preloading critical fonts, font-display: swap by default. Eliminates layout shift (CLS). |
| SEO meta tags | Manual meta tags in HTML | Metadata API (`generateMetadata`) | Type-safe, automatic merging from parent layouts, supports dynamic data fetching, handles Open Graph/Twitter cards, generates sitemap.xml/robots.txt, streams metadata after initial UI (improved TTFB). |
| Dark mode toggle | Custom localStorage + CSS classes | Tailwind v4 `@custom-variant dark` + system preference detection | Handles system preference (prefers-color-scheme), localStorage persistence, FOUC prevention with inline script, theme-color meta tags for browser chrome. |
| Responsive breakpoints | Manual media queries | Tailwind's responsive utilities (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`) | Mobile-first by default, consistent breakpoints across app, no CSS duplication. Tailwind breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px). |
| Lazy loading images | Intersection Observer API | `next/image` with `loading="lazy"` | Browser-native lazy loading with fallback, automatic threshold detection, works with blur placeholders, integrates with priority hints. |
| Blur placeholders | Canvas API, base64 generation | `plaiceholder` library + `next/image` | Generates optimized base64 blurred images, integrates with next/image `blurDataURL`, async/await API, supports both local and remote images. |
| Smooth scroll | Custom scroll hijacking | `lenis` library (1.3+) | Lightweight (3KB), performant (uses requestAnimationFrame), integrates with GSAP ScrollTrigger, respects prefers-reduced-motion, handles edge cases (nested scroll, momentum). |
| Keyboard navigation | Manual focus management | Semantic HTML + ARIA landmarks | Browsers handle focus order automatically with semantic HTML (`<nav>`, `<main>`, `<button>`). ARIA landmarks provide skip links for screen readers. |
| JSON-LD structured data | Manual script tags | Schema.org types + metadata API | Type-safe with TypeScript, automatic validation, supports CreativeWork for portfolio items, Organization for company info, BreadcrumbList for navigation. |

**Key insight:** Next.js and modern web APIs solve 90% of performance/accessibility problems. Custom solutions introduce bugs (FOUC, layout shift, memory leaks, accessibility violations) and maintenance burden. Use platform defaults.

## Common Pitfalls

### Pitfall 1: Async Request APIs Breaking Change (Next.js 16)

**What goes wrong:** Code using synchronous `params` or `searchParams` breaks with cryptic errors like "Error: Route "/work/[slug]" used `params.slug`. `params` should be awaited before using its properties."

**Why it happens:** Next.js 15 introduced async Request APIs with temporary backward compatibility. Next.js 16 removes synchronous access completely. This is a **major breaking change** affecting all dynamic routes.

**How to avoid:**
```typescript
// ❌ OLD (Next.js 15 and earlier)
export default function Page({ params }: { params: { slug: string } }) {
  return <h1>{params.slug}</h1>
}

// ✅ NEW (Next.js 16+)
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <h1>{slug}</h1>
}
```

**Warning signs:** TypeScript errors about params type mismatch, runtime errors mentioning "should be awaited".

**Source:** [Next.js Official Docs - Upgrading to Version 16](https://nextjs.org/docs/app/guides/upgrading/version-16)

### Pitfall 2: React Server Components Security Vulnerabilities (CVE-2025-55183, CVE-2025-55184)

**What goes wrong:** Multiple Denial of Service vulnerabilities in React Server Components allow attackers to crash server, cause out-of-memory exceptions, or excessive CPU usage via specially crafted HTTP requests to Server Function endpoints.

**Why it happens:** Incomplete fixes to address DoS vulnerabilities in React 19.0.0 through 19.2.1 and Next.js 13.x through 16.x.

**How to avoid:** Upgrade immediately to:
- React 19.2.4+ (released January 2026)
- Next.js 16.1.3+ (released January 7, 2026)

```bash
npm install next@latest react@latest react-dom@latest
```

**Warning signs:** Server crashes under load, memory spikes, CPU maxing out with modest traffic.

**Source:** [InfoWorld - Developers Urged to Immediately Upgrade React, Next.js](https://www.infoworld.com/article/4100641/developers-urged-to-immediately-upgrade-react-next-js.html)

### Pitfall 3: Turbopack Breaking Custom Webpack Configs

**What goes wrong:** `next build` fails with errors like "Custom webpack configuration detected. Turbopack does not support webpack config."

**Why it happens:** Next.js 16 makes Turbopack the default bundler for both dev and production. Turbopack doesn't support webpack config.

**How to avoid:**
- Remove custom webpack config from `next.config.ts` before upgrading
- OR temporarily opt out: `next build --experimental-turbo=false`
- Migrate webpack loaders to Next.js equivalents:
  - `@svgr/webpack` → Use `next-svgr` or inline SVG
  - Custom loaders → Check if Turbopack supports natively

**Warning signs:** Build fails immediately after upgrading to Next.js 16.

**Source:** [Next.js 16 Official Announcement](https://nextjs.org/blog/next-16)

### Pitfall 4: Tailwind CSS 4 Browser Support Breaking Older Browsers

**What goes wrong:** Site renders with no styles in older browsers (Safari <16.4, Chrome <111, Firefox <128).

**Why it happens:** Tailwind CSS 4 depends on modern CSS features (`@property`, `color-mix()`) that don't work in older browsers. No fallbacks.

**How to avoid:**
- Accept modern browser requirement (recommended for new projects in 2026)
- OR stay on Tailwind CSS 3 if supporting older browsers is critical
- Check analytics: if <2% users on old browsers, safe to upgrade

**Warning signs:** Support requests from users on older browsers/devices seeing unstyled content.

**Source:** [Tailwind CSS 4 Migration Guide](https://medium.com/@mernstackdevbykevin/tailwind-css-v4-0-complete-migration-guide-breaking-changes-you-need-to-know-7f99944a9f95)

### Pitfall 5: Overusing `will-change` for Animations

**What goes wrong:** Animations become laggy, memory usage spikes, browser tabs crash on mobile devices.

**Why it happens:** `will-change` tells browser to optimize for upcoming changes, but overuse creates too many GPU layers, exhausting memory.

**How to avoid:**
- Use `will-change` only on elements actively animating
- Remove `will-change` after animation completes
- Prefer `transform` and `opacity` (GPU-accelerated by default without `will-change`)
- Limit `will-change` to 4-6 elements max simultaneously

```css
/* ❌ BAD: will-change on everything */
.card {
  will-change: transform, opacity; /* Always active! */
}

/* ✅ GOOD: will-change only during animation */
.card {
  transition: transform 0.3s;
}
.card:hover {
  will-change: transform; /* Added only when needed */
  transform: scale(1.05);
}
.card:not(:hover) {
  will-change: auto; /* Removed after animation */
}
```

**Warning signs:** Choppy animations on mobile, high memory usage in DevTools Performance tab, browser warnings about excessive layers.

**Source:** [iPixel Creative - Smooth CSS Animations: 60 FPS Performance Guide](https://ipixel.com.sg/web-development/how-to-achieve-smooth-css-animations-60-fps-performance-guide/)

### Pitfall 6: Ignoring `prefers-reduced-motion`

**What goes wrong:** Users with vestibular disorders, migraines, or seizure triggers experience physical discomfort or worse from animations.

**Why it happens:** Developers forget to check `prefers-reduced-motion` media query, violating WCAG 2.1 Level AA (2.3.3 Animation from Interactions).

**How to avoid:**
- Wrap animations in `@media (prefers-reduced-motion: no-preference)`
- OR disable transform/scale animations but keep opacity/color transitions
- Use GSAP's `useReducedMotion` hook (automatically respects preference)

```css
/* ✅ GOOD: Respect user preference */
.hero {
  transition: opacity 0.3s; /* Safe for everyone */
}

@media (prefers-reduced-motion: no-preference) {
  .hero {
    transition: opacity 0.3s, transform 0.5s; /* Only if user allows */
  }
}
```

**Warning signs:** Accessibility audit fails, users report motion sickness, legal compliance issues (ADA Title II enforcement April 2026, European Accessibility Act now in effect).

**Source:** [Vercel Blog - Improving Accessibility of Our Next.js Site](https://vercel.com/blog/improving-the-accessibility-of-our-nextjs-site)

### Pitfall 7: Missing `blurDataURL` for Remote Images

**What goes wrong:** Blur placeholder doesn't show for remote images, causing jarring image pops during load.

**Why it happens:** `next/image` auto-generates `blurDataURL` for local static imports (jpg, png, webp, avif) but **not** for remote images (URLs).

**How to avoid:**
- Use `plaiceholder` library to generate base64 blurred images at build time
- OR use a solid color placeholder: `placeholder="empty"` or custom color
- Keep `blurDataURL` small (<2KB base64) to avoid performance hit

```typescript
// ❌ BAD: Remote image without blur
<Image src="https://..." alt="..." fill placeholder="blur" />
// Error: "blurDataURL" property is missing

// ✅ GOOD: Use plaiceholder
import { getPlaiceholder } from 'plaiceholder'

const { base64 } = await getPlaiceholder(imageUrl)
<Image src={imageUrl} alt="..." fill placeholder="blur" blurDataURL={base64} />
```

**Warning signs:** Blur effect works for local images but not remote ones, console warnings about missing blurDataURL.

**Source:** [Next.js Official Docs - Image Component](https://nextjs.org/docs/app/api-reference/components/image)

### Pitfall 8: Animating Non-Composited Properties

**What goes wrong:** Animations drop frames (below 60fps), feel janky, especially on mobile.

**Why it happens:** Animating `width`, `height`, `top`, `left`, `margin`, `padding` triggers layout reflow (entire page recalculated). Browser can't offload to GPU.

**How to avoid:**
- **Only animate `transform` and `opacity`** - these are GPU-accelerated composite properties
- Use `transform: translateX()` instead of `left`, `transform: scale()` instead of `width`
- Check Chrome DevTools Performance tab: look for purple "Layout" bars (bad sign)

```css
/* ❌ BAD: Animating layout properties */
.modal {
  transition: width 0.3s, height 0.3s; /* Triggers reflow! */
}

/* ✅ GOOD: Animating composite properties */
.modal {
  transition: transform 0.3s, opacity 0.3s; /* GPU-accelerated */
}
```

**Warning signs:** Janky animations, Performance tab shows "Layout" events during animation, 60fps target not met.

**Source:** [Smashing Magazine - GPU Animation: Doing It Right](https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/)

## Code Examples

Verified patterns from official sources:

### Complete Root Layout with Dark Mode, Fonts, and Metadata

```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import { inter, sourceCodePro } from '@/lib/fonts'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://shrikemedia.com'),
  title: {
    default: 'Shrike Media | Premium Video Production',
    template: '%s | Shrike Media',
  },
  description: 'Award-winning video production and creative services for brands that demand excellence.',
  openGraph: {
    title: 'Shrike Media | Premium Video Production',
    description: 'Award-winning video production and creative services.',
    url: 'https://shrikemedia.com',
    siteName: 'Shrike Media',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Shrike Media - Premium Video Production',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shrike Media | Premium Video Production',
    description: 'Award-winning video production and creative services.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceCodePro.variable} dark`}>
      <head>
        {/* Prevent FOUC for dark mode */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.theme ||
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.toggle('dark', theme === 'dark');
              })();
            `,
          }}
        />
      </head>
      <body className="bg-zinc-950 text-zinc-50 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
```

**Source:** [Next.js Official Docs - generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata), [Tailwind CSS - Dark Mode](https://tailwindcss.com/docs/dark-mode)

### Font Configuration with next/font

```typescript
// lib/fonts.ts
import { Inter, Source_Code_Pro } from 'next/font/google'
import localFont from 'next/font/local'

// Primary sans-serif (UI, body text)
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  // Optionally limit weights to reduce payload
  weight: ['400', '500', '600', '700'],
})

// Monospace (code snippets, technical details)
export const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '600'],
})

// Premium font (Geist for headlines - downloaded from Vercel)
export const geist = localFont({
  src: [
    {
      path: '../public/fonts/Geist-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Geist-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/Geist-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-geist',
})
```

**Tailwind config to use font variables:**
```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --font-family-sans: var(--font-inter), system-ui, sans-serif;
  --font-family-mono: var(--font-mono), 'Courier New', monospace;
  --font-family-display: var(--font-geist), var(--font-inter), sans-serif;
}
```

**Source:** [Next.js Official Docs - Font Optimization](https://nextjs.org/docs/app/getting-started/fonts)

### Responsive Image with Blur Placeholder

```typescript
// components/ProjectCard.tsx
import Image from 'next/image'
import type { Project } from '@/types/portfolio'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-lg">
      {/* Image container with fixed aspect ratio */}
      <div className="relative aspect-video bg-zinc-900">
        <Image
          src={project.thumbnail}
          alt={project.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          placeholder="blur"
          blurDataURL={project.blurDataURL}
        />
      </div>

      {/* Overlay with project info */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
        <div className="absolute bottom-0 p-6">
          <h3 className="text-xl font-display font-bold">{project.title}</h3>
          <p className="text-sm text-zinc-300">{project.category}</p>
        </div>
      </div>
    </article>
  )
}
```

**Source:** [Next.js Official Docs - Image Component](https://nextjs.org/docs/app/api-reference/components/image)

### Dynamic Metadata for Portfolio Pieces

```typescript
// app/work/[slug]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Script from 'next/script'

type Props = {
  params: Promise<{ slug: string }>
}

// Mock data fetch (replace with real CMS/database)
async function getProject(slug: string) {
  const res = await fetch(`https://api.shrikemedia.com/projects/${slug}`, {
    next: { revalidate: 3600 }, // Revalidate every hour
  })
  if (!res.ok) return null
  return res.json()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = await getProject(slug)

  if (!project) return {}

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      type: 'video.movie', // For video production
      images: [
        {
          url: project.thumbnail,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
      videos: [
        {
          url: project.videoUrl,
          width: 1920,
          height: 1080,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
      images: [project.thumbnail],
    },
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = await getProject(slug)

  if (!project) notFound()

  // JSON-LD structured data for CreativeWork
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `https://shrikemedia.com/work/${slug}`,
    name: project.title,
    description: project.description,
    image: project.thumbnail,
    url: `https://shrikemedia.com/work/${slug}`,
    author: {
      '@type': 'Organization',
      name: 'Shrike Media',
      url: 'https://shrikemedia.com',
    },
    datePublished: project.publishedAt,
    keywords: project.tags.join(', '),
    inLanguage: 'en-US',
    ...(project.awards && {
      award: project.awards.join(', '),
    }),
  }

  return (
    <>
      {/* JSON-LD structured data */}
      <Script
        id="project-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-display font-bold mb-4">{project.title}</h1>
        <p className="text-xl text-zinc-400 mb-8">{project.description}</p>

        {/* Video or image */}
        <div className="relative aspect-video mb-8">
          {project.videoUrl ? (
            <video
              src={project.videoUrl}
              controls
              poster={project.thumbnail}
              className="w-full h-full"
            />
          ) : (
            <Image
              src={project.thumbnail}
              alt={project.title}
              fill
              className="object-cover"
              priority
            />
          )}
        </div>

        {/* Project details */}
        <div className="prose prose-invert prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: project.content }} />
        </div>
      </article>
    </>
  )
}
```

**Source:** [Next.js Official Docs - generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata), [Schema.org - CreativeWork](https://schema.org/CreativeWork)

### Accessible Navigation with ARIA Landmarks

```typescript
// components/Navigation.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/work', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav aria-label="Primary navigation" className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-display font-bold">
          Shrike Media
        </Link>

        {/* Desktop navigation */}
        <ul className="hidden md:flex gap-8" role="list">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`transition-colors hover:text-amber-400 ${
                    isActive ? 'text-amber-400' : 'text-zinc-300'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-zinc-800">
          <ul className="px-4 py-4 space-y-4" role="list">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block py-2 transition-colors hover:text-amber-400 ${
                      isActive ? 'text-amber-400' : 'text-zinc-300'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </nav>
  )
}
```

**Source:** [W3C WAI-ARIA - Landmark Regions](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/), [W3C WAI-ARIA - Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)

### Accessibility: prefers-reduced-motion Hook

```typescript
// hooks/useReducedMotion.ts
'use client'

import { useEffect, useState } from 'react'

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

// Usage in a component
'use client'

import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useEffect, useRef } from 'react'

export default function AnimatedHero() {
  const prefersReducedMotion = useReducedMotion()
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion || !heroRef.current) return

    // Only animate if user allows motion
    // GSAP animation code here (Phase 3)

  }, [prefersReducedMotion])

  return (
    <div ref={heroRef} className="hero">
      {/* Content */}
    </div>
  )
}
```

**CSS approach (alternative):**
```css
/* app/globals.css */
@import "tailwindcss";

/* Safe animations for everyone */
.fade-in {
  opacity: 0;
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  to { opacity: 1; }
}

/* Motion animations only if user allows */
@media (prefers-reduced-motion: no-preference) {
  .slide-up {
    transform: translateY(50px);
    animation: slideUp 0.5s forwards;
  }

  @keyframes slideUp {
    to { transform: translateY(0); }
  }
}

/* Disable motion animations if user prefers reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Source:** [MDN - prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion), [Vercel Blog - Improving Accessibility](https://vercel.com/blog/improving-the-accessibility-of-our-nextjs-site)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router (`pages/`) | App Router (`app/`) | Next.js 13 (Oct 2022), stable in 14+ | Server Components by default, streaming, improved SEO with Metadata API, nested layouts, file-based metadata (opengraph-image.tsx) |
| Manual meta tags in `_document.tsx` | Metadata API with `generateMetadata` | Next.js 13+ | Type-safe, automatic merging, dynamic data fetching, streams after initial UI |
| Webpack bundler | Turbopack | Next.js 16 (Jan 2026) | 10x faster builds in dev, 60% faster in production, custom webpack configs no longer supported |
| Synchronous `params`/`searchParams` | Async `params`/`searchParams` | Next.js 15 (Oct 2024), enforced in 16 | All dynamic routes must await params, breaking change |
| `@tailwind` directives | `@import "tailwindcss"` | Tailwind CSS 4 (2024) | CSS-first config, `@theme` directive, no more `tailwind.config.js` required |
| JavaScript config (`tailwind.config.js`) | CSS config (`@theme` in globals.css) | Tailwind CSS 4 | Simpler, faster, CSS variables by default, modern browser requirement |
| `font-display: optional` | `font-display: swap` | Next.js 13+ (next/font default) | Text visible immediately with fallback, swaps when loaded, reduces CLS |
| Google Fonts CDN | Self-hosted with `next/font` | Next.js 13+ | Privacy (no external requests), performance (preloading), automatic subsetting |
| Manual JPEG/PNG | WebP with JPEG fallback | ~2020 (96% browser support) | 25-35% smaller than JPEG at same quality |
| WebP | AVIF with WebP fallback | 2023+ (90-93% browser support) | 20-30% smaller than WebP, 50% smaller than JPEG |
| Manual blur placeholders | `plaiceholder` library + `blurDataURL` | Next.js 13+ | Automatic base64 generation, integrates with next/image |
| React 18 | React 19 with Server Components | Released Dec 5, 2024 | View Transitions API, useEffectEvent, Activity component, stricter ref forwarding |

**Deprecated/outdated:**
- **Pages Router (`pages/`)**: Still supported but App Router is now standard for new projects. Pages Router lacks Server Components, streaming, and modern metadata APIs.
- **Custom webpack config in Next.js 16+**: Turbopack doesn't support webpack loaders. Use Next.js built-in features or opt out of Turbopack.
- **Tailwind CSS v3 directives (`@tailwind base`)**: Removed in v4. Use `@import "tailwindcss"`.
- **Synchronous `params` access**: Removed in Next.js 16. Must `await params`.
- **Build size metrics in `next build` output**: Removed in Next.js 16 as inaccurate for Server Components architecture.
- **GSAP bonus plugins paywall**: All GSAP plugins (SplitText, ScrollSmoother, MorphSVG, etc.) are now FREE as of 2025 thanks to Webflow sponsorship.

## Open Questions

Things that couldn't be fully resolved:

1. **Tailwind CSS 4 third-party plugin compatibility**
   - What we know: Many Tailwind v3 plugins (e.g., @tailwindcss/typography, @tailwindcss/forms) are not yet v4-compatible as of January 2026.
   - What's unclear: Timeline for official plugins to support v4, whether community plugins will migrate.
   - Recommendation: Check plugin compatibility before upgrading to Tailwind v4. If using critical plugins (typography for blog), may need to stay on v3 temporarily. Alternatively, reimplement needed styles in CSS.

2. **GSAP + Lenis integration with Next.js 16 Turbopack**
   - What we know: GSAP 3.14+ works with Next.js via `@gsap/react` and `useGSAP` hook. Lenis integrates with GSAP ScrollTrigger. Both are deferred to Phase 3.
   - What's unclear: Whether Turbopack optimizes these libraries correctly, any performance regressions vs Webpack.
   - Recommendation: Benchmark in Phase 3. If performance issues arise, consider `next build --experimental-turbo=false` as temporary workaround.

3. **React Compiler stability in production**
   - What we know: Next.js 16 enables React Compiler by default if `react-compiler-runtime` is installed. Known issues: breaks components using context with inline object creation, increases build times, incompatible with some third-party libraries (Recoil, older MUI versions).
   - What's unclear: Production stability, memory usage, real-world performance gains vs overhead.
   - Recommendation: Disable React Compiler for Phase 1 stability. Revisit in Phase 3 once animations/interactivity are added. To disable: remove `react-compiler-runtime` or set `experimental.reactCompiler: false` in `next.config.ts`.

4. **AVIF adoption rate and CDN support**
   - What we know: AVIF has 90-93% browser support (Jan 2026), 20-30% smaller than WebP. `next/image` auto-detects and serves AVIF to supporting browsers.
   - What's unclear: CDN support quality (Vercel, Cloudflare), edge case browsers, whether all 90-93% support is production-ready.
   - Recommendation: Use AVIF with WebP fallback (next/image handles automatically). Monitor analytics for unsupported browsers. If >5% users on unsupported browsers, may need explicit fallback strategy.

5. **Font subsetting impact on non-Latin characters**
   - What we know: `next/font` with `subsets: ['latin']` strips non-Latin characters, reducing payload. Google Fonts supports multiple subsets (latin, latin-ext, cyrillic, greek, etc.).
   - What's unclear: Impact on user-generated content with special characters (e.g., client names with accents, international project titles).
   - Recommendation: If client names or project titles include non-Latin characters, add relevant subsets: `subsets: ['latin', 'latin-ext']`. Monitor for missing character glyphs in production.

## Sources

### Primary (HIGH confidence)

**Official Documentation:**
- [Next.js Getting Started - Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) - App Router folder conventions
- [Next.js generateMetadata API Reference](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) - Complete metadata fields, dynamic metadata
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) - Component architecture
- [Next.js Image Component](https://nextjs.org/docs/app/api-reference/components/image) - Image optimization API
- [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts) - next/font configuration
- [Next.js Version 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) - Breaking changes, async params
- [Next.js 16 Official Announcement](https://nextjs.org/blog/next-16) - Turbopack default, React 19.2 features
- [Tailwind CSS Dark Mode Documentation](https://tailwindcss.com/docs/dark-mode) - v4 dark mode configuration
- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide) - Migration from v3
- [React 19 Official Release Notes](https://react.dev/blog/2024/12/05/react-19) - New features, breaking changes
- [Schema.org CreativeWork Type](https://schema.org/CreativeWork) - JSON-LD structured data for portfolio
- [W3C WAI-ARIA Landmark Regions](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/) - ARIA best practices
- [W3C WAI-ARIA Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/) - Keyboard navigation
- [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) - Accessibility media query

**Security Advisories:**
- [InfoWorld - React/Next.js Security Update](https://www.infoworld.com/article/4100641/developers-urged-to-immediately-upgrade-react-next-js.html) - CVE-2025-55183, CVE-2025-55184

### Secondary (MEDIUM confidence)

**WebSearch verified with official sources:**
- [How to Configure SEO in Next.js 16](https://jsdevspace.substack.com/p/how-to-configure-seo-in-nextjs-16) - Metadata API implementation
- [Vercel Blog - Improving Accessibility of Next.js Site](https://vercel.com/blog/improving-the-accessibility-of-our-nextjs-site) - prefers-reduced-motion best practices
- [Tailwind CSS 4 Migration Guide](https://medium.com/@mernstackdevbykevin/tailwind-css-v4-0-complete-migration-guide-breaking-changes-you-need-to-know-7f99944a9f95) - Breaking changes, browser support
- [Next.js Composition Patterns](https://nextjs.org/docs/14/app/building-your-application/rendering/composition-patterns) - Server/Client Component composition
- [Typewolf - Best Google Fonts 2026](https://www.typewolf.com/google-fonts) - Inter, Geist, typography recommendations
- [Muzli Blog - Best Free Google Fonts 2026](https://muz.li/blog/best-free-google-fonts-for-2026/) - Font pairings, technical precision fonts
- [Creative Boom - 50 Fonts Popular in 2026](https://www.creativeboom.com/resources/top-50-fonts-in-2026/) - LL Akkurat, GT Sectra, premium fonts
- [AVIF vs WebP 2026](https://elementor.com/blog/webp-vs-avif/) - Format comparison, browser support
- [Next.js Image Optimization Guide](https://strapi.io/blog/nextjs-image-optimization-developers-guide) - Sharp integration, performance metrics
- [iPixel Creative - 60 FPS CSS Animations](https://ipixel.com.sg/web-development/how-to-achieve-smooth-css-animations-60-fps-performance-guide/) - GPU acceleration, will-change
- [Smashing Magazine - GPU Animation: Doing It Right](https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/) - Transform/opacity best practices

**GSAP + Lenis Integration:**
- [Setting Up GSAP with Next.js 2025 Edition](https://javascript.plainenglish.io/setting-up-gsap-with-next-js-2025-edition-bcb86e48eab6) - useGSAP hook, cleanup
- [Optimizing GSAP Animations in Next.js 15](https://medium.com/@thomasaugot/optimizing-gsap-animations-in-next-js-15-best-practices-for-initialization-and-cleanup-2ebaba7d0232) - Memory management, Core Web Vitals
- [Lenis Smooth Scroll Implementation](https://devdreaming.com/blogs/nextjs-smooth-scrolling-with-lenis-gsap) - Next.js integration patterns
- [Why Lenis Needs to Become a Browser Standard](https://medium.com/@nattupi/why-lenis-smooth-scroll-needs-to-become-a-browser-standard-62bed416c987) - Library overview, performance

**Migration Experiences:**
- [I Upgraded Three Apps to React 19. Here's What Broke](https://medium.com/@quicksilversel/i-upgraded-three-apps-to-react-19-heres-what-broke-648087c7217b) - Real-world migration issues
- [Migrating to Next.js 16: What Broke in Production](https://www.amillionmonkeys.co.uk/blog/migrating-to-nextjs-16-production-guide) - Turbopack, React Compiler gotchas

### Tertiary (LOW confidence - marked for validation)

**WebSearch only, requires verification:**
- Community blog posts about font pairings (need to verify with actual font usage in portfolio sites)
- WebSearch results about JSON-LD for portfolios (structure confirmed with schema.org, but implementation examples not from official sources)
- Performance benchmarks for AVIF vs WebP (need to verify with real-world testing on Vercel)

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** - All libraries officially documented, versions verified, security patches confirmed
- Architecture: **HIGH** - Official Next.js patterns, verified with current docs (Jan 2026)
- Pitfalls: **MEDIUM-HIGH** - Breaking changes confirmed from official sources, real-world migration reports support findings
- Typography: **MEDIUM** - Font recommendations from reputable design sources (Typewolf, Creative Boom), but subjective; need to verify visual fit with dark cinematic theme
- GSAP/Lenis: **MEDIUM** - Deferred to Phase 3, but integration patterns verified from recent community implementations (2025)
- Accessibility: **HIGH** - W3C/MDN official sources, WCAG 2.1 compliance standards

**Research date:** 2026-01-30
**Valid until:** 2026-02-28 (30 days - stack is fast-moving with security patches)

**Recommendation for planner:** Research is production-ready. Standard stack is mature, breaking changes are well-documented with migration paths, and all Phase 1 requirements (TECH-01 through TECH-05, DSGN-01, DSGN-03, DSGN-04) can be satisfied with verified patterns. Prioritize security updates (React 19.2.4+, Next.js 16.1.3+) and establish accessibility foundation (prefers-reduced-motion, ARIA) early to enforce in Phase 3.
