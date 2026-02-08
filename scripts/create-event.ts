/**
 * Create an event record in Supabase.
 *
 * Usage:
 *   npx tsx scripts/create-event.ts --slug winery-event-2026 --title "Winery Event 2026" --date 2026-03-15
 *
 * Optional:
 *   --description "Event description text"
 *   --publish       (set is_published = true immediately)
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";

function parseArgs() {
  const args = process.argv.slice(2);
  let slug = "";
  let title = "";
  let date = "";
  let description = "";
  let publish = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
    if (args[i] === "--title" && args[i + 1]) title = args[++i];
    if (args[i] === "--date" && args[i + 1]) date = args[++i];
    if (args[i] === "--description" && args[i + 1]) description = args[++i];
    if (args[i] === "--publish") publish = true;
  }

  if (!slug || !title || !date) {
    console.error("Usage: npx tsx scripts/create-event.ts --slug <slug> --title <title> --date <YYYY-MM-DD>");
    process.exit(1);
  }

  return { slug, title, date, description, publish };
}

async function main() {
  const { config } = await import("dotenv");
  config({ path: ".env.local" });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const { slug, title, date, description, publish } = parseArgs();

  const { data, error } = await supabase.from("events").insert({
    slug,
    title,
    date,
    description: description || null,
    is_published: publish,
  }).select().single();

  if (error) {
    console.error(`Failed to create event: ${error.message}`);
    process.exit(1);
  }

  console.log(`Event created successfully!`);
  console.log(`  ID: ${data.id}`);
  console.log(`  Slug: ${data.slug}`);
  console.log(`  Title: ${data.title}`);
  console.log(`  Date: ${data.date}`);
  console.log(`  Published: ${data.is_published}`);
  console.log(`\nGallery URL: /gallery?event=${data.slug}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
