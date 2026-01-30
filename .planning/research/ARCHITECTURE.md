# Architecture Patterns: High-End Creative Portfolio

**Domain:** Cinematic portfolio website with heavy animation and video
**Project:** Shrike Media
**Researched:** 2026-01-30

## Executive Summary

High-end creative portfolios in 2026 follow a **server-first, client-islands architecture** that prioritizes performance while delivering cinematic experiences. The key insight: animations and rich media don't require client-heavy SPAs. Instead, modern portfolios use Server Components for structure, targeted Client Components for interactivity, and GPU-accelerated animations via GSAP/WebGL.

**Critical architectural decision:** Next.js App Router with React Server Components as the foundation, with Client Components isolated to specific interactive boundaries (scroll controllers, video players, menu interactions).

## Recommended Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js App Router                       │
│                      (Server Components Default)                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        v                v                v
┌───────────────┐ ┌──────────────┐ ┌────────────────┐
│  Page Layouts │ │   UI Shell   │ │  Content Layer │
│  (Server)     │ │  (Server)    │ │  (Server)      │
│               │ │              │ │                │
│ - app/page.tsx│ │ - Header     │ │ - Static text  │
│ - portfolio/  │ │ - Footer     │ │ - Metadata     │
│ - services/   │ │ - Navigation │ │ - Hardcoded    │
└───────┬───────┘ └──────┬───────┘ └────────────────┘
        │                │
        └────────────────┼──────────────────────────┐
                         │                          │
                         v                          v
              ┌──────────────────────┐   ┌─────────────────────┐
              │  Client Islands      │   │  Media Layer        │
              │  ("use client")      │   │  (Optimized)        │
              ├──────────────────────┤   ├─────────────────────┤
              │                      │   │                     │
              │ - ScrollController   │   │ - VideoPlayer       │
              │   (Lenis + GSAP)     │   │   (lazy loaded)     │
              │                      │   │                     │
              │ - AnimationEngine    │   │ - ImageOptimizer    │
              │   (GSAP contexts)    │   │   (next/image)      │
              │                      │   │                     │
              │ - InteractiveMenu    │   │ - VideoOptimizer    │
              │   (state + gestures) │   │   (CDN + adaptive)  │
              │                      │   │                     │
              │ - 3D Elements        │   │ - AssetPreloader    │
              │   (R3F - optional)   │   │   (intersection)    │
              └──────────────────────┘   └─────────────────────┘
```

### Data Flow Direction

```
Server (Build/Request Time)
    │
    ├──> Render Page Structure (RSC)
    ├──> Inject Static Content
    ├──> Generate Metadata
    │
    └──> Send HTML + Minimal JS to Client
              │
              v
Client (Runtime)
    │
    ├──> Hydrate Client Islands
    ├──> Initialize Scroll Controller
    ├──> Setup Animation Contexts
    │
    └──> User Interaction
              │
              ├──> Scroll Event → Lenis → GSAP ScrollTrigger
              ├──> Viewport Intersection → Lazy Load Media
              ├──> Route Change → Prefetch + Animate Transition
              └──> Menu Toggle → State Update → Animation
```

## Component Boundaries

### Layer 1: Server Foundation (Next.js App Router)

| Component | Responsibility | Renders | Communicates With |
|-----------|---------------|---------|-------------------|
| `app/layout.tsx` | Root layout, global providers, fonts | Server | All pages, metadata API |
| `app/page.tsx` | Home page structure | Server | Client islands (ScrollController, VideoHero) |
| `app/portfolio/page.tsx` | Portfolio grid structure | Server | Client islands (FilterBar, GridAnimator) |
| `app/services/page.tsx` | Services + Calendly embed | Server | Client island (CalendlyEmbed) |
| `components/Header.tsx` | Navigation shell | Server | Client island (MobileMenu) |
| `components/Footer.tsx` | Footer content | Server | None (static) |

**Why Server Components:**
- Zero client JS for static content
- SEO-friendly (full HTML on first render)
- Fast initial load (no hydration for these)
- Direct access to hardcoded content (no API layer needed)

### Layer 2: Client Islands (Strategic Interactivity)

| Component | Responsibility | Client JS | Dependencies |
|-----------|---------------|-----------|--------------|
| `components/ScrollController.tsx` | Smooth scroll + sync GSAP | ~15KB | Lenis, GSAP |
| `components/AnimationEngine.tsx` | GSAP context provider | ~8KB | GSAP, ScrollTrigger |
| `components/VideoHero.tsx` | Video player with controls | ~12KB | Intersection Observer |
| `components/InteractiveMenu.tsx` | Mobile menu + transitions | ~6KB | Framer Motion (optional) |
| `components/FilterBar.tsx` | Portfolio category filter | ~4KB | React state |
| `components/GridAnimator.tsx` | Portfolio grid reveal | ~10KB | GSAP, Intersection Observer |
| `components/CalendlyEmbed.tsx` | Calendly integration | External | Calendly widget |

**Why Client Components:**
- Need React hooks (useState, useEffect, useRef)
- Browser APIs (window, document, Intersection Observer)
- Event handlers (onClick, onScroll)
- Third-party libraries requiring DOM access

**Client-Server Boundary Pattern:**
```tsx
// app/page.tsx (Server Component)
export default function HomePage() {
  return (
    <main>
      <Header /> {/* Server */}
      <VideoHero /> {/* Client - needs video controls */}
      <section>
        <h2>About Shrike</h2> {/* Server */}
        <p>Static content...</p> {/* Server */}
      </section>
      <ScrollReveal> {/* Client - needs Intersection Observer */}
        <PortfolioPreview /> {/* Server - just markup */}
      </ScrollReveal>
    </main>
  )
}
```

### Layer 3: Animation Architecture

**GSAP + Lenis Integration Pattern:**

```
┌─────────────────────────────────────────────────────┐
│           ScrollController (Client Component)        │
│  - Initializes Lenis smooth scroll                  │
│  - Syncs with GSAP ticker                           │
│  - Provides scroll context to children              │
└──────────────────────┬──────────────────────────────┘
                       │
                       v
        ┌──────────────────────────────┐
        │   GSAP ScrollTrigger Sync    │
        │   lenis.on('scroll',         │
        │     ScrollTrigger.update)    │
        └──────────────┬───────────────┘
                       │
        ┌──────────────┴───────────────┐
        │                              │
        v                              v
┌───────────────────┐      ┌──────────────────────┐
│ Section Animators │      │  Element Animators   │
│                   │      │                      │
│ - Hero parallax   │      │ - Text reveals       │
│ - Section reveals │      │ - Image fades        │
│ - Pinned sections │      │ - Micro-interactions │
└───────────────────┘      └──────────────────────┘
```

**Architectural Benefits:**
1. **Single scroll source:** Lenis provides smooth, normalized scroll
2. **GPU acceleration:** GSAP uses transforms (not top/left)
3. **RequestAnimationFrame sync:** Via GSAP ticker
4. **Modular triggers:** Each section owns its animations
5. **No layout thrashing:** Batch reads/writes through GSAP

**Implementation Pattern:**
```tsx
// components/ScrollController.tsx (Client Component)
'use client'

import Lenis from '@studio-freight/lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function ScrollController({ children }) {
  useEffect(() => {
    // 1. Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    // 2. Sync Lenis with ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    // 3. Add to GSAP ticker
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    // 4. Disable lag smoothing
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      gsap.ticker.remove(lenis.raf)
    }
  }, [])

  return <>{children}</>
}
```

### Layer 4: Media Optimization Architecture

**Video Strategy:**

```
Video Hero (autoplay, loop, muted)
    │
    ├──> Source Selection
    │    - Desktop: 1080p MP4/WebM
    │    - Mobile: 720p MP4
    │    - Fallback: Poster image
    │
    ├──> Lazy Loading Strategy
    │    - Above fold: Preload
    │    - Below fold: Intersection Observer
    │    - preload="metadata" for instant play
    │
    ├──> Format Optimization
    │    - Primary: WebM (web-optimized)
    │    - Fallback: MP4 (universal)
    │    - Codec: H.264/VP9
    │    - Compression: FFmpeg (bitrate control)
    │
    └──> CDN Delivery
         - Vercel Blob / Cloudinary
         - Adaptive streaming (optional)
         - Edge caching
```

**Image Strategy:**

```tsx
// Use next/image for automatic optimization
<Image
  src="/portfolio/project-1.jpg"
  width={1200}
  height={800}
  quality={85}
  priority={isAboveFold} // LCP optimization
  placeholder="blur"
  blurDataURL={blurDataUrl}
/>
```

**Loading Priority:**
1. **Critical (preload):** Hero video, above-fold images
2. **High (eager):** First portfolio items
3. **Low (lazy):** Below-fold content via Intersection Observer
4. **Deferred:** Non-visible sections until scroll proximity

## Architecture Patterns to Follow

### Pattern 1: Server-First Component Design

**What:** Default to Server Components, opt into Client Components only when needed

**When:** All new components should start as Server Components

**Why:**
- Smaller client bundle (better performance)
- Automatic code splitting
- Better SEO (full HTML on first render)
- Simpler data flow (no prop drilling for static content)

**Example:**
```tsx
// GOOD: Server Component with Client island
// app/portfolio/page.tsx
export default function PortfolioPage() {
  const projects = getProjects() // Can be sync, runs on server

  return (
    <main>
      <h1>Portfolio</h1> {/* Server */}
      <FilterBar /> {/* Client - needs state */}
      <ProjectGrid projects={projects}> {/* Server */}
        {projects.map(project => (
          <ProjectCard key={project.id} {...project} /> {/* Server */}
        ))}
      </ProjectGrid>
    </main>
  )
}

// BAD: Unnecessary Client Component
'use client' // ❌ Entire page is client-side
export default function PortfolioPage() {
  // Now everything needs hydration
}
```

### Pattern 2: GSAP Context Isolation

**What:** Each animated section owns its GSAP context

**When:** Creating scroll-triggered animations

**Why:**
- Automatic cleanup on unmount
- Scoped selectors (no global conflicts)
- Better performance (isolated timelines)
- Easier debugging

**Example:**
```tsx
'use client'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function HeroSection() {
  const containerRef = useRef(null)

  useGSAP(() => {
    // Animations scoped to this section
    gsap.from('.hero-title', {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top center',
        end: 'bottom top',
        scrub: true,
      },
      y: 100,
      opacity: 0,
    })
  }, { scope: containerRef }) // ← Cleanup on unmount

  return <section ref={containerRef}>...</section>
}
```

### Pattern 3: Intersection Observer for Lazy Loading

**What:** Load media only when entering viewport

**When:** Below-fold videos, images, heavy components

**Why:**
- Faster initial load
- Reduced bandwidth
- Better Core Web Vitals (LCP, CLS)

**Example:**
```tsx
'use client'
import { useInView } from 'react-intersection-observer'

export function LazyVideo({ src, poster }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <div ref={ref}>
      {inView ? (
        <video src={src} poster={poster} autoPlay muted loop />
      ) : (
        <img src={poster} alt="Video placeholder" />
      )}
    </div>
  )
}
```

### Pattern 4: Animation State Machine

**What:** Centralize animation states for complex interactions

**When:** Menu transitions, page transitions, multi-step animations

**Why:**
- Predictable state transitions
- Prevents animation conflicts
- Easier to debug
- Better accessibility (reduced motion support)

**Example:**
```tsx
'use client'
import { useReducer } from 'react'
import { gsap } from 'gsap'

type AnimState = 'idle' | 'opening' | 'open' | 'closing'

export function InteractiveMenu() {
  const [state, dispatch] = useReducer(animReducer, 'idle')

  const open = () => {
    if (state !== 'idle') return
    dispatch({ type: 'OPEN_START' })
    gsap.to('.menu', {
      x: 0,
      onComplete: () => dispatch({ type: 'OPEN_COMPLETE' })
    })
  }

  // State machine prevents conflicting animations
}
```

### Pattern 5: Progressive Enhancement

**What:** Core functionality works without JS, animations enhance

**When:** Navigation, forms, content display

**Why:**
- Accessibility
- Resilience (JS fails gracefully)
- Better SEO
- Faster perceived performance

**Example:**
```tsx
// Server Component: Works without JS
export function Navigation() {
  return (
    <nav>
      <a href="/">Home</a>
      <a href="/portfolio">Portfolio</a>
      <a href="/services">Services</a>
    </nav>
  )
}

// Client Component: Enhances with transitions
'use client'
export function AnimatedNavigation() {
  return (
    <Navigation /> {/* Wrapped in animation context */}
  )
}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Client-First Thinking

**What:** Making everything a Client Component by default

**Why bad:**
- Bloated client bundle
- Slower initial load
- Worse SEO (CSR delay)
- Unnecessary hydration cost

**Instead:** Default to Server Components, isolate Client Components to interactive boundaries

**Example of bad:**
```tsx
'use client' // ❌ Entire app is client-side
export default function RootLayout({ children }) {
  return <html>...</html>
}
```

**Example of good:**
```tsx
// ✅ Server Component layout
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ScrollController> {/* Only this is client */}
          {children}
        </ScrollController>
      </body>
    </html>
  )
}
```

### Anti-Pattern 2: Scroll Event Listeners

**What:** Using `window.addEventListener('scroll', ...)` directly

**Why bad:**
- Blocks main thread
- Causes layout thrashing
- Poor performance on low-end devices
- Not compatible with smooth scroll libraries

**Instead:** Use Intersection Observer for triggers, GSAP ScrollTrigger for animations

**Example of bad:**
```tsx
'use client'
useEffect(() => {
  window.addEventListener('scroll', () => {
    // ❌ Runs on every scroll frame
    if (window.scrollY > 100) {
      element.style.opacity = '1' // ❌ Forces reflow
    }
  })
}, [])
```

**Example of good:**
```tsx
'use client'
useGSAP(() => {
  gsap.to('.element', {
    scrollTrigger: {
      trigger: '.element',
      start: 'top center',
      toggleActions: 'play none none reverse',
    },
    opacity: 1,
  })
})
```

### Anti-Pattern 3: Eager Media Loading

**What:** Loading all videos/images on page load

**Why bad:**
- Massive initial payload
- Slow LCP (Largest Contentful Paint)
- Wasted bandwidth (user may not scroll)
- Poor mobile experience

**Instead:** Lazy load below-fold media with Intersection Observer

### Anti-Pattern 4: Inline Styles for Animations

**What:** Animating via inline styles instead of CSS/GSAP

**Why bad:**
- Forces style recalculation every frame
- No GPU acceleration
- Janky animations
- Hard to maintain

**Instead:** Use CSS transforms (GSAP does this automatically) for GPU-accelerated animations

### Anti-Pattern 5: Global Animation Contexts

**What:** Single GSAP timeline for entire page

**Why bad:**
- Memory leaks (no cleanup)
- Conflicts between sections
- Hard to debug
- Breaks on route changes

**Instead:** Use scoped GSAP contexts with `useGSAP` hook

## Scalability Considerations

| Concern | At Launch (3 pages) | At Scale (20+ projects) | At Enterprise (100+ pages) |
|---------|-------------------|------------------------|---------------------------|
| **Content Management** | Hardcoded JSON/TypeScript | Headless CMS (Sanity/Contentful) | Enterprise CMS + CDN |
| **Image Storage** | `/public` folder | Cloudinary / Vercel Blob | Multi-region CDN + Image CDN |
| **Video Delivery** | Self-hosted MP4 | Cloudinary Video / Mux | Adaptive streaming (HLS/DASH) |
| **Animation Complexity** | GSAP + Lenis | Same (scales well) | Add virtual scrolling |
| **Build Time** | <30s (static) | ISR for projects | ISR + On-Demand Revalidation |
| **Deployment** | Vercel (serverless) | Vercel (Edge) | Multi-region Edge |
| **Search/Filter** | Client-side filter | Algolia / Meilisearch | Elasticsearch + Faceting |
| **Analytics** | Vercel Analytics | Custom events + PostHog | Full product analytics suite |

### Migration Path (if needed later)

**Phase 1 (Current):** Hardcoded content in TypeScript
```tsx
// lib/content.ts
export const projects = [
  { id: 1, title: 'Project A', ... },
  // ...
]
```

**Phase 2 (Growth):** MDX for project pages
```tsx
// content/projects/project-a.mdx
---
title: Project A
category: video
---
Content here...
```

**Phase 3 (Scale):** Headless CMS
```tsx
// lib/sanity.ts
export async function getProjects() {
  return sanity.fetch('*[_type == "project"]')
}
```

## Component Build Order (Dependencies)

Build in this order to minimize rework:

### Phase 1: Foundation (Week 1)
1. **Next.js App Router setup** - File structure, routing
2. **Layout components** - Header, Footer (Server Components)
3. **Typography system** - Fonts, text styles, spacing
4. **Color system** - Dark theme variables

**Why first:** Everything else depends on these foundations

### Phase 2: Core Infrastructure (Week 1-2)
5. **ScrollController** - Lenis integration, GSAP ticker sync
6. **AnimationEngine** - GSAP context provider
7. **Image optimization pipeline** - next/image config, blur placeholders

**Why second:** Animation and media systems needed before building pages

### Phase 3: Page Shells (Week 2)
8. **Home page structure** - Sections, layout (Server Components)
9. **Portfolio page structure** - Grid layout (Server Component)
10. **Services page structure** - Content + Calendly area

**Why third:** Structure before interactivity

### Phase 4: Interactive Components (Week 2-3)
11. **VideoHero** - Lazy loading, autoplay, poster
12. **FilterBar** - Portfolio category filtering
13. **GridAnimator** - Portfolio item reveals
14. **InteractiveMenu** - Mobile navigation

**Why fourth:** Add interactivity to static shells

### Phase 5: Animation Polish (Week 3)
15. **Hero parallax** - ScrollTrigger animations
16. **Section reveals** - Intersection Observer + GSAP
17. **Micro-interactions** - Hover effects, button animations
18. **Page transitions** - Route change animations (optional)

**Why last:** Polish after core functionality works

## Technology Decisions & Rationale

| Decision | Technology | Why |
|----------|-----------|-----|
| **Framework** | Next.js 15 App Router | Server Components, built-in optimization, Vercel deployment |
| **Styling** | Tailwind CSS | Utility-first, dark theme support, JIT compilation |
| **Smooth Scroll** | Lenis | Lightweight (3KB), better than ScrollSmoother, easy GSAP sync |
| **Animations** | GSAP + ScrollTrigger | Industry standard, GPU-accelerated, best performance |
| **UI Animations** | GSAP (not Framer Motion) | Consistency, lighter bundle, more control |
| **Video Optimization** | FFmpeg + CDN | Universal compatibility, adaptive quality |
| **Image Optimization** | next/image | Automatic WebP/AVIF, lazy loading, blur placeholders |
| **Font Loading** | next/font | Automatic optimization, zero layout shift |
| **Deployment** | Vercel | Zero-config, Edge functions, automatic HTTPS |

**Alternative considered:**
- **Framer Motion** - Rejected: redundant with GSAP, larger bundle
- **Locomotive Scroll** - Rejected: heavier than Lenis, harder to sync
- **React Three Fiber** - Deferred: not needed for initial launch, adds complexity

## Performance Budget

To ensure fast load despite rich media:

| Metric | Target | Strategy |
|--------|--------|----------|
| **First Contentful Paint** | <1.2s | Server Components, minimal client JS |
| **Largest Contentful Paint** | <2.5s | Priority loading for hero, lazy load below fold |
| **Time to Interactive** | <3.0s | Code splitting, defer non-critical JS |
| **Cumulative Layout Shift** | <0.1 | Aspect ratio boxes, blur placeholders, font optimization |
| **Client Bundle (initial)** | <100KB | Tree-shaking, Server Components, dynamic imports |
| **Client Bundle (total)** | <250KB | Lazy load routes, defer analytics |

## Sources

**Architectural Patterns:**
- [9 Best Animated Websites for Design Inspiration in 2026](https://www.designrush.com/best-designs/websites/trends/best-animated-websites)
- [Next.js Architecture in 2026 — Server-First, Client-Islands](https://www.yogijs.tech/blog/nextjs-project-architecture-app-router)
- [Next.js Getting Started: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [React Architecture Pattern and Best Practices in 2025](https://www.geeksforgeeks.org/reactjs/react-architecture-pattern-and-best-practices/)

**Animation Architecture:**
- [The Spark: Engineering an Immersive, Story-First Web Experience](https://tympanus.net/codrops/2026/01/09/the-spark-engineering-an-immersive-story-first-web-experience/)
- [High-Performance Web Animation: GSAP, WebGL, and 60fps](https://dev.to/kolonatalie/high-performance-web-animation-gsap-webgl-and-the-secret-to-60fps-2l1g)
- [Optimizing GSAP & Canvas for Smooth, Responsive Design](https://www.augustinfotech.com/blogs/optimizing-gsap-and-canvas-for-smooth-performance-and-responsive-design/)
- [Building a Scroll-Driven Dual-Wave Text Animation with GSAP](https://tympanus.net/codrops/2026/01/15/building-a-scroll-driven-dual-wave-text-animation-with-gsap/)

**Scroll Integration:**
- [GitHub: Lenis - Smooth scroll as it should be](https://github.com/darkroomengineering/lenis)
- [How to implement smooth scrolling in Next.js with Lenis and GSAP](https://devdreaming.com/blogs/nextjs-smooth-scrolling-with-lenis-gsap)
- [Scroll Animations with Intersection Observer](https://www.freecodecamp.org/news/scroll-animations-with-javascript-intersection-observer-api/)

**Video & Media Optimization:**
- [Next.js Guides: Videos](https://nextjs.org/docs/app/guides/videos)
- [Lazy-Load Videos in Next.js Pages](https://cloudinary.com/blog/lazy-load-videos-in-next-js-pages)
- [Next.js Guides: Lazy Loading](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)

**Component Patterns:**
- [React Three Fiber: Introduction](https://r3f.docs.pmnd.rs/)
- [React Stack Patterns](https://www.patterns.dev/react/react-2026/)
- [GitHub: GSAP React Integration](https://github.com/greensock/GSAP)

**Performance Trends:**
- [Top Web Design Trends for 2026 That Drive Engagement](https://directgraphix.com/trends-in-web-design-2026/)
- [Motion UI Trends 2026: Interactive Design & Examples](https://lomatechnology.com/blog/motion-ui-trends-2026/2911)
