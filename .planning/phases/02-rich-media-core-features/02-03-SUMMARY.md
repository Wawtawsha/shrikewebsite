---
phase: 02-rich-media-core-features
plan: 03
subsystem: services
tags: [react-calendly, services, booking, ui-components]
dependency-graph:
  requires: ["02-01"]
  provides: ["services-page", "calendly-integration", "service-selector"]
  affects: []
tech-stack:
  added: ["react-calendly"]
  patterns: ["server-client split for metadata + interactivity"]
key-files:
  created:
    - components/ServiceSelector.tsx
    - components/CalendlyEmbed.tsx
    - app/services/ServicesContent.tsx
  modified:
    - app/services/page.tsx
    - package.json
decisions:
  - id: "serv-server-client-split"
    description: "Split services page into server component (metadata) + client wrapper (state/scroll)"
    rationale: "SEO metadata requires server component; Calendly and selection state require client"
metrics:
  duration: "~5 min"
  completed: "2026-01-31"
---

# Phase 2 Plan 3: Services Page with Selector and Calendly Booking Summary

**One-liner:** Interactive service selector with Calendly InlineWidget booking, server-client split for SEO metadata

## What Was Done

### Task 1: ServiceSelector + CalendlyEmbed components
- **ServiceSelector**: 3-card grid with selected/dimmed states, scroll reveal animation, accent glow on selection
- **CalendlyEmbed**: react-calendly InlineWidget with dark theme (0a0a0a bg, ffffff text, gold primary), shows selected service context
- Installed react-calendly dependency

### Task 2: Services page wiring
- Server component (`page.tsx`) exports static metadata for SEO
- Client wrapper (`ServicesContent.tsx`) manages selectedService state and smooth scroll to Calendly on selection
- Page sections: overview heading (SERV-01), service selector (SERV-02), Calendly embed (SERV-03), custom pricing CTA (SERV-04)

## Requirements Satisfied

| Requirement | Status |
|-------------|--------|
| SERV-01: Service overview | Done |
| SERV-02: Service selection | Done |
| SERV-03: Calendly booking | Done |
| SERV-04: Contact/pricing CTA | Done |

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Hash | Message |
|------|---------|
| 5df5efc | feat(02-03): add ServiceSelector and CalendlyEmbed components |
| d7749b2 | feat(02-03): wire services page with state management and Calendly booking |

## Next Phase Readiness

- Services page complete with all 4 SERV requirements
- Calendly URL is placeholder (`shrike-media/consultation`) - needs real URL when Calendly account is set up
- Build passing, all routes render
