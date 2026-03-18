#!/usr/bin/env node
/**
 * Generates Chrome extension icons (16, 48, 128) from ssl-icon.png source.
 */
import sharp from "sharp";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const source = join(root, "public", "icons", "ssl-icon.png");

for (const size of [16, 48, 128]) {
  const outPath = join(root, "public", "icons", `icon${size}.png`);
  await sharp(source).resize(size, size).png().toFile(outPath);
  console.log(`Generated: ${outPath}`);
}
