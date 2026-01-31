---
phase: 02-rich-media-core-features
plan: 01
subsystem: homepage-hero
tags: [video, hero, portfolio-data, services-data, scroll-reveal, accessibility]
dependency-graph:
  requires: [01-01, 01-02]
  provides: [hero-video, scroll-indicator, project-data, service-data, scroll-reveal-hook]
  affects: [02-02, 02-03]
tech-stack:
  added: []
  patterns: [matchMedia-responsive, intersection-observer, reduced-motion-respect]
key-files:
  created: [lib/projects.ts, lib/services.ts, hooks/useScrollReveal.ts, components/HeroVideo.tsx, components/ScrollIndicator.tsx]
  modified: [app/page.tsx]
decisions:
  - id: hero-media-strategy
    choice: "matchMedia listener for mobile detection instead of CSS-only"
    reason: "Need to conditionally render video vs OptimizedImage component, not just hide/show"
metrics:
  duration: ~5min
  completed: 2026-01-30
---

# Phase 2 Plan 1: Hero Video and Shared Data Summary

**One-liner:** Full-screen cinematic hero with video/image responsive swap, plus shared project/service data and scroll reveal hook for downstream plans.

## What Was Built

### Hero Video (components/HeroVideo.tsx)
- Full viewport height (`h-screen`) section with HTML5 video background
- All four autoplay attributes: `autoPlay muted loop playsInline`
- `preload="metadata"` with poster for instant visual on load
- Mobile detection via `matchMedia("(max-width: 767px)")` swaps to `OptimizedImage`
- Dark overlay (`bg-black/40`) ensures white text readability
- Pauses video when `useReducedMotion` returns true

### Scroll Indicator (components/ScrollIndicator.tsx)
- Animated bounce chevron at bottom of hero
- Smooth scrolls to next section on click
- Static (no animation) when reduced motion preferred

### Shared Data Modules
- `lib/projects.ts`: 8 projects (3 photography, 3 videography, 2 technical), 3 featured
- `lib/services.ts`: 3 services (Photography, Videography, Technical Consultation)
- Helper functions: `getProjectBySlug`, `getProjectsByCategory`, `getFeaturedProjects`, `getServiceById`

### Scroll Reveal Hook (hooks/useScrollReveal.ts)
- IntersectionObserver-based visibility detection
- Once-visible-stay-visible pattern (disconnects after first intersection)
- Respects reduced motion (immediately visible, no animation)

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Hash | Message |
|------|---------|
| e02d314 | feat(02-01): add shared data modules and scroll reveal hook |
| 6bee0f0 | feat(02-01): add hero video component with mobile fallback and scroll indicator |

## Next Phase Readiness

- Plan 02 (portfolio grid) can import `lib/projects.ts` and `hooks/useScrollReveal.ts`
- Plan 03 (services) can import `lib/services.ts` and `hooks/useScrollReveal.ts`
- No blockers identified
