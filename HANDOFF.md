# Shrike Media — Developer Handoff

Welcome to the Shrike Media project. This document tells you everything you need to know to pick up where we left off.

---

## What Is This?

A dark, cinematic portfolio website for **Shrike Media** — a creative engineering company that does photography, videography, and software/technical work. The site is both a portfolio showcase and a booking gateway via Calendly.

**Live tech stack:** Next.js 16, React 19, Tailwind CSS 4, TypeScript, Lenis (smooth scroll), Motion (animations).

---

## Current Status: v1 Complete

All 25 v1 requirements have been implemented and verified across 3 phases:

| Phase | What It Built | Status |
|-------|--------------|--------|
| 1 — Performance Foundation | Dark theme, typography, responsive layout, navigation, SEO, accessibility, image optimization | Done |
| 2 — Rich Media & Core Features | Video hero, portfolio grid/filtering/lightbox, services page, Calendly booking | Done |
| 3 — Cinematic Polish & Performance | Lenis smooth scroll, page transitions, hover micro-interactions, parallax depth, Lighthouse perf | Done |

**The build passes with 0 errors. All routes render.**

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/Wawtawsha/shrikewebsite.git
cd shrikewebsite
npm install
```

### 2. Run the dev server

```bash
npm run dev
```

Visit http://localhost:3000

### 3. Explore the site

- **Homepage** (`/`) — Full-screen video hero with smooth scroll
- **Portfolio** (`/work`) — Filter by Photography, Videography, Software. Click cards to open lightbox.
- **Services** (`/services`) — Pick a service type, see Calendly booking widget
- **Project detail** (`/work/[slug]`) — Individual project pages

### 4. Read the planning docs

The `.planning/` directory contains the full project history:

```bash
# Quick status check
cat .planning/STATE.md

# See all requirements and their status
cat .planning/REQUIREMENTS.md

# See the roadmap
cat .planning/ROADMAP.md
```

---

## What Needs To Happen Next

### Immediate (before launch)

1. **Replace placeholder content with real assets:**
   - Create `/videos/showreel.mp4` — the hero background video
   - Create `/images/hero-poster.jpg` — poster frame shown while video loads
   - Create `/og-image.jpg` — Open Graph preview image for social sharing
   - Replace portfolio project thumbnails with real images
   - Update Calendly URL from `calendly.com/shrike-media/consultation` to the real account URL

2. **Review gates (owner decision):**
   - **PORT-01 through PORT-04** — Owner evaluates portfolio implementation
   - **ANIM-01 through ANIM-04** — Owner evaluates animation execution
   - These are documented in `.planning/ROADMAP.md` under "Review Gates"

3. **Run milestone audit:**
   ```
   /gsd:audit-milestone
   ```
   This verifies cross-phase integration and E2E user flows.

### After launch (v2)

The v2 requirements are defined in `.planning/REQUIREMENTS.md` under "v2 Requirements":
- Deep case studies per project (500-1000 words)
- Video case studies with behind-the-scenes footage
- Technical blog
- Animated logo reveal
- Custom cursor effects
- CMS for portfolio management

---

## How the GSD Workflow Works

This project was built using the **GSD (Get Shit Done)** workflow — a structured system for planning and executing software projects with Claude Code. Here's how it works:

### The Lifecycle

```
/gsd:new-project     → Define project, research domain, set requirements, create roadmap
/gsd:plan-phase N    → Research + plan a specific phase (creates PLAN.md files)
/gsd:execute-phase N → Execute all plans in a phase (spawns parallel agents)
/gsd:verify-work     → Manual acceptance testing
/gsd:audit-milestone → Verify all requirements met
/gsd:complete-milestone → Archive and prepare for next version
```

### How Phases Work

Each phase has:
- A **goal** (what the user should experience when it's done)
- **Requirements** mapped to it (e.g., ANIM-01, TECH-04)
- **Plans** (PLAN.md files) that are executable prompts for Claude agents
- **Verification** (a verifier agent checks the actual code against requirements)

### How Plans Execute

Plans are grouped into **waves** for parallel execution:
- Wave 1 plans run simultaneously
- Wave 2 plans depend on Wave 1 completing first
- Each plan's tasks are committed individually (atomic commits)

### Key Files

| File | What It Does |
|------|-------------|
| `STATE.md` | Project memory — where we are, decisions made, session continuity |
| `ROADMAP.md` | Phase structure with requirements and success criteria |
| `REQUIREMENTS.md` | All requirements with traceability (which phase, what status) |
| `config.json` | Workflow settings (mode, depth, which agents to use) |
| `phases/XX-name/XX-PLAN.md` | Executable plan for a specific piece of work |
| `phases/XX-name/XX-SUMMARY.md` | What was actually built (post-execution) |
| `phases/XX-name/XX-VERIFICATION.md` | Verification report (code checked against requirements) |
| `phases/XX-name/XX-RESEARCH.md` | Domain research done before planning |

### Current Config

```json
{
  "mode": "yolo",           // Auto-approve, just execute
  "depth": "quick",         // 3-5 phases, 1-3 plans each
  "parallelization": true,  // Independent plans run simultaneously
  "commit_docs": true,      // Planning docs tracked in git
  "workflow": {
    "research": true,        // Research domain before planning
    "plan_check": true,      // Verify plans before execution
    "verifier": true         // Verify phase goal after execution
  }
}
```

---

## Where We Are Right Now

**All 3 phases are complete. The v1 milestone is done.**

The next step is either:
1. `/gsd:audit-milestone` — Full audit of cross-phase integration
2. `/gsd:complete-milestone` — Archive v1 and start v2 planning
3. Replace placeholder content with real assets (this doesn't need GSD — just swap files)

To check status at any time:
```
/gsd:progress
```

---

## Architecture Quick Reference

**Layout chain:** `layout.tsx` → `LenisProvider` → `PageTransition` → `{page content}`

**Navigation and Footer** are outside PageTransition (they don't animate on route change).

**Portfolio filtering** uses URL search params (`?category=photography`) wrapped in `<Suspense>`.

**All animations** respect `prefers-reduced-motion` via the `useReducedMotion` hook. Lenis is disabled entirely, parallax is skipped, transitions become simple opacity fades.

**Only `transform` and `opacity`** are animated — never layout properties. This keeps everything GPU-accelerated with zero CLS.

---

## Quick Command Reference

| What | Command |
|------|---------|
| Start dev server | `npm run dev` |
| Production build | `npm run build` |
| Check project status | `/gsd:progress` |
| Audit the milestone | `/gsd:audit-milestone` |
| Complete milestone | `/gsd:complete-milestone` |
| Start v2 planning | `/gsd:new-milestone` |
| Read full state | `cat .planning/STATE.md` |

---

*Written: 2026-02-01*
*Author: Claude (working with Stephen)*
