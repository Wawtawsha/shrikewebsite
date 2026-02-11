# Event Gallery Build Guide

How to build a new event gallery page from scratch. Reference implementation: **2016 Night at Press Club** (`/events/pressclub`).

---

## Architecture Overview

Event galleries live in the `app/(events)/` route group, isolated from the main site and the Rosemont gallery. They share reusable components from `components/gallery/*` but have their own CSS theme.

```
app/(events)/
  layout.tsx              <- Route group layout (imports events.css, wraps in .events-theme)
  events.css              <- Theme variables + all component styles
  events/
    pressclub/
      page.tsx            <- Server component (data fetching, error states)
      PressClubContent.tsx <- Client component (UI, interactivity, tracking)
```

### Shared components (no changes needed)
- `components/gallery/MasonryGrid.tsx` — Infinite-scroll masonry photo grid
- `components/gallery/GalleryLightbox.tsx` — Lightbox with download button
- `components/gallery/LikeButton.tsx` — Heart overlay on photos
- `components/gallery/GuestBookBlade.tsx` — Side panel guest book
- `components/gallery/CommentSection.tsx` — Comment form + list
- `components/gallery/BlurhashPlaceholder.tsx` — Blur placeholder while loading

These all reference CSS variables (`--color-accent`, `--color-background`, etc.) so they automatically adopt whatever theme the route group defines.

---

## Step-by-Step: Adding a New Event Gallery

### 1. Create Supabase Event Record

```sql
INSERT INTO events (slug, title, date, description, is_published)
VALUES ('your-event-slug', 'Event Title', '2026-01-01', 'Description here.', true);
```

### 2. Upload Photos

Use the upload script. For flat directories:
```bash
npx tsx scripts/upload-photos.ts --event your-event-slug --dir "G:\path\to\photos"
```

For nested directories (photos in specific subdirectories):
```bash
npx tsx scripts/upload-photos.ts --event your-event-slug --dir "G:\path\to\root" --subdirs final
```

The `--subdirs` flag recursively finds all directories matching that name (case-insensitive) and uploads images from each. Filenames are prefixed with the parent directory name to prevent collisions.

### 3. Cull Bad Photos (Optional)

Remove blurry and overexposed photos:
```bash
# Preview what would be removed
npx tsx scripts/cull-photos.ts --event your-event-slug --dry-run

# Remove blurry only (recommended for dark/neon venues)
npx tsx scripts/cull-photos.ts --event your-event-slug --blur-only

# Remove both blurry and overexposed
npx tsx scripts/cull-photos.ts --event your-event-slug
```

The cull script uses **center-crop P95 Laplacian** — it analyzes only the center 50% of each image to avoid false positives from bright neon signs or lights in the periphery of dark venue photos.

Remove duplicate database rows if any:
```bash
npx tsx scripts/dedup-photos.ts --event your-event-slug
```

### 4. Create Route Files

#### `app/(events)/events/yourpage/page.tsx` (Server Component)

```tsx
import { Suspense } from "react";
import { fetchEvent, fetchPhotos } from "@/lib/gallery";
import { YourPageContent } from "./YourPageContent";

const SLUG = "your-event-slug";

export default async function YourPage() {
  const event = await fetchEvent(SLUG);

  if (!event) {
    return (
      <main id="main-content" className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Gallery Coming Soon
          </h1>
          <p style={{ color: "var(--color-muted)" }}>Check back soon!</p>
        </div>
      </main>
    );
  }

  const { photos, totalCount, hasMore } = await fetchPhotos(event.id, 0, 50);

  return (
    <Suspense fallback={<p style={{ color: "var(--color-muted)" }}>Loading gallery...</p>}>
      <YourPageContent event={event} initialPhotos={photos} totalCount={totalCount} hasMore={hasMore} />
    </Suspense>
  );
}
```

#### `app/(events)/events/yourpage/YourPageContent.tsx` (Client Component)

Key pieces to include:
- `useNessusTracking("Page Name", "your-client-uuid")` for analytics
- `MasonryGrid` for the photo grid
- `GuestBookBlade` for the side-panel guest book
- Promo popup (optional) — uses native `<dialog>` with `sessionStorage` dismissal
- Sticky promo banner (optional) — reopens the popup on click
- "Book Us" FAB (optional) — links to Calendly, stacked above Guest Book FAB
- Tip buttons — PayPal and CashApp links

See `PressClubContent.tsx` as the reference implementation.

### 5. Nessus Tracking

The `useNessusTracking` hook accepts an optional `clientId` parameter:
```ts
// Uses default Rosemont client
useNessusTracking("Page Name");

// Uses custom client ID
useNessusTracking("Page Name", "a1b2c3d4-e5f6-7890-abcd-ef1234567890");
```

---

## Theme System

The `events.css` file uses Tailwind v4's `@theme` directive to define CSS custom properties. All shared gallery components reference these variables, so changing the theme automatically reskins everything.

### Current Theme: Dark Choco-Memphis

| Token | Value | Purpose |
|-------|-------|---------|
| `--color-background` | `oklch(0.11 0.02 55)` | Deep dark chocolate |
| `--color-surface` | `oklch(0.15 0.02 55)` | Card/panel backgrounds |
| `--color-surface-elevated` | `oklch(0.19 0.02 55)` | Elevated surfaces, inputs |
| `--color-foreground` | `oklch(0.92 0.02 75)` | Warm cream text |
| `--color-muted` | `oklch(0.58 0.03 55)` | Secondary text |
| `--color-subtle` | `oklch(0.42 0.02 55)` | Tertiary text |
| `--color-accent` | `oklch(0.68 0.14 65)` | Orange/gold accent |
| `--color-accent-hover` | `oklch(0.62 0.16 65)` | Darker accent on hover |
| `--color-accent-soft` | `oklch(0.22 0.05 65)` | Soft glow background |
| `--color-heart` | `oklch(0.65 0.17 50)` | Like button heart color |
| `--color-border` | `oklch(0.22 0.02 55)` | Standard border |
| `--color-border-subtle` | `oklch(0.18 0.02 55)` | Subtle border |

### Creating a New Theme

To create a different theme for another event, you can either:
1. **Edit `events.css`** if all events share one theme
2. **Create a new route group** (e.g., `app/(gala)/`) with its own CSS file and `@theme` block

The key is that the CSS variable names must match — the shared components depend on them.

### Fonts

- `--font-sans`: Inter (body text)
- `--font-display`: Syne (bold headings, Memphis style)
- `--font-mono`: Source Code Pro

Syne was added to `lib/fonts.ts` and its CSS variable `--font-syne` is applied to the body in `app/layout.tsx`.

---

## UI Components Explained

### Promo Popup

Native `<dialog>` element with `showModal()` / `close()`.

**Behavior:**
- Appears after a 15-second delay (not immediately)
- Dismissed via close button, clicking backdrop, or ESC
- Dismissal stored in `sessionStorage` — won't show again in same session
- Can be reopened via the sticky banner

**Styling notes:**
- Centered with `position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); margin: 0;`
- `overflow: hidden` on the dialog is required for the corner ribbon to clip properly
- Backdrop uses `backdrop-filter: blur(4px)` for frosted glass effect

### Corner Ribbon ("SPECIAL OFFER")

CSS-only diagonal ribbon in the top-left corner of the popup.

```css
.promo-ribbon {
  position: absolute;
  top: 0; left: 0;
  width: 120px; height: 120px;   /* Clipping container */
  overflow: hidden;
}

.promo-ribbon span {
  position: absolute;
  top: 24px; left: -68px;        /* Position for centering text on diagonal */
  width: 220px;                   /* Must be wide enough that both ends clip */
  transform: rotate(-45deg);
}
```

**Critical geometry rule:** The span width must be large enough that both rectangular endpoints fall *outside* the clipping container after rotation. If the span is too narrow, the square corners become visible. The `left` offset controls text centering — more negative = text shifts toward top-left corner.

### Sticky Banner

A `position: sticky; top: 0` button at the top of the page. Clicking it calls `promoRef.current?.showModal()` to reopen the popup.

### Floating Action Buttons (FABs)

Two stacked FABs in the bottom-right:
- **Book Us** (`bottom: 84px`) — outlined style, links to Calendly
- **Guest Book** (`bottom: 24px`) — solid gold, opens the comment blade

Both hidden when the guest book blade is open (`!bladeOpen` guard).

### Memphis Decorative Divider

Pure CSS geometric shapes:
```html
<div className="memphis-divider">
  <span className="memphis-triangle" />
  <span className="memphis-circle" />
  <span className="memphis-square" />
  <span className="memphis-circle" />
  <span className="memphis-triangle" />
</div>
```

### Tip Buttons

PayPal and CashApp buttons in the header. Current links:
- PayPal: `https://www.paypal.com/biz/profile/shrikemedia`
- CashApp: `https://cash.app/$wawtawsha`

---

## External Links Reference

| Purpose | URL |
|---------|-----|
| Calendly booking | `https://calendly.com/realshrikeproductions/technical-consultation?month=2026-02` |
| Instagram | `https://www.instagram.com/shrikeproductions/` |
| PayPal tips | `https://www.paypal.com/biz/profile/shrikemedia` |
| CashApp tips | `https://cash.app/$wawtawsha` |

---

## Photo Culling: Lessons Learned

When culling photos from dark venue events (bars, clubs, etc.), standard blur detection fails because bright neon signs inflate sharpness metrics even on out-of-focus photos.

**Metrics tried and results:**

| Metric | Result |
|--------|--------|
| Laplacian variance (whole image) | Defeated by neon — blurry photos with bright signs scored as sharp |
| Edge density (% pixels > threshold) | Insufficient discrimination — all photos scored 40-55% |
| P95 Laplacian (whole image) | Better separation, but peripheral neon still caused false negatives |
| **Center-crop P95 Laplacian** | **Best results** — analyzes only center 50%, ignores peripheral neon |

The center-crop approach works because subjects are typically in the center of frame while neon signs and bright lights are in the background/periphery.

---

## Deployment

```bash
npm run build          # Verify no errors
git add <files>
git commit -m "message"
git push
npx vercel --prod      # Deploy to production
```

Production URL: `https://shrike.vercel.app/events/pressclub`

---

## File Inventory

| File | Purpose |
|------|---------|
| `app/(events)/layout.tsx` | Route group layout, imports theme CSS |
| `app/(events)/events.css` | Full theme + all component styles (614 lines) |
| `app/(events)/events/pressclub/page.tsx` | Server component, data fetching |
| `app/(events)/events/pressclub/PressClubContent.tsx` | Client component, all UI |
| `lib/fonts.ts` | Syne font definition (added for Memphis style) |
| `app/layout.tsx` | Root layout (syne.variable added to body) |
| `hooks/useNessusTracking.ts` | Analytics hook (clientId param added) |
| `components/gallery/MasonryGrid.tsx` | Infinite-scroll masonry grid (shared) |
| `components/gallery/GuestBookBlade.tsx` | Side panel guest book (shared) |
| `scripts/upload-photos.ts` | Photo upload with --subdirs support |
| `scripts/cull-photos.ts` | Automated blur/overexposure culling |
| `scripts/dedup-photos.ts` | Duplicate row cleanup |
