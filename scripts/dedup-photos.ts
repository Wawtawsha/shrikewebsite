/**
 * Remove duplicate photo rows (same thumb_path) and re-run blur cull
 * with center-crop analysis.
 *
 * Usage:
 *   npx tsx scripts/dedup-photos.ts --event 2016-night-at-press-club [--dry-run]
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const slug = process.argv[process.argv.indexOf("--event") + 1];

  const { data: ev } = await sb.from("events").select("id").eq("slug", slug).single();
  if (!ev) { console.error("Event not found"); process.exit(1); }

  const { data: photos } = await sb
    .from("photos")
    .select("id, filename, thumb_path, created_at")
    .eq("event_id", ev.id)
    .order("created_at", { ascending: true });

  if (!photos) { console.error("No photos"); process.exit(1); }

  // Find duplicates — keep the first row, delete later ones
  const seen = new Map<string, string>();
  const dupeIds: string[] = [];

  for (const p of photos) {
    if (seen.has(p.thumb_path)) {
      dupeIds.push(p.id);
    } else {
      seen.set(p.thumb_path, p.id);
    }
  }

  console.log(`Total rows: ${photos.length}`);
  console.log(`Unique photos: ${seen.size}`);
  console.log(`Duplicate rows to remove: ${dupeIds.length}`);

  if (dupeIds.length === 0) {
    console.log("No duplicates found.");
    return;
  }

  if (dryRun) {
    console.log("\n--dry-run: No rows deleted.");
    return;
  }

  // Delete in batches of 50
  let deleted = 0;
  for (let i = 0; i < dupeIds.length; i += 50) {
    const batch = dupeIds.slice(i, i + 50);
    const { error } = await sb.from("photos").delete().in("id", batch);
    if (error) {
      console.error(`Batch delete error: ${error.message}`);
    } else {
      deleted += batch.length;
      console.log(`  Deleted ${deleted}/${dupeIds.length}...`);
    }
  }

  console.log(`\nDone! Removed ${deleted} duplicate rows. ${seen.size} unique photos remain.`);
}

main().catch(console.error);
