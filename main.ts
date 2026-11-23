// main.ts — news-image-20261123 entry program.
// Copies the repo's entry.png (the 23 November 2026 world-news front page)
// into the output directory as entry.png. No network, no randomness:
// two runs write byte-identical output.
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const repoDir = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const src = join(repoDir, "entry.png");
const dst = join(outDir, "entry.png");
// Fail loudly (instead of a cryptic ENOENT from copyFileSync) if the
// entry image is missing from the repo.
if (!existsSync(src)) {
  throw new Error(`entry.png missing from repo: ${src}`);
}
// The entry must be a real PNG, not a truncated or misnamed file:
// verify its magic bytes before copying it anywhere.
const header = readFileSync(src).subarray(0, 8);
if (!header.equals(PNG_SIGNATURE)) {
  throw new Error("entry.png is not a valid PNG (bad magic bytes)");
}
copyFileSync(src, dst);
// Guard: the copy must be complete, or fail loudly instead of shipping a
// truncated image.
if (statSync(src).size !== statSync(dst).size) {
  throw new Error("entry.png copy incomplete");
}
// Re-verify the copy itself: same size is not enough if the write was
// corrupted, so check the destination's magic bytes too.
const dstHeader = readFileSync(dst).subarray(0, 8);
if (!dstHeader.equals(PNG_SIGNATURE)) {
  throw new Error("copied entry.png is not a valid PNG (bad magic bytes)");
}
