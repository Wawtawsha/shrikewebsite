---
phase: 03-cinematic-polish-performance
plan: 01
subsystem: ui
tags: [lenis, motion, framer-motion, animation, smooth-scroll, page-transitions, a11y]

# Dependency graph
requires:
  - phase: 02-rich-media-core-features
    provides: "All routes (/, /work, /services, /work/[slug]) with Navigation and Footer"
  - phase: 01-performance-foundation
    provides: "useReducedMotion hook and CSS prefers-reduced-motion support"
provides:
  - "Lenis smooth scroll site-wide (disabled for reduced-motion users)"
  - "AnimatePresence page transitions with fade+slide (simplified for reduced-motion)"
  - "Animation infrastructure ready for scroll reveals and advanced effects"
affects: [03-02, 03-03, scroll-reveals, GSAP-integration, cinematic-effects]

# Tech tracking
tech-stack:
  added: ["lenis@latest", "motion@latest"]
  patterns: ["Client-side animation providers wrapping page content", "Reduced motion detection via hook, not CSS media query", "RAF loop for smooth scroll updates"]

key-files:
  created:
    - "components/LenisProvider.tsx"
    - "components/PageTransition.tsx"
  modified:
    - "app/layout.tsx"
    - "app/globals.css"
    - "package.json"

key-decisions:
  - "Lenis config: lerp 0.1, duration 1.2, smoothWheel true (cinematic smooth scroll)"
  - "Motion easing: cubic-bezier [0.42, 0, 0.58, 1] (easeInOut) for consistent animation feel"
  - "Page transitions: 300ms fade+slide normal, 150ms fade-only reduced-motion"
  - "LenisProvider wraps PageTransition in layout (smooth scroll outer, transitions inner)"
  - "Navigation and Footer remain static outside transitions (only page content animates)"

patterns-established:
  - "Animation providers: Client components that conditionally initialize based on reducedMotion hook"
  - "Pass-through providers: No extra DOM wrappers, render children directly"
  - "Type-safe easing: Use `as const` for cubic-bezier arrays to satisfy Motion types"

# Metrics
duration: 6min
completed: 2026-02-01
---

# Phase 03 Plan 01: Animation Infrastructure Summary

**Lenis inertial scroll and Motion page transitions with complete reduced-motion accessibility**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-01T02:52:29Z
- **Completed:** 2026-02-01T02:58:44Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Lenis smooth scroll active site-wide with cinematic lerp/duration config
- Page route transitions with fade+slide (AnimatePresence mode="wait")
- Full reduced-motion support: no Lenis init, simple opacity crossfade transitions
- Animation infrastructure ready for Phase 3 polish features (scroll reveals, GSAP)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies and create LenisProvider** - `7df6279` (feat)
2. **Task 2: Create PageTransition and integrate into layout** - `7897c46` (feat)

## Files Created/Modified

- `components/LenisProvider.tsx` - Smooth scroll provider with RAF loop, respects reduced-motion
- `components/PageTransition.tsx` - AnimatePresence wrapper with fade+slide transitions
- `app/layout.tsx` - Integrated LenisProvider and PageTransition around children
- `app/globals.css` - Added Lenis CSS compatibility rules (html.lenis height:auto, scroll-behavior:auto)
- `package.json` - Added lenis@latest and motion@latest dependencies

## Decisions Made

**Lenis configuration:**
- lerp: 0.1 (smooth momentum)
- duration: 1.2 (animation duration)
- smoothWheel: true (trackpad/mouse wheel smoothing)
- Removed invalid options (smoothTouch, touchMultiplier) based on type error

**Motion library choice:**
- Using `motion/react` (NOT `framer-motion`) - correct import path for Motion library
- Cubic-bezier easing defined as `[0.42, 0, 0.58, 1] as const` for type safety

**Provider architecture:**
- LenisProvider wraps PageTransition (outer to inner)
- Navigation and Footer outside transitions (remain static)
- Only page content ({children}) wrapped in PageTransition

**Accessibility:**
- useReducedMotion hook controls both Lenis and PageTransition behavior
- Reduced motion: Lenis skipped entirely, transitions simplified to opacity-only

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed invalid Lenis options**
- **Found during:** Task 1 (LenisProvider implementation)
- **Issue:** TypeScript error - `smoothTouch` and `touchMultiplier` not valid LenisOptions properties
- **Fix:** Removed invalid options, kept only valid config (lerp, duration, smoothWheel)
- **Files modified:** components/LenisProvider.tsx
- **Verification:** `npx next build` passes with 0 TypeScript errors
- **Committed in:** 7df6279 (Task 1 commit)

**2. [Rule 3 - Blocking] Fixed Motion easing type error**
- **Found during:** Task 2 (PageTransition implementation)
- **Issue:** TypeScript error - string literal "easeInOut" not assignable to Easing type
- **Fix:** Changed to cubic-bezier array `[0.42, 0, 0.58, 1] as const`, separated reduced/normal motion into explicit branches
- **Files modified:** components/PageTransition.tsx
- **Verification:** `npx next build` passes, all routes render
- **Committed in:** 7897c46 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking type errors)
**Impact on plan:** Both fixes necessary for TypeScript compilation. No functional changes to plan, only type-safe implementation.

## Issues Encountered

**Motion library API differences:**
- Initial attempt used config object approach, but Motion's TypeScript types require inline props
- Solution: Rewrote to conditional render with inline props instead of computed config object

**Lenis package validation:**
- Confirmed lenis.css exists in node_modules/lenis/dist/ (imported successfully)
- No CSS file needed for motion library (motion/react provides runtime-only API)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for next plans:**
- ANIM-01 ✅ Complete: Lenis smooth scroll active
- ANIM-02 ✅ Complete: Page transitions with AnimatePresence
- Animation providers in place for scroll reveals (ANIM-03)
- Ready for GSAP integration (ANIM-04)
- Ready for performance optimization (TECH-04)

**Verification completed:**
- ✅ Build passes with 0 errors
- ✅ All routes render: /, /work, /services, /work/[slug], 404
- ✅ Lenis and Motion dependencies installed and importing correctly
- ✅ Reduced motion hook integrated in both providers

**No blockers.**

---
*Phase: 03-cinematic-polish-performance*
*Completed: 2026-02-01*
