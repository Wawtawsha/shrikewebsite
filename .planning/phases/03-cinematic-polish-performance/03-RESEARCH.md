# Phase 3: Cinematic Polish & Performance - Research

**Researched:** 2026-01-30
**Domain:** Web animation, scroll-driven effects, performance optimization
**Confidence:** HIGH

## Summary

Phase 3 focuses on implementing cinematic animations and microinteractions while maintaining exceptional performance (Lighthouse 90+) and full accessibility compliance. The research reveals a clear technical path:

**Standard Stack:** Lenis (smooth scrolling) + Framer Motion/Motion (scroll-driven animations) + CSS transforms for microinteractions, all built on Next.js 15's capabilities. The native CSS Scroll-driven Animations API shows promise but has limited browser support (Chrome/Edge only as of 2026), making it unsuitable as a primary solution. IntersectionObserver-based approaches (like the existing useScrollReveal hook) remain the most performant and widely-supported method for scroll-triggered animations.

**Performance Strategy:** GPU-accelerated animations via CSS transforms and opacity, IntersectionObserver for scroll triggers, requestAnimationFrame for custom animations, and strict adherence to Core Web Vitals (CLS < 0.1, LCP < 2.5s). The project already has strong accessibility foundations with prefers-reduced-motion support in both CSS and React hooks.

**Primary recommendation:** Use Lenis for smooth scrolling (industry standard, 3KB), Motion/Framer Motion for complex scroll animations (better performance than GSAP for React, 32KB), and pure CSS transforms for microinteractions. Avoid Next.js View Transitions API (experimental/unstable). Build on existing IntersectionObserver patterns rather than introducing JavaScript scroll listeners.

## Standard Stack

The established libraries/tools for cinematic web animations in 2026:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Lenis | 1.3.17+ | Smooth scrolling | Industry standard (3KB), supports position:sticky, integrates with GSAP/Motion, used by award-winning sites |
| Motion (formerly Framer Motion) | 11.x | Scroll-driven animations | 2.5x faster than GSAP for React, 10M+ downloads/month, native React integration, ScrollTimeline API support |
| CSS Transforms | Native | Microinteractions | GPU-accelerated, zero bundle cost, 60fps on transform/opacity |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| IntersectionObserver API | Native | Scroll triggers | Element visibility detection (already in use via useScrollReveal) |
| requestAnimationFrame | Native | Custom animations | Frame-synced updates, battery-efficient |
| CSS Scroll-driven Animations | Native (Draft) | Progressive enhancement | Chrome/Edge only - use as enhancement, not primary solution |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Motion | GSAP ScrollTrigger | GSAP better for canvas/SVG/WebGL (out of scope), Motion better for React DOM, smaller bundle |
| Lenis | Native CSS scroll-behavior | Lenis provides inertia, device sync, sticky support - far superior UX |
| Motion | react-spring | Motion has better scroll APIs and performance, larger ecosystem |
| Custom scroll listeners | IntersectionObserver | IntersectionObserver uses 23% less CPU, asynchronous, browser-optimized |

**Installation:**
```bash
npm install lenis@^1.3.17
npm install motion  # or framer-motion if preferred
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── hooks/
│   ├── useReducedMotion.ts      # ✅ Already exists
│   ├── useScrollReveal.ts       # ✅ Already exists (IntersectionObserver)
│   ├── useLenis.ts              # NEW: Lenis provider/setup
│   └── useScrollProgress.ts     # NEW: Scroll-linked values
├── components/
│   ├── motion/                  # NEW: Motion wrapper components
│   │   ├── FadeIn.tsx
│   │   ├── SlideUp.tsx
│   │   └── ParallaxSection.tsx
│   └── transitions/             # NEW: Page transition components
│       └── PageTransition.tsx
├── lib/
│   └── lenis.ts                 # NEW: Lenis singleton instance
└── app/
    ├── globals.css              # ✅ Already has prefers-reduced-motion
    └── layout.tsx               # Add Lenis provider here
```

### Pattern 1: Lenis Smooth Scroll Setup

**What:** Global smooth scrolling with React provider
**When to use:** All pages (wrap root layout)
**Example:**
```typescript
// lib/lenis.ts
"use client";
import Lenis from 'lenis';
import { useEffect, useRef } from 'react';

export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,              // Smoothness (0-1, lower = smoother)
      duration: 1.2,          // Animation duration
      wheelMultiplier: 1,     // Mouse scroll intensity
      touchMultiplier: 1,     // Touch scroll intensity
      syncTouch: false,       // Enable touch inertia (can impact mobile perf)
      autoRaf: true           // Automatic requestAnimationFrame
    });

    lenisRef.current = lenis;

    return () => {
      lenis.destroy();
    };
  }, []);

  return lenisRef.current;
}

// app/layout.tsx - wrap children
export default function RootLayout({ children }) {
  useLenis();  // Initialize globally
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### Pattern 2: Scroll-Triggered Animations (IntersectionObserver)

**What:** Reveal animations when elements enter viewport
**When to use:** Portfolio items, section reveals, content blocks
**Example:**
```typescript
// Component using existing useScrollReveal hook
"use client";
import { useScrollReveal } from '@/hooks/useScrollReveal';

export function PortfolioItem() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className={`
        transition-all duration-700 ease-out
        ${isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
        }
      `}
    >
      {/* Content */}
    </div>
  );
}
```

### Pattern 3: Scroll-Linked Animations (Motion)

**What:** Animations tied directly to scroll position (parallax, progress bars)
**When to use:** Hero sections, cinematic reveals, scroll indicators
**Example:**
```typescript
// Source: Motion docs - https://motion.dev/docs/react-scroll-animations
"use client";
import { useScroll, useTransform, motion } from 'motion/react';
import { useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function ParallaxHero() {
  const ref = useRef(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  // Parallax only if motion enabled
  const y = reducedMotion
    ? 0
    : useTransform(scrollYProgress, [0, 1], [0, 300]);

  return (
    <motion.section ref={ref} style={{ y }}>
      {/* Hero content */}
    </motion.section>
  );
}
```

### Pattern 4: Microinteractions (CSS Transforms)

**What:** Hover effects, button animations, subtle interactions
**When to use:** All interactive elements (buttons, cards, links)
**Example:**
```css
/* Source: CSS best practices 2026 - GPU-accelerated transforms */
.interactive-card {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform; /* Use sparingly - see Don't Hand-Roll */
}

.interactive-card:hover {
  transform: translateY(-4px) scale(1.02);
}

.button {
  transition: transform 0.2s ease-out, opacity 0.2s ease-out;
}

.button:active {
  transform: scale(0.96);
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .interactive-card:hover {
    transform: none; /* Or subtle opacity change */
  }
}
```

### Pattern 5: Page Transitions (Next.js App Router)

**What:** Animated transitions between routes
**When to use:** Route changes
**WARNING:** Next.js View Transitions API is EXPERIMENTAL and unstable - do NOT use in production
**Example:**
```typescript
// Source: Community patterns - https://github.com/ismamz/next-transition-router
// Use custom implementation, NOT experimental.viewTransition

"use client";
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function PageTransition({ children }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={reducedMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reducedMotion ? {} : { opacity: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

### Anti-Patterns to Avoid

- **Scroll event listeners:** Use IntersectionObserver instead (23% less CPU, asynchronous)
- **setTimeout for animations:** Use requestAnimationFrame (syncs with browser refresh)
- **Animating width/height/left/top:** Use transform/opacity only (GPU-accelerated)
- **will-change on everything:** Causes memory issues - use only on actively animating elements
- **Ignoring prefers-reduced-motion:** Already handled globally, but verify all custom animations respect it
- **Experimental Next.js View Transitions:** Unstable, subject to breaking changes

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Smooth scrolling | Custom scroll interpolation | Lenis (3KB) | Cross-browser, handles sticky positioning, device sync, tested on award-winning sites |
| Scroll progress tracking | Manual scroll listeners | Motion useScroll + IntersectionObserver | ScrollTimeline API optimization, async, 50% less CPU |
| Parallax effects | Direct scroll event handlers | Motion scroll() function + transforms | Hardware-accelerated, hybrid engine, automatic throttling |
| Animation timing | setTimeout loops | requestAnimationFrame | Syncs with display refresh (60/120Hz), pauses in background tabs, battery-efficient |
| Element visibility | Scroll position math | IntersectionObserver API | Native browser optimization, 23% less CPU than scroll listeners, async |
| Debounce/throttle scroll | Custom implementations | Avoid - use IntersectionObserver or Motion's built-in optimization | Pre-optimized, handles edge cases |
| Page transitions | Custom router state management | Motion AnimatePresence (NOT Next.js experimental.viewTransition) | Handles exit/enter, prevents route blocking, accessible |

**Key insight:** Modern browser APIs (IntersectionObserver, requestAnimationFrame, CSS transforms) and battle-tested libraries (Lenis, Motion) handle 95% of animation needs. Custom scroll math introduces bugs, performance issues, and accessibility gaps.

## Common Pitfalls

### Pitfall 1: Cumulative Layout Shift (CLS) from Animations

**What goes wrong:** Animations trigger layout recalculations, causing CLS > 0.1 and failing Lighthouse
**Why it happens:** Animating width, height, margin, padding, or absolute positioning forces browser reflows
**How to avoid:**
- Only animate `transform` and `opacity` (GPU-accelerated, no reflow)
- Reserve space for dynamic content with skeleton loaders that match final height
- Use `transform: scale()` instead of width/height changes
- Test with Chrome DevTools Performance panel (look for purple "Layout" events)

**Warning signs:**
- Lighthouse CLS > 0.1
- Purple bars in Performance timeline during animation
- Content "jumping" as animations complete

**Code example:**
```css
/* ❌ BAD - causes layout shift */
.card:hover {
  height: 400px;
  margin-top: 20px;
}

/* ✅ GOOD - GPU-accelerated, no layout shift */
.card:hover {
  transform: translateY(-4px) scale(1.02);
  opacity: 0.95;
}
```

### Pitfall 2: will-change Overuse

**What goes wrong:** Adding `will-change` to many elements increases memory usage and slows page load
**Why it happens:** will-change creates GPU layers - too many layers exhaust memory
**How to avoid:**
- Only apply to elements actively animating (add on hover/scroll trigger, remove after)
- NEVER use `will-change: transform` globally
- Test memory usage in Chrome DevTools (Rendering > Layer Borders)
- Limit to 5-10 concurrent will-change elements max

**Warning signs:**
- High memory usage in DevTools
- Janky animations on lower-end devices
- Slower initial page load

**Code example:**
```javascript
// ✅ GOOD - Apply only during animation
element.addEventListener('mouseenter', () => {
  element.style.willChange = 'transform';
});

element.addEventListener('mouseleave', () => {
  element.style.willChange = 'auto';
});

// ❌ BAD - Global will-change
/* * { will-change: transform; } */
```

### Pitfall 3: Lighthouse Lab vs Real User CLS

**What goes wrong:** Lighthouse shows green CLS, but real users experience layout shifts
**Why it happens:** Lighthouse only tests initial page load - misses scroll-triggered shifts, dynamic content, font swaps
**How to avoid:**
- Test with Chrome UX Report (CrUX) for field data
- Use `font-display: swap` with preload for critical fonts
- Ensure scroll-triggered animations don't change layout (transform only)
- Test on mobile with slow network (3G throttling)

**Warning signs:**
- Green Lighthouse, complaints from users
- CLS increases after page interaction
- Different scores between lab and field

### Pitfall 4: Scroll Jank from JavaScript Listeners

**What goes wrong:** Scroll events fire 30-100 times per second, blocking main thread
**Why it happens:** Direct scroll listeners execute synchronously on main thread
**How to avoid:**
- Use IntersectionObserver (23% less CPU, async)
- If scroll listeners required, throttle to 16ms max (use requestAnimationFrame)
- Never perform heavy calculations in scroll handlers
- Project already has useScrollReveal (IntersectionObserver) - use it!

**Warning signs:**
- Janky scrolling on mobile
- Frame drops in Performance timeline
- Main thread blocked during scroll

**Code example:**
```javascript
// ❌ BAD - Fires 100x per second
window.addEventListener('scroll', () => {
  updateParallax(); // Expensive calculation on every scroll event
});

// ✅ GOOD - Fires only when element enters viewport
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateElement(entry.target);
    }
  });
});
```

### Pitfall 5: prefers-reduced-motion False Compliance

**What goes wrong:** Animations disabled completely OR vestibular triggers remain
**Why it happens:** Misunderstanding the requirement - should reduce motion, not eliminate it
**How to avoid:**
- Replace parallax/scaling with crossfade/opacity
- Keep opacity transitions (duration < 500ms)
- Test with system setting enabled (Windows: Settings > Ease of Access > Display > Show Animations)
- Project already has global CSS - verify all custom animations respect it

**Warning signs:**
- Users with motion sensitivity report discomfort
- Site feels "flat" when reduced motion enabled
- Automated accessibility scans flag violations

**Code example:**
```css
/* ✅ GOOD - Reduces motion, doesn't eliminate */
@media (prefers-reduced-motion: reduce) {
  .parallax-section {
    /* Replace parallax with subtle fade */
    animation: fadeIn 0.4s ease-out;
  }

  .card:hover {
    /* Replace scale with opacity */
    opacity: 0.9;
    transform: none;
  }
}

/* ❌ BAD - Eliminates all motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

### Pitfall 6: AnimatePresence Exit Transitions Broken in App Router

**What goes wrong:** Exit animations don't play when navigating between routes
**Why it happens:** Next.js App Router unmounts components before exit animation completes
**How to avoid:**
- Use `mode="wait"` in AnimatePresence
- Wrap route content, not layout
- Intercept Link clicks if needed (advanced pattern)
- Do NOT use experimental.viewTransition (unstable)

**Warning signs:**
- Enter animations work, exit animations don't
- Instant page changes instead of transitions
- Console errors about unmounted components

### Pitfall 7: Bundle Size Bloat

**What goes wrong:** Adding Motion/GSAP increases bundle by 50-100KB, slowing initial load
**Why it happens:** Importing entire library instead of tree-shakeable components
**How to avoid:**
- Use Motion's LazyMotion for code splitting
- Import only needed features: `import { motion } from 'motion/react'`
- Avoid GSAP plugins if not needed
- Monitor bundle size with `next build` analyzer

**Warning signs:**
- LCP increases after adding animations
- Bundle size increases > 50KB
- Lighthouse performance score drops

## Code Examples

Verified patterns from official sources:

### Lenis + Motion Integration

```typescript
// Source: Lenis README - https://github.com/darkroomengineering/lenis
"use client";
import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { useScroll } from 'motion/react';

export function LenisProvider({ children }) {
  const lenisRef = useRef<Lenis>();

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      autoRaf: true,
    });

    lenisRef.current = lenis;

    // Sync with Motion if using scroll animations
    lenis.on('scroll', ({ scroll, limit, velocity, direction }) => {
      // Motion's useScroll will automatically track this
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

### Progressive Scroll Reveal (Stagger)

```typescript
// Source: Motion scroll animations docs
"use client";
import { motion } from 'motion/react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function PortfolioGrid({ items }) {
  const { ref, isVisible } = useScrollReveal();
  const reducedMotion = useReducedMotion();

  return (
    <div ref={ref} className="grid grid-cols-3 gap-8">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: reducedMotion ? 0 : 0.5,
            delay: reducedMotion ? 0 : i * 0.1, // Stagger
            ease: [0.25, 0.1, 0.25, 1.0],
          }}
        >
          {item.content}
        </motion.div>
      ))}
    </div>
  );
}
```

### GPU-Accelerated Hover (Pure CSS)

```css
/* Source: CSS performance best practices 2026 */
.portfolio-card {
  position: relative;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.portfolio-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--color-accent) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease-out;
}

.portfolio-card:hover {
  transform: translateY(-8px);
}

.portfolio-card:hover::before {
  opacity: 0.1;
}

/* Reduce motion variant */
@media (prefers-reduced-motion: reduce) {
  .portfolio-card {
    transition: opacity 0.2s ease-out;
  }

  .portfolio-card:hover {
    transform: none;
    opacity: 0.9;
  }
}
```

### Parallax with Reduced Motion Fallback

```typescript
// Source: Motion docs + accessibility best practices
"use client";
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function CinematicSection({ children }) {
  const ref = useRef(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

  return (
    <motion.section
      ref={ref}
      style={{
        y: reducedMotion ? 0 : y,
        opacity: reducedMotion ? 1 : opacity,
      }}
    >
      {children}
    </motion.section>
  );
}
```

### Scroll Progress Indicator

```typescript
// Source: Motion useScroll documentation
"use client";
import { motion, useScroll } from 'motion/react';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-accent origin-left z-50"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Locomotive Scroll | Lenis | 2022-2024 | Lighter (3KB vs 15KB), better sticky support, simpler API |
| Framer Motion | Motion (fork) | 2024 | Same API, 2.5x faster, smaller bundle, better tree-shaking |
| GSAP ScrollTrigger (React) | Motion scroll() | 2023-2024 | React-first design, smaller bundle, ScrollTimeline API support |
| Scroll event listeners | IntersectionObserver | 2019+ (now standard) | 23% less CPU, async, native browser optimization |
| CSS Scroll-driven Animations | Too new (limited support) | Draft 2024 | Chrome/Edge only - use as enhancement, not primary |
| setTimeout animations | requestAnimationFrame | Long-established best practice | Syncs with refresh rate, battery-efficient |

**Deprecated/outdated:**
- **Locomotive Scroll**: Still works but Lenis is lighter and more maintained
- **jQuery smooth scroll plugins**: Modern CSS scroll-behavior or Lenis
- **Parallax.js**: Use CSS transforms + IntersectionObserver or Motion
- **Next.js experimental.viewTransition**: Unstable, subject to breaking changes - do NOT use
- **GSAP ScrollSmoother for React**: Motion provides better React integration
- **will-change: transform** on static elements: Only use during active animation
- **Scroll event debouncing**: Use IntersectionObserver or Motion's built-in optimization

## Open Questions

Things that couldn't be fully resolved:

1. **Next.js View Transitions API Stability**
   - What we know: Experimental, unstable, React Canary only, not recommended for production
   - What's unclear: Timeline for stabilization, breaking changes expected
   - Recommendation: Use Motion AnimatePresence instead, revisit in 6 months

2. **CSS Scroll-driven Animations Browser Support**
   - What we know: Chrome 115+, Safari 26 beta, no Firefox support
   - What's unclear: Firefox implementation timeline, Safari 26 stable release date
   - Recommendation: Use as progressive enhancement only, fallback to Motion

3. **Motion vs Framer Motion Long-term**
   - What we know: Motion is a Framer Motion fork, same API, better performance
   - What's unclear: Will communities converge? Which has longer support?
   - Recommendation: Use Motion (newer, faster), easy migration path either direction

4. **Optimal Lenis lerp Value**
   - What we know: 0.1 is default, lower = smoother but more lag
   - What's unclear: Best value for "cinematic" feel without nausea
   - Recommendation: Start with 0.1, A/B test 0.05-0.15, get owner feedback

5. **Bundle Size Impact of Motion**
   - What we know: ~32KB gzipped with all features, LazyMotion can reduce
   - What's unclear: Actual impact on LCP for this project's media-heavy pages
   - Recommendation: Implement, measure with Lighthouse, optimize with LazyMotion if needed

## Sources

### Primary (HIGH confidence)

- [Lenis GitHub](https://github.com/darkroomengineering/lenis) - Official repository, installation, configuration
- [Motion Documentation](https://motion.dev/docs/react-scroll-animations) - Scroll animations API
- [Motion vs GSAP Comparison](https://motion.dev/docs/gsap-vs-motion) - Performance benchmarks
- [MDN: CSS Scroll-driven Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations) - Browser support, limitations
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) - Accessibility requirements
- [Next.js View Transitions Config](https://nextjs.org/docs/app/api-reference/config/next-config-js/viewTransition) - Experimental status
- [MDN: IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) - Browser API
- [MDN: requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) - Animation timing

### Secondary (MEDIUM confidence)

- [Lenis Best Practices 2026](https://medium.com/@nattupi/why-lenis-smooth-scroll-needs-to-become-a-browser-standard-62bed416c987) - Community adoption
- [Framer Motion vs GSAP for React](https://javascript.plainenglish.io/framer-motion-vs-gsap-for-react-developers-b6f71d1d5078) - React-specific comparison
- [Next.js Page Transitions App Router](https://github.com/ismamz/next-transition-router) - Community solutions
- [IntersectionObserver vs Scroll Performance](https://itnext.io/1v1-scroll-listener-vs-intersection-observers-469a26ab9eb6) - Performance benchmarks
- [CLS Guide 2026](https://medium.com/@sahoo.arpan7/cumulative-layout-shift-cls-guide-to-one-of-the-most-misunderstood-core-web-vitals-5f135c68cb6f) - Common mistakes
- [CSS will-change Performance](https://blog.logrocket.com/when-how-use-css-will-change/) - Best practices
- [Lighthouse 100 with Next.js 2025](https://medium.com/better-dev-nextjs-react/lighthouse-100-with-next-js-the-missing-performance-checklist-e87ee487775f) - Optimization techniques
- [requestAnimationFrame vs setTimeout](https://blog.openreplay.com/requestanimationframe-settimeout-use/) - Animation timing comparison
- [Debounce vs Throttle 2026](https://tomekdev.com/posts/throttle-vs-debounce-on-real-examples) - Performance patterns

### Tertiary (LOW confidence)

- [Best Parallax Scrolling 2026](https://www.builder.io/blog/parallax-scrolling-effect) - Technique overview
- [CSS/JS Animation Trends 2026](https://webpeak.org/blog/css-js-animation-trends/) - Industry trends
- [Best React Animation Libraries 2026](https://blog.logrocket.com/best-react-animation-libraries/) - Library comparison
- [Microinteractions Best Practices](https://blog.pixelfreestudio.com/best-practices-for-animating-micro-interactions-with-css/) - Design patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Lenis and Motion are industry-proven with extensive documentation
- Architecture: HIGH - Patterns verified from official docs and existing project code
- Pitfalls: HIGH - Based on official performance documentation and 2026 Core Web Vitals updates
- CSS Scroll-driven Animations: MEDIUM - Spec in draft, browser support limited but documented
- Next.js View Transitions: HIGH - Official docs confirm experimental/unstable status
- Performance optimization: HIGH - MDN and Chrome DevTools documentation

**Research date:** 2026-01-30
**Valid until:** 2026-03-30 (60 days - animation ecosystem moderately stable, CSS specs evolving)

**Key assumptions:**
- 3D/WebGL remain out of scope (explicitly stated in requirements)
- Lighthouse 90+ is hard requirement (stated in success criteria)
- prefers-reduced-motion must be respected (stated in success criteria)
- Existing hooks (useReducedMotion, useScrollReveal) should be leveraged
- Review gate exists - owner will evaluate animations before commit
