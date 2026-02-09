# Plan 03-02 Summary: Spam Protection, Moderation & Download

**Status:** Complete
**Executed:** 2026-02-08

## What Was Built

### Spam Protection (3 Client-Side Layers)
- **Honeypot field**: Hidden input (`position: absolute; left: -9999px`), silent reject if filled
- **Time check**: Form records render timestamp, silent reject if submitted within 2 seconds
- **Profanity filter**: `obscenity` npm package with English dataset, visible error message on match

### Server-Side Rate Limiting
- Already existed from Phase 1 DB triggers: max 3 comments per device_id per 5 minutes
- CommentSection handles the "Too many comments" error from Supabase with user-friendly message

### Moderation Endpoint
- `app/api/gallery/moderate/route.ts` — POST endpoint
- Auth: `Authorization: Bearer {SUPABASE_SERVICE_ROLE_KEY}`
- Soft-delete: sets `is_visible = false` on target comment
- Creates per-request admin Supabase client with service role key

### Photo Download
- Added `Download` plugin to `yet-another-react-lightbox` in GalleryLightbox
- Custom `downloadPhoto()` function using fetch → blob → createObjectURL → click pattern
- Needed because `download` attribute is ignored for cross-origin URLs (Supabase Storage)
- Falls back to `window.open()` if fetch fails

## Dependencies Added
- `obscenity` — Profanity filter with English dataset

## Files Changed

| File | Action |
|------|--------|
| `lib/profanity.ts` | Created |
| `app/api/gallery/moderate/route.ts` | Created |
| `components/gallery/CommentSection.tsx` | Modified (added honeypot, time check, profanity) |
| `components/gallery/GalleryLightbox.tsx` | Modified (added Download plugin) |
| `app/(gallery)/gallery.css` | Modified (download button styling) |
