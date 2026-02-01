# CLAUDE.md — Shrike Media

Project instructions for Claude Code instances working on this codebase.

## Project Overview

**Shrike Media** — Dark cinematic portfolio website for a creative engineering company.
- **Stack:** Next.js 16.1.6, React 19, Tailwind CSS 4, TypeScript
- **Animation:** Lenis (smooth scroll), Motion/Framer Motion (transitions, parallax, micro-interactions)
- **Status:** v1 milestone COMPLETE — all 25 requirements satisfied across 3 phases

## Core Value

When someone lands on this site, they must immediately feel they're looking at the work of elite creative engineers who can solve any problem.

## Architecture

```
app/
  layout.tsx          — Root layout (LenisProvider > PageTransition wrapping)
  page.tsx            — Homepage (HeroVideo + ScrollIndicator)
  globals.css         — Theme, animations, Lenis CSS, reduced-motion overrides
  work/
    page.tsx          — Portfolio page (Suspense > PortfolioGrid)
    [slug]/page.tsx   — Project detail pages (generateStaticParams)
  services/
    page.tsx          — Services (server component, metadata)
    ServicesContent.tsx — Client wrapper (ServiceSelector + CalendlyEmbed)
  sitemap.ts          — Dynamic sitemap
  robots.ts           — Robots.txt config

components/
  Navigation.tsx      — Sticky header, mobile hamburger, motion hover effects
  Footer.tsx          — Site footer
  LenisProvider.tsx   — Smooth scroll wrapper (disabled for reduced-motion)
  PageTransition.tsx  — AnimatePresence route transitions
  ParallaxSection.tsx — Scroll-linked parallax via useScroll/useTransform
  HeroVideo.tsx       — Full-screen video hero, mobile image fallback
  ScrollIndicator.tsx — Animated bounce chevron
  PortfolioGrid.tsx   — Category filtering via URL search params
  PortfolioCard.tsx   — Cinematic cards with hover micro-interactions
  ProjectLightbox.tsx — Native <dialog> lightbox
  ServiceSelector.tsx — 3-card service picker
  CalendlyEmbed.tsx   — react-calendly InlineWidget
  OptimizedImage.tsx  — Next/Image wrapper with blur placeholder

hooks/
  useReducedMotion.ts — prefers-reduced-motion detection
  useScrollReveal.ts  — IntersectionObserver visibility hook

lib/
  projects.ts         — Portfolio data (8 projects, 3 categories)
  services.ts         — Services data (3 services)

types/
  portfolio.ts        — Project, Category types
```

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Dark mode via `className='dark'` on html | Prevents flash of unstyled content |
| Tailwind v4 with oklch colors | Perceptually uniform dark palette |
| `matchMedia` for mobile video fallback | JS-based conditional render required |
| Native `<dialog>` for lightbox | Free focus trapping, ESC, backdrop |
| URL search params for portfolio filtering | Shareable/bookmarkable filter state |
| `<Suspense>` around `useSearchParams` | Required by Next.js App Router |
| `motion/react` imports (NOT `framer-motion`) | Tree-shakeable, newer fork |
| Only animate `transform` and `opacity` | GPU-accelerated, no CLS |
| Lenis disabled for reduced-motion users | Full accessibility compliance |
| LenisProvider wraps PageTransition | Smooth scroll outer, transitions inner |
| Navigation/Footer outside PageTransition | Static chrome, only page content animates |

## Animation Rules

- ALL animations MUST respect `prefers-reduced-motion` via `useReducedMotion` hook
- Only animate `transform` and `opacity` — never `width`, `height`, `margin`, `top`, `left`
- Never use `will-change` permanently — Motion handles this automatically
- Use `IntersectionObserver` (useScrollReveal) for scroll triggers, never scroll listeners
- Import from `motion/react`, never from `framer-motion`

## GSD Workflow

This project uses the **GSD (Get Shit Done)** workflow system. All planning docs are in `.planning/`.

| File | Purpose |
|------|---------|
| `.planning/PROJECT.md` | Project context and constraints |
| `.planning/REQUIREMENTS.md` | All 25 v1 requirements with status |
| `.planning/ROADMAP.md` | 3-phase roadmap (all complete) |
| `.planning/STATE.md` | Project memory and session continuity |
| `.planning/config.json` | Workflow settings |
| `.planning/research/` | Domain research from project init |
| `.planning/phases/` | Per-phase plans, summaries, verification reports |

**Key GSD commands:**
- `/gsd:progress` — Check status and route to next action
- `/gsd:verify-work` — Run manual acceptance testing
- `/gsd:audit-milestone` — Audit milestone completion
- `/gsd:complete-milestone` — Archive and prepare for v2
- `/gsd:new-milestone` — Start v2 planning

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Routes

| Route | Page |
|-------|------|
| `/` | Homepage (video hero + scroll indicator) |
| `/work` | Portfolio (filterable grid) |
| `/work/[slug]` | Project detail |
| `/services` | Services + Calendly booking |

## Placeholder Content

These need real assets before production:
- `/videos/showreel.mp4` — Hero video (not yet created)
- `/images/hero-poster.jpg` — Video poster frame
- `/og-image.jpg` — Open Graph image (referenced in metadata)
- Portfolio project thumbnails — currently using gradient placeholders
- Calendly URL — currently `calendly.com/shrike-media/consultation` (placeholder)

## Developer Onboarding

New to this project? Read `HANDOFF.md` for full context on where we are, what's done, and what's next.

---
*Last updated: 2026-02-01 — v1 milestone complete*
