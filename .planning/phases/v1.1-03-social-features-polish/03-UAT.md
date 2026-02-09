---
status: complete
phase: 03-social-features-polish
source: 03-01-SUMMARY.md, 03-02-SUMMARY.md
started: 2026-02-08T20:00:00Z
updated: 2026-02-08T20:20:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Like a Photo
expected: On the gallery page, tap/click a heart icon on any photo. The heart should fill with coral color, the count should increment by 1, and there should be a brief scale-pop animation on the heart.
result: pass

### 2. Unlike a Photo
expected: Tap/click the same heart again. The heart should return to outline (unfilled), and the count should decrement by 1.
result: pass

### 3. Like Persists on Refresh
expected: Like a photo, then refresh the page. The heart should still be filled and the count should remain. Your like persists because it's tied to your device ID in localStorage.
result: pass

### 4. Like Does Not Open Lightbox
expected: When you tap the heart icon on a photo, only the like toggles. The lightbox should NOT open. Tapping the photo itself (not the heart) should open the lightbox.
result: pass

### 5. Post a Comment
expected: Scroll to the "Guest Book" section below the photos. Enter a name (optional) and a comment, then click "Post Comment". The comment should appear immediately at the top of the list with your name and "just now" timestamp.
result: pass

### 6. Comment Character Limit
expected: In the Guest Book textarea, type a long message approaching 500 characters. A counter should display (e.g., "450/500"). The counter turns coral when above 450. You cannot type beyond 500 characters. The "Post Comment" button is disabled when the textarea is empty.
result: pass

### 7. Guest Default Name
expected: Leave the name field blank and post a comment. The comment should appear with "Guest" as the author name.
result: pass

### 8. Profanity Filter
expected: Try posting a comment containing an obvious profanity. You should see an error message: "Please rephrase your message — some words aren't allowed." The comment should NOT be posted.
result: pass

### 9. Photo Download from Lightbox
expected: Click a photo to open the lightbox. In the lightbox toolbar, you should see a download icon/button. Click it. The full-size photo should download to your device (or your browser should prompt to save it).
result: issue
reported: "It does download, but it's downloading in webp. Can we change this to something more standard like png or jpg or jpeg"
severity: minor

### 10. Lightbox Navigation Still Works
expected: With the lightbox open, swipe left/right (mobile) or use arrow keys (desktop) to navigate between photos. Pinch-to-zoom should work on mobile. Press ESC or tap outside to close.
result: pass

## Summary

total: 10
passed: 9
issues: 1
pending: 0
skipped: 0

## Gaps

- truth: "Download button in lightbox triggers native file download of full-size photo in a standard format (jpg/png)"
  status: fixed
  reason: "User reported: It does download, but it's downloading in webp. Can we change this to something more standard like png or jpg or jpeg"
  severity: minor
  test: 9
  root_cause: "Upload script converted all images to webp. Download function served as-is."
  fix: "1) Upload script now outputs full-size as JPEG (thumbs stay webp). 2) Download function converts any format to JPEG via OffscreenCanvas before triggering download."
  artifacts:
    - path: "scripts/upload-photos.ts"
      issue: "Full-size images output as webp instead of jpeg"
    - path: "components/gallery/GalleryLightbox.tsx"
      issue: "Download served raw blob without format conversion"
