# Plan 03-01 Summary: Anonymous Likes & Comments

**Status:** Complete
**Executed:** 2026-02-08

## What Was Built

### Device ID System
- `hooks/useDeviceId.ts` — SSR-safe hook using `crypto.randomUUID()` stored in localStorage (`shrike_gallery_device`)
- Returns `string | null` (null during SSR/first render)

### Like System
- `components/gallery/LikeButton.tsx` — Heart toggle with optimistic UI
- Heart SVG fills coral on like, animates with 300ms scale pop
- `e.stopPropagation()` prevents lightbox opening when tapping heart
- Wrapped in `React.memo` to prevent unnecessary re-renders
- Integrated into MasonryGrid via `render.image` callback

### Comment System (Guest Book)
- `components/gallery/CommentSection.tsx` — Form + list component
- Event-level guestbook (comments attached to first photo's ID as convention)
- Optional display name (defaults to "Guest"), 500 char body limit
- Character counter turns coral above 450 chars
- Relative time display ("just now", "2m ago", "1h ago", "3d ago")
- "Show more" pagination at 20 comments

### Data Layer
- `lib/gallery.ts` — Added `fetchUserLikes()` and `fetchComments()`
- `types/gallery.ts` — Added `GalleryComment` interface

## Issues Encountered

1. **Nested button hydration error**: react-photo-album wraps photos in `<button>` when `onClick` is provided. LikeButton (also `<button>`) inside caused invalid HTML. Fixed by removing `onClick` from MasonryPhotoAlbum and using a `<div role="button">` wrapper in ImageWithPlaceholder.

2. **Column name mismatch**: DB uses `author_name` but code initially used `display_name`. Supabase returned 400 on INSERT. Fixed by correcting all references to `author_name`.

## Files Changed

| File | Action |
|------|--------|
| `hooks/useDeviceId.ts` | Created |
| `components/gallery/LikeButton.tsx` | Created |
| `components/gallery/CommentSection.tsx` | Created |
| `types/gallery.ts` | Modified (added GalleryComment) |
| `lib/gallery.ts` | Modified (added fetchUserLikes, fetchComments) |
| `components/gallery/MasonryGrid.tsx` | Modified (integrated likes, fixed button nesting) |
| `app/(gallery)/gallery/GalleryContent.tsx` | Modified (added CommentSection) |
| `app/(gallery)/gallery.css` | Modified (like overlay, heart animation, comment styles) |
