# New Gallery Page

End-to-end gallery setup: config entry + Supabase event record + photo upload + build verification.

## Instructions

When this command is invoked:

1. **Read the current config** — Read `lib/event-configs.ts` to see existing entries and avoid slug collisions.

2. **Ask the user these questions** using AskUserQuestion (group into rounds of up to 4):

   **Round 1: Event identity**
   - **Event name**: What's the display name? (e.g., "Spring Formal 2026")
   - **Event date**: When was the event? (YYYY-MM-DD format)
   - **Theme**: Which visual theme?
     - `default` — Warm chocolate palette with memphis geometric dividers
     - `blacklight` — Deep purple/UV palette with glowing dot dividers

   **Round 2: Photos & slugs**
   - **Photo directory**: Where are the source photos on disk? (e.g., `G:\My Drive\Events\Spring Formal`)
   - **URL slug**: What should the URL be? (e.g., `/events/spring-formal`) — suggest a kebab-case version of the event name. This MUST NOT collide with an existing config key.
   - **Supabase slug**: What slug for the Supabase `events` table? — suggest it match the URL slug unless the user wants them different
   - **Upload mode**: How are the photos organized?
     - `flat` — All photos in one directory (default, most common)
     - `subdirs <name>` — Photos in subdirectories matching a folder name (e.g., `--subdirs final`)
     - `recursive` — Walk all subdirectories

   **Round 3: Optional features** (ask only if user hasn't already said "no extras" or similar)
   - **Promo popup**: Should this gallery show a promotional popup? (yes/no)
     - If yes: What's the banner text? What offers to show? (title + description for each)
   - **Description**: Optional event description for Supabase record

3. **Create Supabase event record** — Run the create-event script:
   ```
   npx tsx scripts/create-event.ts --slug <supabaseSlug> --title "<event name>" --date <YYYY-MM-DD> --publish
   ```
   Add `--description "<text>"` if the user provided one. Note the event ID from the output.

4. **Upload photos** — Run the upload script:
   ```
   npx tsx scripts/upload.ts --event <supabaseSlug> --dir "<photo directory>"
   ```
   Add `--subdirs <name>` or `--recursive` based on the upload mode chosen. Consider running with `--dry-run` first if the user wants to verify, then run for real.

   This script automatically:
   - Resizes to 1600px full + 400px thumb
   - Generates blurhash placeholders
   - Uploads to Supabase storage (`event-photos` bucket, `/full/` and `/thumb/` paths)
   - Creates photo records in the `photos` table
   - Skips already-uploaded photos (diff-based)

5. **Add the config entry** — Edit `lib/event-configs.ts` and add the new entry to the `eventConfigs` object. Follow the existing format exactly.

6. **Verify build** — Run `npx next build` to confirm the new route generates correctly. The build output should show the new path under `/events/[slug]`.

7. **Report** — Show the user:
   - Gallery URL: `/events/<url-slug>`
   - Number of photos uploaded
   - Any errors from the upload process
   - Remind them to deploy when ready: `npx vercel --prod --yes`

## Config Shape Reference

```typescript
{
  "url-slug": {
    supabaseSlug: "supabase-event-slug",
    theme: "default" | "blacklight",
    websiteLabel: "tracking-label",  // optional, defaults to URL slug
    promo: {                         // optional
      bannerText: "SPECIAL OFFER — ...",
      offers: [
        { title: "Offer Name", description: "Offer details." },
      ],
      delayMs: 15000,                // optional, default 15000
    },
  },
}
```

## Script Reference

**Create event:**
```
npx tsx scripts/create-event.ts --slug <slug> --title "<title>" --date <YYYY-MM-DD> [--description "<text>"] [--publish]
```

**Upload photos:**
```
npx tsx scripts/upload.ts --event <slug> --dir "<path>" [--subdirs <name>] [--recursive] [--dry-run] [--force]
```

$ARGUMENTS
