/**
 * Cull obviously bad photos — out of focus or wildly overexposed.
 *
 * Usage:
 *   npx tsx scripts/cull-photos.ts --event 2016-night-at-press-club [--dry-run]
 *
 * Analyzes all photos for an event, computes blur and overexposure metrics,
 * then removes photos outside 1 standard deviation from the mean.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

interface PhotoRow {
  id: string;
  thumb_path: string;
  filename: string;
}

interface PhotoMetrics {
  photo: PhotoRow;
  blurScore: number;       // Laplacian variance — low = blurry
  overexposurePct: number; // % of pixels near max brightness — high = blown out
}

function parseArgs() {
  const args = process.argv.slice(2);
  let event = "";
  let dryRun = false;
  let blurOnly = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--event" && args[i + 1]) event = args[++i];
    if (args[i] === "--dry-run") dryRun = true;
    if (args[i] === "--blur-only") blurOnly = true;
  }

  if (!event) {
    console.error("Usage: npx tsx scripts/cull-photos.ts --event <slug> [--dry-run] [--blur-only]");
    process.exit(1);
  }

  return { event, dryRun, blurOnly };
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  return createClient(url, key);
}

/**
 * Compute blur score using center-crop p95 Laplacian.
 *
 * Analyzes only the center 50% of the image where subjects typically are,
 * ignoring neon signs and bright lights in the background/periphery that
 * can inflate sharpness metrics for out-of-focus photos.
 */
async function computeBlurScore(buffer: Buffer): Promise<number> {
  const { data, info } = await sharp(buffer)
    .greyscale()
    .resize(200, 200, { fit: "inside" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;

  // Center 50% crop bounds
  const x0 = Math.floor(w * 0.25);
  const y0 = Math.floor(h * 0.25);
  const x1 = Math.floor(w * 0.75);
  const y1 = Math.floor(h * 0.75);

  const lapValues: number[] = [];

  for (let y = Math.max(y0, 1); y < Math.min(y1, h - 1); y++) {
    for (let x = Math.max(x0, 1); x < Math.min(x1, w - 1); x++) {
      const idx = y * w + x;
      lapValues.push(Math.abs(
        -4 * data[idx] +
        data[idx - 1] + data[idx + 1] +
        data[idx - w] + data[idx + w]
      ));
    }
  }

  lapValues.sort((a, b) => a - b);
  return lapValues[Math.floor(lapValues.length * 0.95)];
}

/** Compute percentage of pixels that are near max brightness (>240 out of 255). */
async function computeOverexposurePct(buffer: Buffer): Promise<number> {
  const { data, info } = await sharp(buffer)
    .resize(200, 200, { fit: "inside" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  const pixelCount = data.length / channels;
  let blownOut = 0;

  for (let i = 0; i < data.length; i += channels) {
    // Average across RGB channels
    let sum = 0;
    for (let c = 0; c < Math.min(channels, 3); c++) {
      sum += data[i + c];
    }
    const avg = sum / Math.min(channels, 3);
    if (avg > 240) blownOut++;
  }

  return (blownOut / pixelCount) * 100;
}

async function main() {
  const { config } = await import("dotenv");
  config({ path: ".env.local" });

  const { event, dryRun, blurOnly } = parseArgs();
  const supabase = getSupabase();

  // Get event ID
  const { data: eventRow } = await supabase
    .from("events")
    .select("id")
    .eq("slug", event)
    .single();

  if (!eventRow) {
    console.error(`Event "${event}" not found.`);
    process.exit(1);
  }

  // Fetch all photos
  const { data: photos } = await supabase
    .from("photos")
    .select("id, thumb_path, filename, storage_path")
    .eq("event_id", eventRow.id)
    .order("sort_order", { ascending: true });

  if (!photos || photos.length === 0) {
    console.error("No photos found for this event.");
    process.exit(1);
  }

  console.log(`Analyzing ${photos.length} photos...\n`);

  // Analyze each photo
  const metrics: PhotoMetrics[] = [];
  let analyzed = 0;

  for (const photo of photos) {
    try {
      // Download thumbnail from Supabase storage
      const { data: fileData, error } = await supabase.storage
        .from("event-photos")
        .download(photo.thumb_path);

      if (error || !fileData) {
        console.error(`  Skip ${photo.filename}: download failed`);
        continue;
      }

      const buffer = Buffer.from(await fileData.arrayBuffer());
      const blurScore = await computeBlurScore(buffer);
      const overexposurePct = await computeOverexposurePct(buffer);

      metrics.push({ photo, blurScore, overexposurePct });
      analyzed++;

      if (analyzed % 50 === 0) {
        console.log(`  Analyzed ${analyzed}/${photos.length}...`);
      }
    } catch (err) {
      console.error(`  Skip ${photo.filename}: ${err}`);
    }
  }

  console.log(`\nAnalyzed ${metrics.length} photos successfully.\n`);

  // Compute statistics
  const blurScores = metrics.map((m) => m.blurScore);
  const exposureScores = metrics.map((m) => m.overexposurePct);

  const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const stdDev = (arr: number[]) => {
    const m = mean(arr);
    return Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length);
  };

  const blurMean = mean(blurScores);
  const blurStd = stdDev(blurScores);
  const exposureMean = mean(exposureScores);
  const exposureStd = stdDev(exposureScores);

  console.log(`Blur scores     — mean: ${blurMean.toFixed(1)}, std: ${blurStd.toFixed(1)}, threshold: < ${(blurMean - blurStd).toFixed(1)}`);
  console.log(`Overexposure %  — mean: ${exposureMean.toFixed(1)}%, std: ${exposureStd.toFixed(1)}%, threshold: > ${(exposureMean + exposureStd).toFixed(1)}%\n`);

  // Flag outliers: blurry (low Laplacian variance) OR wildly overexposed
  const blurThreshold = blurMean - blurStd;
  const exposureThreshold = exposureMean + exposureStd;

  const flagged = metrics.filter((m) => {
    const isBlurry = m.blurScore < blurThreshold;
    const isOverexposed = m.overexposurePct > exposureThreshold;
    return blurOnly ? isBlurry : (isBlurry || isOverexposed);
  });

  // Separate by reason for reporting
  const blurry = flagged.filter((m) => m.blurScore < blurThreshold);
  const overexposed = flagged.filter((m) => m.overexposurePct > exposureThreshold);
  const both = flagged.filter(
    (m) => m.blurScore < blurThreshold && m.overexposurePct > exposureThreshold
  );

  console.log(`Flagged ${flagged.length} photos for removal:`);
  console.log(`  ${blurry.length} blurry (score < ${blurThreshold.toFixed(1)})`);
  console.log(`  ${overexposed.length} overexposed (> ${exposureThreshold.toFixed(1)}% blown out)`);
  console.log(`  ${both.length} both\n`);

  if (flagged.length === 0) {
    console.log("Nothing to cull — all photos within acceptable range.");
    return;
  }

  // Deduplicate flagged list
  const uniqueFlagged = [...new Map(flagged.map((m) => [m.photo.id, m])).values()];

  // Print flagged photos
  for (const m of uniqueFlagged) {
    const reasons: string[] = [];
    if (m.blurScore < blurThreshold) reasons.push(`blur=${m.blurScore.toFixed(0)}`);
    if (m.overexposurePct > exposureThreshold) reasons.push(`overexposed=${m.overexposurePct.toFixed(1)}%`);
    console.log(`  ${m.photo.filename} — ${reasons.join(", ")}`);
  }

  if (dryRun) {
    console.log(`\n--dry-run: No photos were deleted.`);
    return;
  }

  // Delete flagged photos
  console.log(`\nDeleting ${uniqueFlagged.length} photos...`);
  let deleted = 0;

  for (const m of uniqueFlagged) {
    const photo = m.photo as PhotoRow & { storage_path: string };

    // Delete from storage (thumb + full)
    await supabase.storage.from("event-photos").remove([photo.thumb_path, photo.storage_path]);

    // Delete metadata row
    const { error } = await supabase.from("photos").delete().eq("id", photo.id);
    if (error) {
      console.error(`  Failed to delete ${photo.filename}: ${error.message}`);
      continue;
    }

    deleted++;
  }

  console.log(`\nDone! Removed ${deleted}/${uniqueFlagged.length} photos. ${photos.length - deleted} remain.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
